"""Pydantic schemas for the User domain (BE-03)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import INTERVIEWEE


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    role: str = Field(default=INTERVIEWEE, pattern="^(recruiter|interviewee)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
