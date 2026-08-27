"""User ORM model and role constants (BE-03)."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum as SAEnum, Integer, String, func
from sqlalchemy.orm import validates

from app.core.database import Base

# Role constants — keep in sync with the frontend ROLES map.
RECRUITER = "recruiter"
INTERVIEWEE = "interviewee"
USER_ROLES = [RECRUITER, INTERVIEWEE]


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SAEnum(*USER_ROLES, name="user_role"),
        nullable=False,
        default=INTERVIEWEE,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @validates("email")
    def _normalize_email(self, _key, value):
        if value:
            return value.strip().lower()
        return value

    @validates("role")
    def _validate_role(self, _key, value):
        if value not in USER_ROLES:
            raise ValueError(f"Invalid role: {value}")
        return value

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<User id={self.id} email={self.email} role={self.role}>"
