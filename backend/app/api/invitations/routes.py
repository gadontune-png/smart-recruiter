from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.core.security import hash_password
from app.models.assessments.assessment import Assessment
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.models.notifications.notification import Notification
from app.models.user import INTERVIEWEE, RECRUITER, User, UserRole
from app.schemas.invitation import (
    InvitationCreate,
    InvitationBulkCreate,
    InvitationEmailCreate,
    InvitationEmailBulkCreate,
    InvitationOut,
)
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
    if invitation.interviewee:
        out.interviewee_email = invitation.interviewee.email
        out.interviewee_name = invitation.interviewee.full_name
    if not out.interviewee_email and invitation.email_address:
        out.interviewee_email = invitation.email_address
    if out.invited_at and not out.expires_at:
        out.expires_at = out.invited_at + timedelta(days=INVITATION_TTL_DAYS)
    return out


def _notify_interviewee(db: Session, interviewee_id: int, assessment: Assessment) -> None:
    db.add(
        Notification(
            user_id=interviewee_id,
            title="New assessment invitation",
            message=f"You have been invited to the assessment '{assessment.title}'.",
            notification_type="invitation",
        )
    )


def _get_or_create_interviewee(db: Session, email: str, name: Optional[str] = None) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        if user.role != INTERVIEWEE:
            raise HTTPException(
                status_code=400,
                detail=f"'{email}' is an existing {user.role} account, not a candidate. Use a candidate email.",
            )
        return user
    display_name = name.strip() if name and name.strip() else email.split("@")[0]
    user = User(
        full_name=display_name,
        email=email,
        password_hash=hash_password("temporary-password-change-me"),
        role=UserRole.INTERVIEWEE.value,
    )
    db.add(user)
    db.flush()
    return user


def _build_invitation_link(invitation_id: int, assessment_id: int) -> str:
    base = settings.frontend_base_url.rstrip("/")
    return f"{base}/interviewee/invitations?invitation={invitation_id}&assessment={assessment_id}"


def _create_and_email_invitation(
    db: Session,
    assessment: Assessment,
    recruiter: User,
    email: str,
    interviewee_name: Optional[str] = None,
    is_bulk: bool = True,
):
    interviewee = _get_or_create_interviewee(db, email, interviewee_name)
    invitation = Invitation(
        assessment_id=assessment.assessment_id,
        interviewee_id=interviewee.user_id,
        email_address=interviewee.email,
    )
    db.add(invitation)
    db.flush()
    _notify_interviewee(db, interviewee.user_id, assessment)

    link = _build_invitation_link(invitation.invitation_id, assessment.assessment_id)
    deadline = None
    if assessment.end_date:
        deadline = assessment.end_date.strftime("%Y-%m-%d %H:%M")

    email_sent = notification_service.send_assessment_invitation_email(
        recipient_email=interviewee.email,
        recipient_name=interviewee.full_name,
        recruiter_name=recruiter.full_name,
        assessment_title=assessment.title,
        invitation_link=link,
        deadline=deadline,
    )
    invitation.email_sent = email_sent
    return invitation


@router.post("", response_model=InvitationOut)
def create_invitation(
    payload: InvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot invite to an assessment owned by another recruiter")
    invitation = Invitation(**payload.model_dump())
    db.add(invitation)
    db.flush()
    _notify_interviewee(db, payload.interviewee_id, assessment)
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


@router.post("/bulk", response_model=list[InvitationOut])
def create_bulk_invitations(
    payload: InvitationBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot invite to an assessment owned by another recruiter")
    invitations = []
    for interviewee_id in payload.interviewee_ids:
        invitation = Invitation(
            assessment_id=payload.assessment_id,
            interviewee_id=interviewee_id,
        )
        db.add(invitation)
        invitations.append(invitation)
        _notify_interviewee(db, interviewee_id, assessment)

    db.commit()
    for inv in invitations:
        db.refresh(inv)

    return [_enrich(inv) for inv in invitations]


@router.post("/email", response_model=InvitationOut)
def create_email_invitation(
    payload: InvitationEmailCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot invite to an assessment owned by another recruiter")

    invitation = _create_and_email_invitation(
        db,
        assessment,
        current_user,
        email=payload.email,
        interviewee_name=payload.interviewee_name,
    )
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


@router.post("/email/bulk", response_model=list[InvitationOut])
def create_email_bulk_invitations(
    payload: InvitationEmailBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot invite to an assessment owned by another recruiter")

    invitations = []
    for email in payload.emails:
        invitation = _create_and_email_invitation(
            db,
            assessment,
            current_user,
            email=email,
            interviewee_name=payload.interviewee_name,
        )
        invitations.append(invitation)

    db.commit()
    for inv in invitations:
        db.refresh(inv)

    return [_enrich(inv) for inv in invitations]


@router.get("", response_model=list[InvitationOut])
def list_invitations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RECRUITER:
        invitations = (
            db.query(Invitation)
            .join(Assessment, Assessment.assessment_id == Invitation.assessment_id)
            .filter(Assessment.recruiter_id == current_user.user_id)
            .all()
        )
    else:
        invitations = (
            db.query(Invitation)
            .filter(Invitation.interviewee_id == current_user.user_id)
            .all()
        )
    return [_enrich(inv) for inv in invitations]


@router.post("/{invitation_id}/accept", response_model=InvitationOut)
def accept_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if current_user.role == INTERVIEWEE and invitation.interviewee_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot accept an invitation addressed to another user",
        )
    invitation.status = InvitationStatus.ACCEPTED
    invitation.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


@router.post("/{invitation_id}/decline", response_model=InvitationOut)
def decline_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if current_user.role == INTERVIEWEE and invitation.interviewee_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot decline an invitation addressed to another user")
    invitation.status = InvitationStatus.EXPIRED
    invitation.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(invitation)
    return _enrich(invitation)


@router.delete("/{invitation_id}")
def revoke_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    invitation = db.query(Invitation).filter(Invitation.invitation_id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    assessment = db.query(Assessment).filter(Assessment.assessment_id == invitation.assessment_id).first()
    if assessment and assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not own this invitation")
    db.delete(invitation)
    db.commit()
    return {"detail": "Invitation revoked"}
