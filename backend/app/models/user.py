from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum
from app.models.item import PyObjectId

class UserRole(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    MEMBER = "member"
    USER = "user"

ROLE_WEIGHTS = {
    UserRole.ADMIN: 100,
    UserRole.RESEARCHER: 50,
    UserRole.MEMBER: 10,
    UserRole.USER: 1,
}

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    role: UserRole = UserRole.USER
    last_active_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    @property
    def access_weight(self) -> int:
        return ROLE_WEIGHTS.get(self.role, 0)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
