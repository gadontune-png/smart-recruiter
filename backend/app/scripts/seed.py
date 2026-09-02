"""Seed the development database with demo accounts.

Idempotent: re-running won't duplicate rows.

Run from the backend/ directory:
    python -m app.scripts.seed
"""
from sqlalchemy.orm import Session

# Importing app.main wires up the SQLAlchemy model registry and the
# relationship() names that User refers to ("Assessment", "Invitation", ...).
# Do this before touching the ORM in any way.
import app.main  # noqa: F401

from app.core.database import Base, SessionLocal, engine
from app.services.auth_service import create_user, get_user_by_email


DEMO_USERS = [
    {
        "full_name": "Recruiter Demo",
        "email": "recruiter@demo.com",
        "password": "secret123",
        "role": "recruiter",
    },
    {
        "full_name": "Candidate Demo",
        "email": "candidate@demo.com",
        "password": "secret123",
        "role": "interviewee",
    },
]


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        for u in DEMO_USERS:
            existing = get_user_by_email(db, u["email"])
            if existing is not None:
                print(f"  [skip] {u['email']} already exists (id={existing.user_id})")
                continue
            created = create_user(
                db=db,
                full_name=u["full_name"],
                email=u["email"],
                password=u["password"],
                role=u["role"],
            )
            print(f"  [ok]   created {created.email} (id={created.user_id}, role={created.role})")
        print("\nDemo accounts ready. Login with either:")
        print("  - recruiter@demo.com / secret123")
        print("  - candidate@demo.com / secret123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
