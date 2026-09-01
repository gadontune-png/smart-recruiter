from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.schemas.invitation import InvitationCreate, InvitationBulkCreate, InvitationOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/invitations", tags=["invitations"])

notification_service = NotificationService()

INVITATION_TTL_DAYS = 7


def _enrich(invitation: Invitation) -> InvitationOut:
    out = InvitationOut.model_validate(invitation)
    if invitation.assessment:
        out.title = invitation.assessment.title
        out.description = invitation.assessment.description
        out.time_limit_minutes = invitation.assessment.time_limit_minutes
    if out.invited_at and not out.expires_at:
        out.expires_at = out.invited_at + timedelta(days=INVITATION_TTL_DAYS)
    return out


@router.post("", response_model=InvitationOut)
def create_invitation(payload: InvitationCreate, db: Session = Depends(get_db)):
    invitation = Invitation(**payload.model_dump())
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


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

    return [_enrich(inv) for inv in invitations]


@router.get("", response_model=list[InvitationOut])
def list_invitations(db: Session = Depends(get_db)):
    invitations = db.query(Invitation).all()
    return [_enrich(inv) for inv in invitations]


@router.post("/{invitation_id}/accept", response_model=InvitationOut)
def accept_invitation(invitation_id: int, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    invitation.status = InvitationStatus.ACCEPTED
    invitation.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


@router.delete("/{invitation_id}")
def revoke_invitation(invitation_id: int, db: Session = Depends(get_db)):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    db.delete(invitation)
    db.commit()
    return {"detail": "Invitation revoked"}