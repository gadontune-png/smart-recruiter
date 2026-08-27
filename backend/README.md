# Smart Recruiter — Backend (DebugMasters)

Backend for the Smart Recruiter platform. This implements **BE-01 – BE-06**
(FastAPI setup, PostgreSQL, User model & roles, registration, JWT login, and
auth/role testing) for **Member 1 — Backend Foundation & Authentication**.

The backend is scaffolded but **not yet connected to the frontend**.

## Stack

- Python 3.11+
- FastAPI
- PostgreSQL (SQLAlchemy ORM, dev `create_all`, Alembic reserved)
- Pydantic / Pydantic Settings
- JWT auth (`python-jose`) + password hashing (`passlib`/`bcrypt`)

## Quick start (development)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # then edit DATABASE_URL / SECRET_KEY
python scripts/check_db.py  # verify DB connection + create tables

uvicorn app.main:app --reload --port 5000
# API base:  http://localhost:5000/api
# Docs:      http://localhost:5000/docs
```

## API (matches the frontend `authService`)

All routes are mounted under `/api` (frontend `VITE_API_URL` = `.../api`).

| Method | Path                  | Auth | Description                         |
| ------ | --------------------- | ---- | ----------------------------------- |
| POST   | `/api/auth/register`  | —    | Register user, returns JWT + user    |
| POST   | `/api/auth/login`     | —    | Login, returns JWT + user           |
| GET    | `/api/auth/me`        | JWT  | Current user profile                |
| GET    | `/api/auth/recruiter-only`   | Recruiter | Role-protected example |
| GET    | `/api/auth/interviewee-only` | Interviewee | Role-protected example |

### Request / response shapes

**Register** `POST /api/auth/register`
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "interviewee" }
```
→ `201` returns
```json
{ "token": "<jwt>", "token_type": "bearer", "id": 1, "name": "Alice", "email": "alice@example.com", "role": "interviewee" }
```
The frontend `authSlice` stores the whole payload as `user`, so it can read
`user.token` once real API calls replace the mock.

**Login** `POST /api/auth/login`
```json
{ "email": "alice@example.com", "password": "secret123" }
```
→ `200` returns the same `TokenResponse` shape.

## Structure

```
backend/
├── app/
│   ├── api/auth/__init__.py   # auth router (register/login/me/role guards)
│   ├── core/
│   │   ├── config.py          # pydantic-settings (DATABASE_URL, SECRET_KEY…)
│   │   ├── database.py        # engine, SessionLocal, Base, get_db
│   │   └── security.py        # password hashing + JWT helpers
│   ├── models/user.py         # User model, roles, timestamps, unique email
│   ├── schemas/               # Pydantic request/response models
│   ├── services/auth_service.py  # auth business logic
│   ├── main.py                # FastAPI app, CORS, router wiring, uvicorn
│   └── __init__.py
├── scripts/check_db.py        # DB connection / table check helper
├── tests/                     # pytest suite (BE-06) — uses isolated SQLite
├── requirements.txt
├── .env.example
└── .gitignore
```

## Tests

```bash
pytest            # runs the auth/role test suite (isolated in-memory SQLite)
```

Covers: registration, duplicate-email guard, invalid role, login success,
invalid credentials, protected routes, and recruiter/interviewee role
restrictions (BE-06).

## Notes for collaborators

- Other feature domains (assessments, questions, submissions, feedback,
  invitations, notifications, results) have reserved router folders under
  `app/api/` and are not implemented yet.
- For production use Alembic migrations under `app/migrations/` instead of the
  startup `create_all`.
