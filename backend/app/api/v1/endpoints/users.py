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

@router.put("/{user_id}/role", response_model=User)
async def update_user_role(
    user_id: str,
    role: str = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update user role. Admin only.
    """
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user = await crud_user.update_user_role(db, user_id=user_id, role=role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

@router.put("/{user_id}/status", response_model=User)
async def update_user_status(
    user_id: str,
    status: bool = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update user active status. Admin only.
    """
    user = await crud_user.update_user_status(db, user_id=user_id, is_active=status)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", response_model=Any)
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete user. Admin only.
    """
    # Prevent deleting self
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    success = await crud_user.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "User deleted"}

from app.core import security
from datetime import timedelta

@router.post("/{user_id}/impersonate", response_model=Any)
async def impersonate_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Get access token for another user. Admin only.
    """
    from bson import ObjectId
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 10 minutes token (600 seconds)
    access_token_expires = timedelta(minutes=10)
    access_token = security.create_access_token(
        subject=user_doc["email"], 
        expires_delta=access_token_expires,
        claims={"act_as": str(user_doc["_id"]), "impersonator": current_user.email}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": user_doc["role"],
        "user_name": user_doc.get("full_name", user_doc["email"])
    }

from app.utils.email import send_email

@router.post("/{user_id}/email", response_model=Any)
async def email_user(
    user_id: str,
    subject: str = Body(...),
    message: str = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Send email to user. Admin only.
    """
    from bson import ObjectId
    try:
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    except:
        user_doc = None
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = send_email(user_doc["email"], subject, message)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
        
    return {"status": "success", "message": "Email sent"}

from datetime import datetime, timedelta

@router.post("/heartbeat", response_model=Any)
async def heartbeat(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update user's last_active_at timestamp.
    """
    from bson import ObjectId
    await db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"last_active_at": datetime.utcnow()}}
    )
    return {"status": "success"}

@router.get("/live", response_model=List[Any])
async def get_live_users(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get list of currently active users (active in last 2 minutes).
    """
    # 2 minutes ago
    threshold = datetime.utcnow() - timedelta(minutes=2)
    
    cursor = db["users"].find(
        {"last_active_at": {"$gte": threshold}},
        {"_id": 1, "email": 1, "full_name": 1, "role": 1, "last_active_at": 1}
    )
    
    users = await cursor.to_list(length=100)
    
    # Format for frontend
    return [{
        "id": str(u["_id"]),
        "name": u.get("full_name") or u["email"].split("@")[0],
        "email": u["email"],
        "role": u["role"],
        "last_active": u["last_active_at"],
        "status": "online"
    } for u in users]

@router.get("/{user_id}/public", response_model=dict)
async def get_public_profile(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Get public profile of a user. Public access.
    """
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except:
        raise HTTPException(status_code=404, detail="User not found")

    user = await db["users"].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return only public info
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name") or "Anonymous Researcher",
        "avatar_url": user.get("avatar_url"),
        "bio": user.get("bio", "No biography available."),
        "research_interests": user.get("research_interests", []),
        "role": user.get("role")
    }
