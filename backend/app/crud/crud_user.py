from typing import Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, UserInDB, UserRole, ROLE_WEIGHTS

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[UserInDB]:
    user_doc = await db["users"].find_one({"email": email})
    if user_doc:
        return UserInDB(**user_doc)
    return None

async def create_user(db: AsyncIOMotorDatabase, user: UserCreate) -> UserInDB:
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        **user.model_dump(exclude={"password"}),
        hashed_password=hashed_password,
        access_weight=ROLE_WEIGHTS[user.role]
    )
    # Default admin for first user logic could be added here, but sticking to basics
    await db["users"].insert_one(user_in_db.model_dump(by_alias=True, exclude={"id"}))
    created_user = await get_user_by_email(db, user.email)
    return created_user

async def authenticate(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[UserInDB]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_multi_by_search(
    db: AsyncIOMotorDatabase, 
    query: str, 
    limit: int = 10
) -> list[UserInDB]:
    # Case-insensitive regex search
    regex_query = {"$regex": query, "$options": "i"}
    mongo_query = {
        "$or": [
            {"full_name": regex_query},
            {"email": regex_query}
        ]
    }
    
    cursor = db["users"].find(mongo_query).limit(limit)
    users = await cursor.to_list(length=limit)
    return [UserInDB(**u) for u in users]

async def update_user_role(db: AsyncIOMotorDatabase, user_id: str, role: str) -> Optional[UserInDB]:
    try:
        oid = ObjectId(user_id)
    except:
        return None
        
    result = await db["users"].find_one_and_update(
        {"_id": oid},
        {"$set": {"role": role}},
        return_document=True
    )
    
    if result:
        return UserInDB(**result)
    return None

async def update_user_status(db: AsyncIOMotorDatabase, user_id: str, is_active: bool) -> Optional[UserInDB]:
    try:
        oid = ObjectId(user_id)
    except:
        return None
        
    result = await db["users"].find_one_and_update(
        {"_id": oid},
        {"$set": {"is_active": is_active}},
        return_document=True
    )
    
    if result:
        return UserInDB(**result)
    return None

async def delete_user(db: AsyncIOMotorDatabase, user_id: str) -> bool:
    try:
        oid = ObjectId(user_id)
    except:
        return False
        
    result = await db["users"].delete_one({"_id": oid})
    return result.deleted_count > 0
