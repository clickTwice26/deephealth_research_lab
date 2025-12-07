from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api import deps
from app.core.config import settings
from app.models.user import User, UserCreate, UserUpdate, UserRole, ROLE_WEIGHTS
from app.crud import crud_user
from app.db.mongodb import get_database

router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users_cursor = db["users"].find().skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)
    return users

@router.post("/", response_model=User)
async def create_user(
    *,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_in: UserCreate,
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create new user. Admin only.
    """
    user = await crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user = await crud_user.create_user(db, user=user_in)
    return user

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
