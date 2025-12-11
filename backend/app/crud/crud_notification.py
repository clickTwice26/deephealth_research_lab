from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from app.models.notification import Notification, NotificationCreate, NotificationUpdate

async def create_notification(db: AsyncIOMotorDatabase, notification: NotificationCreate) -> Notification:
    notification_dict = notification.model_dump()
    notification_dict["created_at"] = datetime.utcnow()
    
    result = await db["notifications"].insert_one(notification_dict)
    
    created_notification = await db["notifications"].find_one({"_id": result.inserted_id})
    return Notification(**created_notification)

async def get_notifications_by_user(
    db: AsyncIOMotorDatabase, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 100
) -> List[Notification]:
    cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    notifications = await cursor.to_list(length=limit)
    return [Notification(**n) for n in notifications]

async def mark_notification_read(db: AsyncIOMotorDatabase, notification_id: str, user_id: str) -> Optional[Notification]:
    try:
        oid = ObjectId(notification_id)
    except:
        return None
        
    result = await db["notifications"].find_one_and_update(
        {"_id": oid, "user_id": user_id},
        {"$set": {"is_read": True}},
        return_document=True
    )
    
    if result:
        return Notification(**result)
    return None

async def mark_all_notifications_read(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    result = await db["notifications"].update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return True
