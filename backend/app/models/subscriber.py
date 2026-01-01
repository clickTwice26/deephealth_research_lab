from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from app.models.item import PyObjectId

class SubscriberBase(BaseModel):
    email: EmailStr
    is_active: bool = True

class SubscriberCreate(SubscriberBase):
    pass

class Subscriber(SubscriberBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
