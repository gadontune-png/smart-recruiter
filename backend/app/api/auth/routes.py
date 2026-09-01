from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister, TokenOut, UserOut
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def _create_token(user_id: int, role: str) -> str:
    import uuid
    import time
    payload = {"user_id": user_id, "role": role, "exp": time.time() + 3600}
    return _hash_password(str(payload))[:32]


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=_hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(
        access_token=_create_token(user.user_id, user.role),
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.password_hash != _hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenOut(
        access_token=_create_token(user.user_id, user.role),
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_me(db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Auth middleware required in production")