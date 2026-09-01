import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    RECRUITER = "recruiter"
    INTERVIEWEE = "interviewee"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(11), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assessments = relationship("Assessment", back_populates="recruiter")
    invitations = relationship(
        "Invitation",
        foreign_keys="[Invitation.interviewee_id]",
        back_populates="interviewee",
    )
    attempts = relationship("Attempt", back_populates="interviewee")