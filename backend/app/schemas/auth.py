from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "interviewee"


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut