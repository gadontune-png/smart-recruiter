import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.notifications.notification import NotificationType


class NotificationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: NotificationType
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

