import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.schemas.invitation import InvitationCreate, InvitationBulkCreate, InvitationOut

router = APIRouter(prefix="/api/invitations", tags=["invitations"])


@router.post("", response_model=InvitationOut)
def create_invitation(payload: InvitationCreate, db: Session = Depends(get_db)):
    invitation = Invitation(**payload.model_dump())
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


@router.post("/bulk", response_model=List[InvitationOut])
def create_bulk_invitations(payload: InvitationBulkCreate, db: Session = Depends(get_db)):
    invitations = [
        Invitation(
            assessment_id=payload.assessment_id,
            interviewee_id=interviewee_id,
            scheduled_at=payload.scheduled_at,
            expires_at=payload.expires_at,
        )
        for interviewee_id in payload.interviewee_ids
    ]
    db.add_all(invitations)
    db.commit()
    for inv in invitations:
        db.refresh(inv)
    return invitations


@router.get("", response_model=List[InvitationOut])
def list_invitations(db: Session = Depends(get_db)):
    return db.query(Invitation).all()


@router.post("/{invitation_id}/accept", response_model=InvitationOut)
def accept_invitation(invitation_id: uuid.UUID, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if invitation.expires_at and invitation.expires_at < datetime.utcnow():
        invitation.status = InvitationStatus.EXPIRED
        db.commit()
        raise HTTPException(status_code=400, detail="Invitation has expired")
    invitation.status = InvitationStatus.ACCEPTED
    invitation.accepted_at = datetime.utcnow()
    db.commit()
    db.refresh(invitation)
    return invitation

