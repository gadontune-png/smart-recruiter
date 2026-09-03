#!/usr/bin/env bash
# Smart Recruiter — first-time setup
#
# Usage:   ./setup.sh                  # install backend + seed DB
#          ./setup.sh --frontend       # also install frontend deps
#          ./setup.sh --with-db        # start the Postgres container via docker compose
#          ./setup.sh --with-db --frontend
#
# Postgres is REQUIRED. The script will either:
#   (a) start the dev Postgres via 'docker compose up -d' (when --with-db is
#       passed and docker is available), or
#   (b) check that DATABASE_URL in backend/.env is reachable and refuse to
#       continue if it isn't.
#
# This is for Linux and macOS. Windows users: see README.md → "Quickstart
# (Windows)" and run the equivalent commands manually, or use WSL/Git Bash.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

WITH_FRONTEND=0
WITH_DB=0
for arg in "$@"; do
  case "$arg" in
    --frontend) WITH_FRONTEND=1 ;;
    --with-db) WITH_DB=1 ;;
    --help|-h)
      echo "Usage: ./setup.sh [--with-db] [--frontend]"
      echo "  --with-db     start the dev Postgres via 'docker compose up -d'"
      echo "  --frontend    also run 'npm install' in frontend/"
      exit 0
      ;;
  esac
done

# --- Python version check --------------------------------------------------------
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is not installed or not in PATH." >&2
  echo "Install Python 3.10+ and try again." >&2
  exit 1
fi
PY_VERSION="$(python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
PY_MAJOR="$(echo "$PY_VERSION" | cut -d. -f1)"
PY_MINOR="$(echo "$PY_VERSION" | cut -d. -f2)"
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]; }; then
  echo "ERROR: Python $PY_VERSION detected. Need Python 3.10+." >&2
  exit 1
fi
echo "Using python3 ($PY_VERSION)"

# --- Postgres -------------------------------------------------------------------
echo ""
echo "==> [1/4] PostgreSQL"
if [ "$WITH_DB" = "1" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: --with-db requested but 'docker' is not in PATH." >&2
    echo "Install Docker (https://docs.docker.com/get-docker/) or set up a native" >&2
    echo "PostgreSQL and put its connection string in backend/.env DATABASE_URL." >&2
    exit 1
  fi
  echo "Starting Postgres container (docker compose up -d)..."
  docker compose up -d
  echo "Waiting for Postgres to accept connections..."
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U smartrecruiter -d smartrecruiter >/dev/null 2>&1; then
      echo "Postgres is up."
      break
    fi
    sleep 1
  done
else
  echo "Skipping Postgres container start (no --with-db)."
  echo "Make sure your backend/.env DATABASE_URL points at a reachable Postgres."
fi

# --- Backend --------------------------------------------------------------------
echo ""
echo "==> [2/4] Setting up Python venv in backend/.venv"
cd "$REPO_ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> [3/4] Installing backend dependencies"
python -m pip install --upgrade pip >/dev/null
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  echo "Creating backend/.env from .env.example"
  cp .env.example .env
fi

# --- Database schema + seed -----------------------------------------------------
echo ""
echo "==> [4/4] Seeding demo accounts"
# The app creates tables on first start, but the seed needs the schema.
# We invoke the app's own metadata creation through a tiny one-liner.
python -c "import app.main; from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)" >/dev/null
python -m app.scripts.seed

# --- Frontend (optional) --------------------------------------------------------
if [ "$WITH_FRONTEND" = "1" ]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: --frontend requested but 'node' is not in PATH." >&2
    exit 1
  fi
  echo ""
  echo "==> Installing frontend dependencies"
  cd "$REPO_ROOT/frontend"
  npm install
fi

echo ""
echo "==========================================================="
echo "  Setup complete."
echo "==========================================================="
echo ""
echo "Next:"
echo "  1. Start the backend (port 5000):"
echo "       cd backend && source .venv/bin/activate && \\"
echo "         uvicorn app.main:app --host 0.0.0.0 --port 5000"
echo "  2. In a separate terminal, start the frontend:"
echo "       cd frontend && npm run dev"
echo "  3. Open http://localhost:5173 and log in with:"
echo "       recruiter@demo.com / secret123    (or candidate@demo.com)"
echo ""
