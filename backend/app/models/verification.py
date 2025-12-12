from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class VerificationBase(BaseModel):
    email: EmailStr
    otp: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VerificationCreate(VerificationBase):
    pass

class Verification(VerificationBase):
    id: Optional[str] = Field(default=None, alias="_id")
