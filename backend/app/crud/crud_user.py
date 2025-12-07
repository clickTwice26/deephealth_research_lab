from typing import Optional
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
    return user
