from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.api import deps
from app.db.mongodb import get_database
from app.models.blog import BlogPost, BlogPostCreate, BlogPostUpdate
from app.crud import crud_blog
from app.models.user import User, UserRole, ROLE_WEIGHTS

router = APIRouter()

async def enrich_blog_post(post: BlogPost, db: AsyncIOMotorDatabase) -> dict:
    """Enrich blog post with author details"""
    post_dict = post.model_dump()
    if post.author_id:
        try:
            author = await db["users"].find_one({"_id": ObjectId(post.author_id)})
            if author:
                post_dict["author_name"] = author.get("full_name") or author.get("email")
                post_dict["author_avatar"] = author.get("avatar_url")
        except:
            pass
            
    if "author_name" not in post_dict:
        post_dict["author_name"] = "Unknown Author"
        
    return post_dict

@router.get("/", response_model=List[dict])
async def read_blog_posts(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get all published blog posts. Public access.
    """
    posts, total = await crud_blog.get_blog_posts(
        db, skip=skip, limit=limit, category=category, tag=tag, search=search, published_only=True
    )
    
    # Enrich with author info
    enriched_posts = []
    for post in posts:
        enriched_posts.append(await enrich_blog_post(post, db))
        
    return enriched_posts

@router.get("/{slug}", response_model=dict)
async def read_blog_post(
    slug: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific blog post by slug. Public access.
    Increments view count.
    """
    post = await crud_blog.get_blog_post(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment views asynchronously (fire and forget sort of)
    # Increment views asynchronously (fire and forget sort of)
    await crud_blog.increment_views(db, slug)
    return await enrich_blog_post(post, db)

@router.get("/my/posts", response_model=List[BlogPost])
async def read_my_blog_posts(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get current user's blog posts (including drafts).
    Requires: RESEARCHER or higher.
    """
    if current_user.access_weight < ROLE_WEIGHTS[UserRole.RESEARCHER]:
         raise HTTPException(
             status_code=403, 
             detail="Not authorized"
         )
         
    posts, total = await crud_blog.get_blog_posts(
        db, skip=skip, limit=limit, author_id=str(current_user.id), published_only=False
    )
    return posts

@router.post("/", response_model=BlogPost)
async def create_blog_post(
    post_in: BlogPostCreate,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new blog post. 
    Requires access level: RESEARCHER or higher.
    """
    if current_user.access_weight < ROLE_WEIGHTS[UserRole.RESEARCHER]:
         raise HTTPException(
             status_code=403, 
             detail="Not authorized to create blog posts"
         )
         
    # Check if slug exists
    existing = await crud_blog.get_blog_post(db, post_in.slug)
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Slug already exists. Please choose a unique slug."
        )

    post = await crud_blog.create_blog_post(db, post_in, str(current_user.id))
    return post

@router.put("/{slug}", response_model=BlogPost)
async def update_blog_post(
    slug: str,
    post_in: BlogPostUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update a blog post.
    Requires: Author of the post OR Admin.
    """
    post = await crud_blog.get_blog_post(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    is_author = post.author_id == str(current_user.id)
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_author or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this post"
        )
        
    updated_post = await crud_blog.update_blog_post(db, slug, post_in)
    return updated_post

@router.delete("/{slug}", response_model=dict)
async def delete_blog_post(
    slug: str,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a blog post.
    Requires: Author of the post OR Admin.
    """
    post = await crud_blog.get_blog_post(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    is_author = post.author_id == str(current_user.id)
    is_admin = current_user.role == UserRole.ADMIN
    
    if not (is_author or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this post"
        )

    await crud_blog.delete_blog_post(db, slug)
    return {"status": "success", "message": "Blog post deleted"}
