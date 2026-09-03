from sqlalchemy import create_engine
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

# Guard: the project is documented to use PostgreSQL. Refuse to start against
# any other driver so a teammate with a stale .env gets a clear, actionable
# error instead of a confusing SQLAlchemy traceback later.
_url = (settings.database_url or "").strip()
if not _url.startswith(("postgresql://", "postgresql+psycopg://", "postgresql+psycopg2://")):
    raise RuntimeError(
        "Smart Recruiter requires a PostgreSQL DATABASE_URL "
        f"(got: {_url!r}). "
        "Update backend/.env — see backend/.env.example for the expected format."
    )

# Pool tuning suitable for a small dev/test workload.
engine = create_engine(
    _url,
    pool_pre_ping=True,
    future=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
