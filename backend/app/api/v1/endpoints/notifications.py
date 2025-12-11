from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.models.notification import Notification, NotificationCreate
from app.crud import crud_notification

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
