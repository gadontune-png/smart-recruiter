import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.models.user import User
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

    try:
        interviewee = db.query(User).filter(User.user_id == payload.interviewee_id).first()
        recruiter = db.query(User).filter(User.user_id == invitation.assessment_id).first()
        if interviewee and interviewee.email:
            assessment_title = "Technical Assessment"
            notification_service.send_assessment_invitation_email(
                recipient_email=interviewee.email,
                recipient_name=interviewee.full_name,
                recruiter_name=recruiter.full_name if recruiter else "Recruiter",
                assessment_title=assessment_title,
                invitation_link=f"http://localhost:5173/assessment/{invitation.assessment_id}",
                deadline=payload.expires_at.isoformat() if payload.expires_at else None,
            )
    except Exception as e:
        print(f"Email notification failed: {e}")

    return invitation


@router.post("/bulk", response_model=List[InvitationOut])
def create_bulk_invitations(payload: InvitationBulkCreate, db: Session = Depends(get_db)):
    invitations = []
    for interviewee_id in payload.interviewee_ids:
        invitation = Invitation(
            assessment_id=payload.assessment_id,
            interviewee_id=interviewee_id,
            scheduled_at=payload.scheduled_at,
            expires_at=payload.expires_at,
        )
        db.add(invitation)
        invitations.append(invitation)

    db.commit()
    for inv in invitations:
        db.refresh(inv)

    try:
        assessment = db.query(
            db.query(User).filter(User.user_id == payload.assessment_id).first()
        )
        for inv in invitations:
            interviewee = db.query(User).filter(User.user_id == inv.interviewee_id).first()
            if interviewee and interviewee.email:
                try:
                    notification_service.send_assessment_invitation_email(
                        recipient_email=interviewee.email,
                        recipient_name=interviewee.full_name,
                        recruiter_name="Recruiter",
                        assessment_title="Technical Assessment",
                        invitation_link=f"http://localhost:5173/assessment/{inv.assessment_id}",
                        deadline=inv.expires_at.isoformat() if inv.expires_at else None,
                    )
                except Exception:
                    pass
    except Exception as e:
        print(f"Bulk email notification failed: {e}")

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