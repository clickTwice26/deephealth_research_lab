from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.api.deps import get_database, get_current_user
from app.models.news import News, NewsCreate, NewsPagination
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.crud import crud_news
import math

router = APIRouter()

@router.get("/", response_model=NewsPagination)
async def read_news(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str = "",
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Retrieve published news with pagination and search.
    """
    skip = (page - 1) * size
    items, total = await crud_news.get_multi(db, skip=skip, limit=size, search_query=search)
    
    pages = math.ceil(total / size) if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.post("/", response_model=News)
async def create_news(
    news: NewsCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create news. Admin only.
    """
    return await crud_news.create_news(db, news)

@router.put("/{news_id}", response_model=News)
async def update_news(
    news_id: str,
    news: NewsCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update news. Admin only.
    """
    updated_news = await crud_news.update_news(db, news_id, news)
    if not updated_news:
        raise HTTPException(status_code=404, detail="News item not found")
    return updated_news

@router.delete("/{news_id}", response_model=bool)
async def delete_news(
    news_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete news. Admin only.
    """
    result = await crud_news.delete_news(db, news_id)
    if not result:
        raise HTTPException(status_code=404, detail="News item not found")
    return True
