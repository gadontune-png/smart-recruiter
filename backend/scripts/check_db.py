"""Dev helper: verify the database connection and create tables (BE-02).

Run from the backend directory:

    python scripts/check_db.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, engine  # noqa: E402
from app.models import User  # noqa: E402,F401  (register models)


def main() -> int:
    try:
        with engine.connect() as conn:
            conn.execution_options()  # force a connection attempt
        print("Database connection: OK")
    except Exception as exc:  # pragma: no cover - depends on environment
        print(f"Database connection FAILED: {exc}")
        return 1

    Base.metadata.create_all(bind=engine)
    print("Tables created/verified: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
