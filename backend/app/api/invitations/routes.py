from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.invitations.invitation import Invitation
from app.schemas.invitation import InvitationCreate, InvitationBulkCreate, InvitationOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/invitations", tags=["invitations"])

notification_service = NotificationService()


@router.post("", response_model=InvitationOut)
def create_invitation(payload: InvitationCreate, db: Session = Depends(get_db)):
    invitation = Invitation(**payload.model_dump())
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


@router.post("/bulk", response_model=list[InvitationOut])
def create_bulk_invitations(payload: InvitationBulkCreate, db: Session = Depends(get_db)):
    invitations = []
    for interviewee_id in payload.interviewee_ids:
        invitation = Invitation(
            assessment_id=payload.assessment_id,
            interviewee_id=interviewee_id,
        )
        db.add(invitation)
        invitations.append(invitation)

    db.commit()
    for inv in invitations:
        db.refresh(inv)

    return invitations


@router.get("", response_model=list[InvitationOut])
def list_invitations(db: Session = Depends(get_db)):
    return db.query(Invitation).all()


@router.post("/{invitation_id}/accept", response_model=InvitationOut)
def accept_invitation(invitation_id: int, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    invitation.status = "accepted"
    invitation.responded_at = __import__("datetime").datetime.utcnow()
    db.commit()
    db.refresh(invitation)
    return invitation
