from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from app.models.invitations.invitation import InvitationStatus


class InvitationCreate(BaseModel):
    assessment_id: int
    interviewee_id: int
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class InvitationBulkCreate(BaseModel):
    assessment_id: int
    interviewee_ids: List[int]
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class InvitationOut(BaseModel):
    id: str
    assessment_id: int
    interviewee_id: int
    status: InvitationStatus
    scheduled_at: Optional[datetime]
    expires_at: Optional[datetime]
    accepted_at: Optional[datetime]

    class Config:
        from_attributes = True