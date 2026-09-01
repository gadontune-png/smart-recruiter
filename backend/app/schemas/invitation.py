from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class InvitationCreate(BaseModel):
    assessment_id: int
    interviewee_id: int


class InvitationBulkCreate(BaseModel):
    assessment_id: int
    interviewee_ids: List[int]


class InvitationOut(BaseModel):
    invitation_id: int
    assessment_id: int
    interviewee_id: int
    status: str
    invited_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True
