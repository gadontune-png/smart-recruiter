import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class InvitationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"


class Invitation(Base):
    __tablename__ = "invitations"

    invitation_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.assessment_id"), nullable=False)
    interviewee_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    invited_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    interviewee = relationship("User", back_populates="invitations")
    assessment = relationship("Assessment", back_populates="invitations")