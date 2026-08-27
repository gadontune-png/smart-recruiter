"""Request / response schemas for authentication (BE-04, BE-05)."""
from pydantic import BaseModel, EmailStr, Field

from app.models.user import INTERVIEWEE


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default=INTERVIEWEE, pattern="^(recruiter|interviewee)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Auth response.

    The user fields are returned at the top level (matching the frontend's
    auth slice which stores the whole payload as `user`), plus a `token`
    the frontend can read as `user.token` once real API calls are enabled.
    """

    token: str
    token_type: str = "bearer"
    id: int
    name: str
    email: EmailStr
    role: str
