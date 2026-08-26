# Smart Recruiter — Backend (DebugMasters)

> Placeholder structure. The backend is **not connected yet** — this layout is
> scaffolded so the 4 collaborators can build into it on the `dev` branch.

## Stack (planned)

- Python 3.11+
- FastAPI
- PostgreSQL (via SQLAlchemy + Alembic)
- Pydantic for schemas/validation

## Structure

```
backend/
├── app/
│   ├── api/            # Route modules, one per domain feature
│   │   ├── auth/           # login, register, tokens
│   │   ├── assessments/    # create/manage assessments
│   │   ├── questions/      # MCQ, subjective, coding, whiteboard
│   │   ├── submissions/    # candidate submissions
│   │   ├── feedback/       # recruiter feedback
│   │   ├── invitations/    # invite interviewees
│   │   ├── notifications/  # assessment notifications
│   │   └── results/        # grades & performance stats
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic request/response schemas
│   ├── services/       # Business logic (auth, assessments, codewars)
│   ├── utils/          # Shared helpers
│   ├── core/           # App config, database, security
│   ├── migrations/     # Alembic migrations
│   ├── main.py         # App entrypoint (placeholder)
│   └── __init__.py
├── tests/             # Backend tests (pytest)
├── scripts/           # Dev/setup scripts
├── requirements.txt
└── .gitignore
```

## Mirrors the frontend

The `app/api/*` folders mirror the frontend `src/features/*` domains
(auth, assessments, questions, submissions, feedback, invitations,
notifications, results) so each collaborator owns a matching slice.

## TODO before connecting

1. Create a virtualenv and `pip install -r requirements.txt`.
2. Implement `app/core/config.py` and `app/core/database.py`.
3. Fill in `app/main.py` and wire the API routers.
4. Add Alembic config under `app/migrations/`.
