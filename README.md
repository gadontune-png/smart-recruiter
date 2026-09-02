# Smart Recruiter — DebugMasters

> A technical assessment and automated interview platform for evaluating software development candidates.

Smart Recruiter is a web-based technical assessment platform inspired by platforms such as Coderbyte. It allows recruiters to create and manage technical assessments while giving interviewees a structured environment to complete coding challenges, multiple-choice questions, free-text questions, and whiteboard exercises.

The platform is being developed by **DebugMasters** as a full-stack application.

---

## Project Overview

### Problem

Traditional technical interviews can be time-consuming and difficult to standardize. Interviewers need to manually prepare questions, monitor candidates, evaluate answers, and manage feedback.

Smart Recruiter aims to automate and organize this process through a centralized assessment platform.

### Goal

Build a platform where:

- Recruiters can create and publish technical assessments.
- Interviewees can receive and accept assessment invitations.
- Candidates can complete assessments within a defined time limit.
- Coding and whiteboard challenges can be submitted digitally.
- Recruiters can review answers and provide feedback.
- Results and performance statistics can be generated and reviewed.
- Interviewees can access feedback after grades are released.

---

## Core User Types

The platform has two primary user types.

### Recruiter

Recruiters can:

- Create assessments (title, description, time limit).
- Build a question bank inside each assessment: multiple-choice, free-text, and coding challenges.
- Import coding challenges directly from Codewars (kata ID or URL).
- Invite interviewees individually or in bulk, with optional bulk email.
- View submitted assessments, sort by score, and review individual answers.
- Release grades and leave per-answer feedback.
- View performance statistics and result breakdowns.

### Interviewee

Interviewees can:

- Log in and manage their profile.
- Receive assessment invitations and notifications.
- Accept invitations and view assessment schedules.
- Take trial (practice) assessments with no risk.
- Take real assessments with a live countdown timer and auto-submit on expiry.
- Answer multiple-choice and free-text questions.
- Run and submit code against the built-in judge, and complete whiteboard exercises.
- View released grades and mentor feedback.

---

## Technology Stack

### Frontend

- React 18 (JavaScript)
- Redux Toolkit
- React Router v6
- Vite (dev server + build)
- ESLint
- lucide-react (icons)

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy ORM
- Pydantic v2
- python-jose (JWT) + passlib (bcrypt) for auth
- httpx (for the Codewars client)

### Database

- SQLite (development) — the app uses `backend/dev_smart_recruiter.db`.
- SQLAlchemy is in use, so swapping in PostgreSQL for production is a configuration change rather than a rewrite.

### Testing

- Backend: `pytest` (see `backend/tests/` and `backend/app/tests/`).
- Frontend: ESLint for static checks; no JS test runner is currently configured.

### External API

- **Codewars API** — consumed to fetch kata details (title, description, difficulty, languages) that can be imported as coding questions in an assessment. Endpoints used: `GET /kata/{id}` via the backend's `/api/codewars/katas/{kata_id}` route.

---

## Authentication

- JWT (HS256) access tokens issued by the backend on login/register and verified via `Authorization: Bearer <token>`.
- Passwords are stored as bcrypt hashes.
- Role-based access: `recruiter` and `interviewee` are enforced on protected routes (e.g. only recruiters can create assessments or invite candidates).
- Frontend persists the token + user in `localStorage` under `sr_auth` and rehydrates on reload.

## Demo Accounts

The development database is seeded with two demo accounts (password `secret123` for both):

- `recruiter@demo.com` — Recruiter Demo
- `candidate@demo.com` — Candidate Demo

You can also register new accounts from the Sign Up page.

---

## Running Locally

> Requires Python 3.12+ and Node 18+. The frontend expects the backend on the URL configured in `frontend/.env` (default `http://localhost:5000/api`).

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

The SQLite database is created automatically on first start at `backend/dev_smart_recruiter.db`. Health check: `GET /health` → `{"status":"ok"}`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Other useful commands:

```bash
npm run lint     # ESLint
npm run build    # production bundle in dist/
```

### 3. Run the test suite

```bash
cd backend
.venv/bin/python -m pytest -q
```

---

## API Surface (overview)

All routes are mounted under `/api`:

| Area        | Endpoints                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Auth        | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`                                                 |
| Assessments | `GET/POST /assessments`, `GET /assessments/my`, `GET/PATCH/DELETE /assessments/{id}`, `POST /assessments/{id}/publish`, `GET/POST /assessments/{id}/questions` |
| Questions   | `GET /questions`, `GET /questions/{id}`, `POST /questions`, `PATCH /questions/{id}`, `DELETE /questions/{id}` |
| Attempts    | `POST /assessments/{id}/start`, `GET /attempts/{id}`, `GET/POST /attempts/{id}/answers`, `POST /attempts/{id}/submit` |
| Submissions | `POST /submissions/code`, `POST /submissions/code/run`, `GET /submissions/{id}`                             |
| Invitations | `GET /invitations` (role-filtered), `POST /invitations`, `POST /invitations/bulk`, `POST /invitations/{id}/accept`, `DELETE /invitations/{id}` |
| Notifications | `GET /notifications?user_id=`, `PATCH /notifications/{id}/read`                                            |
| Results     | `GET /assessments/{id}/results`, `POST /assessments/{id}/release-grades`                                   |
| Feedback    | `POST /feedback`, `GET /answers/{id}/feedback`                                                              |
| Codewars    | `GET /codewars/katas/{kata_id}`                                                                             |
