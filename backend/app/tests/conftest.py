"""Pytest config for app/tests (mirrors tests/conftest.py) — SQLite, no Postgres."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_smart_recruiter.db")

from contextlib import asynccontextmanager  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.database import Base, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


@asynccontextmanager
async def _noop_lifespan(app):  # type: ignore[no-untyped-def]
    yield


@pytest.fixture()
def client():
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.router.lifespan_context = _noop_lifespan
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
