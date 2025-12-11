from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.api.deps import get_database, get_current_user
from app.models.community import CommunityPost, CommunityPostCreate, CommunityPostPagination
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.crud import crud_community
import math

router = APIRouter()

# 50 = Researcher Weight. 
# This ensures only researchers and above can access.
POST_ACCESS_WEIGHT = 50 

@router.get("/", response_model=CommunityPostPagination)
async def read_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    sort: str = Query("latest", regex="^(latest|popular)$"),
    filter: str = Query("all", regex="^(all|mine)$"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Retrieve community posts. Researcher+.
    """
    skip = (page - 1) * size
    
    author_id = str(current_user.id) if filter == "mine" else None
    
    items, total = await crud_community.get_posts_with_authors(
        db, 
        skip=skip, 
        limit=size, 
        sort_by=sort, 
        author_id=author_id
    )
    
    pages = math.ceil(total / size) if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{post_id}", response_model=CommunityPost)
async def read_post(
    post_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Get a specific post with comments.
    """
    post = await crud_community.get_post_with_author(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", response_model=CommunityPost)
async def create_post(
    post: CommunityPostCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Create a new post. Researcher+.
    """
    return await crud_community.create_post(db, post, str(current_user.id))

@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Toggle like on a post.
    """
    post = await crud_community.toggle_like(db, post_id, str(current_user.id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{post_id}/dislike")
async def dislike_post(
    post_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Toggle dislike on a post.
    """
    post = await crud_community.toggle_dislike(db, post_id, str(current_user.id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{post_id}/comment")
async def comment_post(
    post_id: str,
    content: str = Body(..., embed=True),
    parent_id: str = Body(None, embed=True),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=POST_ACCESS_WEIGHT)),
) -> Any:
    """
    Add a comment to a post.
    """
    post = await crud_community.add_comment(db, post_id, content, current_user, parent_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
