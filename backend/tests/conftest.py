"""Pytest config for the top-level tests/ — uses a separate PostgreSQL test DB.

The test DB is `smartrecruiter_test` on the same Postgres server as the dev
DB. It is created on demand the first time tests run, and its tables are
recreated for every test (Base.metadata.create_all + drop_all).
"""
import os

# Point at a dedicated test database so we never touch the dev DB.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://smartrecruiter:smartrecruiter@localhost:5433/smartrecruiter_test",
)


def pytest_configure(config):
    """Create the test database before any test modules are imported.

    This hook runs early in pytest's lifecycle, before conftest imports
    trigger database engine connections.
    """
    from sqlalchemy import create_engine, text

    from app.core.config import settings

    test_db_name = settings.database_url.rsplit("/", 1)[-1]
    admin_url = settings.database_url.rsplit("/", 1)[0] + "/postgres"
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT", future=True)
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :n"),
            {"n": test_db_name},
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{test_db_name}"'))
    admin_engine.dispose()


import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.exc import ProgrammingError  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.database import Base, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.drop_all(bind=engine)
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
