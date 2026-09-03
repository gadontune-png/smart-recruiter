from datetime import datetime, timedelta
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, EmailStr


class InvitationCreate(BaseModel):
    assessment_id: int
    interviewee_id: int


class InvitationBulkCreate(BaseModel):
    assessment_id: int
    interviewee_ids: List[int]


class InvitationEmailCreate(BaseModel):
    assessment_id: int
    email: EmailStr
    interviewee_name: Optional[str] = None


class InvitationEmailBulkCreate(BaseModel):
    assessment_id: int
    emails: List[EmailStr]
    interviewee_name: Optional[str] = None


class InvitationOut(BaseModel):
    invitation_id: int
    assessment_id: int
    interviewee_id: int
    status: str
    invited_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    interviewee_email: Optional[str] = None
    interviewee_name: Optional[str] = None
    email_sent: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)