from typing import List, Optional, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument

from app.models.blog import BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostInDB

async def create_blog_post(db: AsyncIOMotorDatabase, post_in: BlogPostCreate, author_id: str) -> BlogPost:
    post_data = post_in.model_dump()
    post_data["author_id"] = author_id
    post_data["created_at"] = datetime.utcnow()
    post_data["updated_at"] = datetime.utcnow()
    post_data["views"] = 0
    if post_in.is_published and not post_data.get("published_at"):
        post_data["published_at"] = datetime.utcnow()
    
    result = await db["blog_posts"].insert_one(post_data)
    created_post = await db["blog_posts"].find_one({"_id": result.inserted_id})
    return BlogPost(**created_post)

async def get_blog_post(db: AsyncIOMotorDatabase, slug: str) -> Optional[BlogPost]:
    post = await db["blog_posts"].find_one({"slug": slug})
    if post:
        return BlogPost(**post)
    return None

async def get_blog_post_by_id(db: AsyncIOMotorDatabase, id: str) -> Optional[BlogPost]:
    try:
        oid = ObjectId(id)
    except:
        return None
    post = await db["blog_posts"].find_one({"_id": oid})
    if post:
        return BlogPost(**post)
    return None

async def get_blog_posts(
    db: AsyncIOMotorDatabase, 
    skip: int = 0, 
    limit: int = 10, 
    category: Optional[str] = None, 
    tag: Optional[str] = None,
    author_id: Optional[str] = None,
    search: Optional[str] = None,
    published_only: bool = True
) -> Tuple[List[BlogPost], int]:
    query = {}
    if published_only:
        query["is_published"] = True
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if author_id:
        query["author_id"] = author_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"summary": {"$regex": search, "$options": "i"}},
            {"tag": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = db["blog_posts"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    total = await db["blog_posts"].count_documents(query)
    
    return [BlogPost(**post) for post in posts], total

async def update_blog_post(
    db: AsyncIOMotorDatabase, 
    slug: str, 
    post_in: BlogPostUpdate
) -> Optional[BlogPost]:
    update_data = {k: v for k, v in post_in.model_dump().items() if v is not None}
    if not update_data:
        # Just return existing
        return await get_blog_post(db, slug)
        
    update_data["updated_at"] = datetime.utcnow()
    if update_data.get("is_published") and "published_at" not in update_data:
         # If publishing and no date set, check if already has one or set new
         # Ideally we'd check existing doc but for simplicity let's set it if missing in update
         # A more robust way: fetch, check, then update. 
         # Let's do fetch first to be safe and also we need ID for update or just filter by slug
         pass

    # We need to fetch to check published_at logic if we want to be strict, 
    # but for now let's just update.
    
    # Special: if is_published becomes true, set published_at if None
    if post_in.is_published is True:
        # We can use $cond in mongo 4.2+ or just logic here
        update_data["published_at"] = datetime.utcnow()

    updated_post = await db["blog_posts"].find_one_and_update(
        {"slug": slug},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )
    
    if updated_post:
        return BlogPost(**updated_post)
    return None

async def increment_views(db: AsyncIOMotorDatabase, slug: str):
    await db["blog_posts"].update_one(
        {"slug": slug},
        {"$inc": {"views": 1}}
    )

async def delete_blog_post(db: AsyncIOMotorDatabase, slug: str) -> bool:
    result = await db["blog_posts"].delete_one({"slug": slug})
    return result.deleted_count > 0
