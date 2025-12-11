from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.api.deps import get_database, get_current_user
from app.models.publication import Publication, PublicationCreate, PublicationUpdate, PublicationPagination
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.crud import crud_publication
import math

router = APIRouter()

@router.get("/", response_model=PublicationPagination)
async def read_publications(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str = "",
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Retrieve publications with pagination and search.
    """
    skip = (page - 1) * size
    items, total = await crud_publication.get_multi(db, skip=skip, limit=size, search_query=search)
    
    pages = math.ceil(total / size) if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.post("/", response_model=Publication)
async def create_publication(
    publication: PublicationCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create a new publication. Admin only.
    """
    return await crud_publication.create_publication(db, publication)

@router.put("/{pub_id}", response_model=Publication)
async def update_publication(
    pub_id: str,
    publication: PublicationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update publication. Admin only.
    """
    updated_pub = await crud_publication.update_publication(db, pub_id, publication)
    if not updated_pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    return updated_pub

@router.delete("/{pub_id}", response_model=bool)
async def delete_publication(
    pub_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete publication. Admin only.
    """
    success = await crud_publication.delete_publication(db, pub_id)
    if not success:
        raise HTTPException(status_code=404, detail="Publication not found")
    return success
