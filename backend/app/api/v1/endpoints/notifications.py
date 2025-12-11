from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.models.notification import Notification, NotificationCreate
from app.crud import crud_notification
from pydantic import BaseModel
from enum import Enum
from app.models.user import UserRole, ROLE_WEIGHTS
from app.core.email import send_email
from app.api import deps 

class NotificationTargetType(str, Enum):
    ALL = "all"
    ROLE = "role"
    GROUP = "group"
    USER = "user"

class AdminNotificationSend(BaseModel):
    title: str
    message: str
    type: str = "info"
    target_type: NotificationTargetType
    target_id: str = None  # role name, group id, or user email/id
    action_label: str = None
    action_url: str = None
    channels: List[str] = ["in-app"] # "in-app", "email"

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def read_notifications(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve notifications for the current user.
    """
    notifications = await crud_notification.get_notifications_by_user(
        db, user_id=str(current_user.id), skip=skip, limit=limit
    )
    return notifications

@router.post("/", response_model=Notification)
async def create_notification(
    notification: NotificationCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user), # In real app, maybe only admin or system can create
) -> Any:
    """
    Create a notification.
    """
    # For now, allow users to create notifications for themselves or others if needed
    # Ideally checking permissions here
    return await crud_notification.create_notification(db, notification)

@router.put("/{notification_id}/read", response_model=Notification)
async def mark_read(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mark a notification as read.
    """
    notification = await crud_notification.mark_notification_read(
        db, notification_id=notification_id, user_id=str(current_user.id)
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/read-all", response_model=bool)
async def mark_all_read(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mark all notifications as read for current user.
    """
    return await crud_notification.mark_all_notifications_read(db, user_id=str(current_user.id))

@router.post("/admin/send", response_model=dict)
async def send_admin_notification(
    payload: AdminNotificationSend,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Send notifications to users based on target criteria.
    Admin only.
    """
    target_users = []
    
    # 1. Resolve Target Users
    if payload.target_type == NotificationTargetType.ALL:
        users_cursor = db["users"].find({"is_active": True})
        target_users = await users_cursor.to_list(length=10000)
    
    elif payload.target_type == NotificationTargetType.ROLE:
        if not payload.target_id:
            raise HTTPException(status_code=400, detail="Target ID (role name) required for ROLE target")
        # Case insensitive match for role
        users_cursor = db["users"].find({"role": payload.target_id.lower(), "is_active": True})
        target_users = await users_cursor.to_list(length=10000)
        
    elif payload.target_type == NotificationTargetType.GROUP:
        if not payload.target_id:
             raise HTTPException(status_code=400, detail="Target ID (group id) required for GROUP target")
        # users in research group
        group = None
        try:
             from bson import ObjectId
             group = await db["research_groups"].find_one({"_id": ObjectId(payload.target_id)})
        except:
             pass
        
        if not group:
             raise HTTPException(status_code=404, detail="Research Group not found")
        
        member_ids = [m["user_id"] for m in group.get("members", [])]
        if member_ids:
             users_cursor = db["users"].find({"_id": {"$in": member_ids}, "is_active": True})
             target_users = await users_cursor.to_list(length=10000)
    
    elif payload.target_type == NotificationTargetType.USER:
        if not payload.target_id:
            raise HTTPException(status_code=400, detail="Target ID (user email or id) required for USER target")
        
        # Try finding by email first, then ID
        user = await db["users"].find_one({"email": payload.target_id})
        if not user:
            try:
                from bson import ObjectId
                user = await db["users"].find_one({"_id": ObjectId(payload.target_id)})
            except:
                pass
        
        if user:
            target_users = [user]

    if not target_users:
        return {"success": True, "message": "No users found matching criteria", "count": 0}

    # 2. Send Notifications
    count = 0
    
    # In-App
    if "in-app" in payload.channels:
        notifications_to_insert = []
        for u in target_users:
            # Avoid sending to self if desired, but usually admin wants to see it too? Let's send to all.
            n = NotificationCreate(
                title=payload.title,
                message=payload.message,
                type=payload.type,
                user_id=str(u["_id"]),
                action_label=payload.action_label,
                action_url=payload.action_url
            )
            notifications_to_insert.append(n)
            
        # We can implement bulk create in CRUD or just loop. Loop is fine for now < 10k.
        for n in notifications_to_insert:
            await crud_notification.create_notification(db, n)
    
    # Email
    if "email" in payload.channels:
        emails = [u["email"] for u in target_users if u.get("email")]
        if emails:
            # Send (mock)
            await send_email(emails, payload.title, payload.message)

    return {"success": True, "message": "Notifications sent", "count": len(target_users)}
