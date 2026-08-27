import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.notifications.notification import Notification
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationOut])
def list_notifications(user_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user_id).all()


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(notification_id: uuid.UUID, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

