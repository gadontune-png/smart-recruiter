import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import CHAR, TypeDecorator

from app.core.database import Base


# UUID that works on both SQLite (dev) and Postgres (prod)
class GUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(value) if not isinstance(value, uuid.UUID) else value


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(Integer, ForeignKey("assessments.assessment_id"), nullable=False)
    interviewee_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status = Column(Enum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interviewee = relationship("User", back_populates="invitations_created")
    assessment = relationship("Assessment", back_populates="invitations")