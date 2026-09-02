# Smart Recruiter — DebugMasters

> A technical assessment and automated interview platform for evaluating software development candidates.

Smart Recruiter is a web-based technical assessment platform inspired by platforms such as Coderbyte. It allows recruiters to create and manage technical assessments while giving interviewees a structured environment to complete coding challenges, multiple-choice questions, free-text questions, and whiteboard exercises.

The platform is being developed by **DebugMasters** as a full-stack application.

**👉 [Jump to Quickstart →](#quickstart-tldr)** to run the app on your machine in 3 commands.

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

## Quickstart (TL;DR)

> **One-time setup, then start the backend, then start the frontend in a second terminal.**
> The frontend is hard-wired to the backend URL in `frontend/.env` (`VITE_API_URL=http://localhost:5000/api`), so the **backend must run on port 5000** for the UI to work. Don't change the port unless you also change the `.env`.

**Requirements**

- Python 3.10+ (3.12 recommended)
- Node.js 18+
- npm 9+ (bundled with Node 18)
- Bash (Linux/macOS) or Command Prompt (Windows) — WSL/Git Bash also fine on Windows

### Quickstart (Linux / macOS)

```bash
git clone <this-repo>
cd smart-recruiter

./setup.sh --frontend    # creates backend venv, installs deps, seeds DB, installs frontend deps
./start.sh               # starts backend on :5000 (logs: /tmp/smart_recruiter_backend.log)
```

In a **second terminal**:

```bash
cd frontend
npm run dev              # http://localhost:5173
```

Open <http://localhost:5173> and log in with one of the demo accounts (see below).

### Quickstart (Windows)

```bat
git clone <this-repo>
cd smart-recruiter

setup.bat --frontend     REM creates backend venv, installs deps, seeds DB, installs frontend deps
start.bat                REM starts backend on :5000
```

In a **second Command Prompt**:

```bat
cd frontend
npm run dev              REM http://localhost:5173
```

Open <http://localhost:5173> and log in.

> **Heads up — port 5000:** the frontend's `frontend/.env` ships pointing at `http://localhost:5000/api`. If you start the backend on a different port, the UI will look broken (every page shows "Failed to fetch"). Either keep the backend on 5000 or update `frontend/.env` and restart `npm run dev`.

### Demo Accounts

After running the setup script, these accounts exist in the seeded database:

| Role       | Email                  | Password   |
| ---------- | ---------------------- | ---------- |
| Recruiter  | `recruiter@demo.com`   | `secret123` |
| Interviewee| `candidate@demo.com`   | `secret123` |

You can also click **Sign Up** on the login page to create new accounts.

### Manual Setup (if you'd rather run the steps yourself)

#### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Create your local env file (only if it doesn't exist)
[ -f .env ] || cp .env.example .env

# Seed the demo accounts (idempotent — safe to re-run)
python -m app.scripts.seed
```

#### Start the backend

```bash
# from the backend/ directory, with the venv activated
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

The SQLite database is created automatically on first start at `backend/dev_smart_recruiter.db`. Health check: `GET /health` → `{"status":"ok"}`.

#### Frontend

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

#### Run the test suite

```bash
cd backend
.venv/bin/python -m pytest -q
```

---

## Troubleshooting

**`Failed to fetch` on every page in the UI.**
The frontend can't reach the backend. Check (1) backend is running on port 5000 — `curl http://localhost:5000/health` should return `{"status":"ok", ...}`; (2) `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`; (3) no firewall blocking localhost.

**`pydantic` / `passlib` / `bcrypt` import error after `pip install`.**
Your existing venv predates `requirements.txt`. Recreate it:
```bash
cd backend && rm -rf .venv && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

**`Invalid or expired token` immediately after login.**
JWT secret changed. If you rotated `jwt_secret` in `backend/.env` mid-session, your stored token in the browser is invalid — sign out and back in. Also make sure all teammates agree on the same `jwt_secret` (default is `dev-secret-change-me`).

**`sqlite3.OperationalError: unable to open database file` on first run.**
`backend/` is not writable, or `DATABASE_URL` in `backend/.env` points to an unwritable path. Check the path is relative to the `backend/` directory (default `sqlite:///./dev_smart_recruiter.db`).

**Backend won't start because port 5000 is busy.**
Run `./start.sh --stop` (or `start.bat --stop` on Windows) to free the port. On macOS, *AirPlay Receiver* uses port 5000 — disable it in System Settings → AirDrop & Handoff, or change the backend port and update `frontend/.env` to match.

**Codewars import shows "Failed to import kata".**
The Codewars public API is reachable only with outbound internet access. The backend uses `httpx` against `https://www.codewars.com/api/v1` (configurable via `codewars_base_url` in `backend/.env`).

**`npm run dev` shows CORS errors in the browser console.**
The backend is configured to allow `http://localhost:5173` and `http://127.0.0.1:5173`. If your dev server runs on a different host/port (e.g. `0.0.0.0:5173` or a LAN IP), update `allow_origins` in `backend/app/main.py`.

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
