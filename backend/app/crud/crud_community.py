from typing import List, Optional, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.community import CommunityPost, CommunityPostCreate, Comment
from app.models.user import User

async def create_post(db: AsyncIOMotorDatabase, post: CommunityPostCreate, author_id: str) -> CommunityPost:
    post_data = post.model_dump()
    post_data["author_id"] = author_id
    post_data["created_at"] = datetime.utcnow()
    post_data["likes"] = []
    post_data["dislikes"] = []
    post_data["comments"] = []
    
    result = await db["community_posts"].insert_one(post_data)
    # created_post = await db["community_posts"].find_one({"_id": result.inserted_id})
    # return CommunityPost(**created_post)
    return await get_post_with_author(db, str(result.inserted_id))

async def get_posts_with_authors(
    db: AsyncIOMotorDatabase, 
    skip: int = 0, 
    limit: int = 10,
    sort_by: str = "latest", # latest, popular
    author_id: Optional[str] = None # For "My Posts"
) -> Tuple[List[dict], int]:
    
    pipeline = []
    
    # Filtering
    match_stage = {}
    if author_id:
        match_stage["author_id"] = author_id
    
    if match_stage:
        pipeline.append({"$match": match_stage})

    # Sorting
    if sort_by == "popular":
        # Sort by length of likes array
        pipeline.append({
            "$addFields": {
                "likes_count": {"$size": "$likes"}
            }
        })
        pipeline.append({"$sort": {"likes_count": -1, "created_at": -1}})
    else:
        pipeline.append({"$sort": {"created_at": -1}})

    # Pagination
    pipeline.append({"$skip": skip})
    pipeline.append({"$limit": limit})

    # Joins
    pipeline.append({
        "$addFields": {
            "author_oid": {"$toObjectId": "$author_id"}
        }
    })
    pipeline.append({
        "$lookup": {
            "from": "users",
            "localField": "author_oid",
            "foreignField": "_id",
            "as": "author_info"
        }
    })
    pipeline.append({
        "$unwind": {
            "path": "$author_info",
            "preserveNullAndEmptyArrays": True
        }
    })
    pipeline.append({
        "$addFields": {
            "comments_count": {"$size": "$comments"}
        }
    })
    
    pipeline.append({
        "$project": {
            "_id": 1,
            "content": 1,
            "author_id": 1,
            "created_at": 1,
            "likes": 1,
            "dislikes": 1,
            "comments_count": 1,
            "images": 1,
            "author_name": "$author_info.full_name",
            "author_email": "$author_info.email"
        }
    })
    
    posts = await db["community_posts"].aggregate(pipeline).to_list(length=limit)
    
    # Count total for this filter
    total_query = {}
    if author_id:
        total_query["author_id"] = author_id
    total = await db["community_posts"].count_documents(total_query)
    
    # Convert _id to string
    for p in posts:
        p["_id"] = str(p["_id"])
        
    return posts, total

from app.crud import crud_notification
from app.models.notification import NotificationCreate, NotificationType

async def toggle_like(db: AsyncIOMotorDatabase, post_id: str, user_id: str, user_name: str = "Someone") -> Optional[dict]:
    try:
        oid = ObjectId(post_id)
    except:
        return None
        
    post = await db["community_posts"].find_one({"_id": oid})
    if not post:
        return None
        
    keyword = "$addToSet"
    if user_id in post.get("likes", []):
        keyword = "$pull" # Check if already liked, then unlike
    
    # If liking, remove dislike
    if keyword == "$addToSet":
        await db["community_posts"].update_one({"_id": oid}, {"$pull": {"dislikes": user_id}})
        
        # Create Notification (if not liking own post)
        if post["author_id"] != user_id:
            notification = NotificationCreate(
                user_id=post["author_id"],
                title="New Like",
                message=f"{user_name} liked your post.",
                type=NotificationType.SUCCESS,
                action_label="View Post",
                action_url=f"/dashboard/community" # Could be deep link if implemented
            )
            await crud_notification.create_notification(db, notification)

    await db["community_posts"].update_one(
        {"_id": oid}, 
        {keyword: {"likes": user_id}}
    )
    
    return await get_post_with_author(db, post_id)

async def toggle_dislike(db: AsyncIOMotorDatabase, post_id: str, user_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(post_id)
    except:
        return None

    post = await db["community_posts"].find_one({"_id": oid})
    if not post:
        return None

    keyword = "$addToSet"
    if user_id in post.get("dislikes", []):
        keyword = "$pull"

    # If disliking, remove like
    if keyword == "$addToSet":
        await db["community_posts"].update_one({"_id": oid}, {"$pull": {"likes": user_id}})
        
    await db["community_posts"].update_one(
        {"_id": oid},
        {keyword: {"dislikes": user_id}}
    )

    return await get_post_with_author(db, post_id)

async def add_comment(db: AsyncIOMotorDatabase, post_id: str, content: str, user: User, parent_id: Optional[str] = None) -> Optional[dict]:
    try:
        oid = ObjectId(post_id)
    except:
        return None
    
    # Get post to notify author
    post = await db["community_posts"].find_one({"_id": oid})
    if not post:
        return None

    comment = Comment(
        content=content,
        author_id=str(user.id),
        author_name=user.full_name or user.email,
        parent_id=parent_id
    )
    
    result = await db["community_posts"].update_one(
        {"_id": oid},
        {"$push": {"comments": comment.model_dump()}}
    )
    
    if result.matched_count == 0:
        return None
    
    # Create Notification for Post Author (if not own post)
    if post["author_id"] != str(user.id):
        notification = NotificationCreate(
            user_id=post["author_id"],
            title="New Comment",
            message=f"{user.full_name or 'Someone'} commented on your post.",
            type=NotificationType.INFO,
            action_label="View Comment",
            action_url=f"/dashboard/community"
        )
        await crud_notification.create_notification(db, notification)

    return await get_post_with_author(db, post_id)

async def get_post_with_author(db: AsyncIOMotorDatabase, post_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(post_id)
    except:
        return None
        
    pipeline = [
        {"$match": {"_id": oid}},
        {
            "$addFields": {
                "author_oid": {"$toObjectId": "$author_id"}
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "author_oid",
                "foreignField": "_id",
                "as": "author_info"
            }
        },
        {
            "$unwind": {
                "path": "$author_info",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$project": {
                "_id": 1,
                "content": 1,
                "author_id": 1,
                "created_at": 1,
                "likes": 1,
                "dislikes": 1,
                "comments": 1,
                "images": 1,
                "author_name": "$author_info.full_name",
                "author_email": "$author_info.email"
            }
        }
    ]
    
    posts = await db["community_posts"].aggregate(pipeline).to_list(length=1)
    if posts:
        posts[0]["_id"] = str(posts[0]["_id"])
        # Ensure comments_count is present even for single post
        posts[0]["comments_count"] = len(posts[0].get("comments", []))
        return posts[0]
    return None

from datetime import datetime
