import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Enum, Text

from app.core.database import Base
from app.models.invitations.invitation import GUID


class NotificationType(str, enum.Enum):
    INVITATION = "invitation"
    INFO = "info"
    REMINDER = "reminder"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), nullable=False)  # FK to Member 1's users table
    type = Column(Enum(NotificationType), default=NotificationType.INFO, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

