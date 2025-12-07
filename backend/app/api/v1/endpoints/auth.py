from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core import security
from app.core.config import settings
from app.crud import crud_user
from app.models.user import User, UserCreate
from app.db.mongodb import get_database
from app.api import deps

router = APIRouter()

@router.post("/login/access-token")
async def login_access_token(
    db: AsyncIOMotorDatabase = Depends(get_database),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = await crud_user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/signup", response_model=User)
async def signup(
    *,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_in: UserCreate,
) -> Any:
    user = await crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user = await crud_user.create_user(db, user=user_in)
    return user

@router.post("/login/google")
async def login_google(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Any:
    try:
        id_info = id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = id_info['email']
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google Token")

    user = await crud_user.get_user_by_email(db, email=email)
    if not user:
        # Auto-signup logic for Google users?
        # For strict RBAC, maybe just fail or create as default USER
        user_in = UserCreate(
            email=email,
            password="",  # No password for Google users
            full_name=id_info.get('name', ''),
            role="user"
        )
        # Note: create_user hashes password, empty string is fine as it won't match any login attempt
        user = await crud_user.create_user(db, user=user_in)
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
