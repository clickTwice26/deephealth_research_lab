from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.item import PyObjectId
from enum import Enum

class GroupRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class GroupMember(BaseModel):
    user_id: str
    role: GroupRole = GroupRole.MEMBER
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    last_read_at: datetime = Field(default_factory=datetime.utcnow)

class GroupMemberDetail(GroupMember):
    name: str
    avatar_url: Optional[str] = None

class ResearchGroupBase(BaseModel):
    name: str
    topic: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class ResearchGroupCreate(ResearchGroupBase):
    pass

class ResearchGroupUpdate(ResearchGroupBase):
    name: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ResearchGroupInDB(ResearchGroupBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    members: List[GroupMember] = []
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class ResearchGroup(ResearchGroupInDB):
    members: List[GroupMemberDetail] # Override to include details
    pass

# Invitation
class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Invitation(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    group_id: str
    sender_id: str
    email: EmailStr
    status: InvitationStatus = InvitationStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    token: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat()}

# Chat Message
class ChatMessage(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    group_id: str
    user_id: str
    user_name: str # Cache name for easier display
    user_avatar: Optional[str] = None
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat()}
