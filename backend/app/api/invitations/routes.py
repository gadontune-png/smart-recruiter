from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.models.assessments.assessment import Assessment
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.models.notifications.notification import Notification
from app.models.user import INTERVIEWEE, RECRUITER, User
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


def _notify_interviewee(db: Session, interviewee_id: int, assessment: Assessment) -> None:
    db.add(
        Notification(
            user_id=interviewee_id,
            title="New assessment invitation",
            message=f"You have been invited to the assessment '{assessment.title}'.",
            notification_type="invitation",
        )
    )


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
