"""Pytest config for the top-level tests/ — SQLite, isolated test DB."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_smart_recruiter.db")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.database import Base, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


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

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)