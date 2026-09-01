from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.notifications.notification import Notification
from app.schemas.notification import NotificationOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

notification_service = NotificationService()


@router.get("", response_model=list[NotificationOut])
def list_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user_id).all()


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/send-question-email")
def send_question_email(
    recipient_email: str,
    recipient_name: str,
    assessment_title: str,
    question_text: str,
    question_type: str,
    points: int,
    deadline: str = None,
    db: Session = Depends(get_db),
):
    success = notification_service.send_question_assigned_email(
        recipient_email,
        recipient_name,
        assessment_title,
        question_text,
        question_type,
        points,
        deadline,
    )
    return {
        "success": success,
        "message": "Question notification email sent successfully" if success else "Failed to send email",
    }


@router.post("/send-assessment-invitation")
def send_assessment_invitation_email(
    recipient_email: str,
    recipient_name: str,
    recruiter_name: str,
    assessment_title: str,
    invitation_link: str,
    deadline: str = None,
    db: Session = Depends(get_db),
):
    success = notification_service.send_assessment_invitation_email(
        recipient_email,
        recipient_name,
        recruiter_name,
        assessment_title,
        invitation_link,
        deadline,
    )
    return {
        "success": success,
        "message": "Assessment invitation email sent successfully" if success else "Failed to send email",
    }
