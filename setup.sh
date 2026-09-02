#!/usr/bin/env bash
# Smart Recruiter — first-time setup
#
# Usage:   ./setup.sh                 # install backend + seed DB
#          ./setup.sh --frontend      # also install frontend deps
#
# This is for Linux and macOS. Windows users: see README.md → "Quickstart
# (Windows)" and run the equivalent commands manually, or use WSL/Git Bash.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

WITH_FRONTEND=0
for arg in "$@"; do
  case "$arg" in
    --frontend) WITH_FRONTEND=1 ;;
    --help|-h)
      echo "Usage: ./setup.sh [--frontend]"
      echo "  --frontend   also run 'npm install' in frontend/"
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

# --- Backend ---------------------------------------------------------------------
echo ""
echo "==> [1/3] Setting up Python venv in backend/.venv"
cd "$REPO_ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> [2/3] Installing backend dependencies"
python -m pip install --upgrade pip >/dev/null
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  echo "==> Creating backend/.env from .env.example"
  cp .env.example .env
fi

echo "==> [3/3] Seeding demo accounts into the database"
python -m app.scripts.seed

# --- Frontend (optional) ---------------------------------------------------------
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
