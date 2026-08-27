import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from app.models.invitations.invitation import InvitationStatus


class InvitationCreate(BaseModel):
    assessment_id: uuid.UUID
    interviewee_id: uuid.UUID
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class InvitationBulkCreate(BaseModel):
    assessment_id: uuid.UUID
    interviewee_ids: List[uuid.UUID]
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class InvitationOut(BaseModel):
    id: uuid.UUID
    assessment_id: uuid.UUID
    interviewee_id: uuid.UUID
    status: InvitationStatus
    scheduled_at: Optional[datetime]
    expires_at: Optional[datetime]
    accepted_at: Optional[datetime]

    class Config:
        from_attributes = True

