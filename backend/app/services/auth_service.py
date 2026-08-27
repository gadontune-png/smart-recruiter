"""Authentication business logic (BE-04, BE-05)."""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import INTERVIEWEE, User
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    if not email:
        return None
    return db.query(User).filter(User.email == email.strip().lower()).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role or INTERVIEWEE,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise ValueError("EMAIL_TAKEN")
    return user


def authenticate(db: Session, data: LoginRequest) -> User | None:
    user = get_user_by_email(db, data.email)
    if user is None or not verify_password(data.password, user.password_hash):
        return None
    return user


def build_token_response(user: User) -> dict:
    token = create_access_token(subject=str(user.id))
    return {
        "token": token,
        "token_type": "bearer",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
