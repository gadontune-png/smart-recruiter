#!/usr/bin/env bash
# Smart Recruiter — start the backend (port 5000)
#
# Usage:   ./start.sh             # start backend, wait until healthy, then print next steps
#          ./start.sh --stop      # stop any process listening on port 5000
#
# Runs the FastAPI app on 0.0.0.0:5000 so the frontend at
# http://localhost:5173 (configured in frontend/.env) can reach it.
#
# If you have a Python virtualenv at backend/.venv, this script will activate
# it for you. Otherwise it falls back to whatever `python` resolves to.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
PORT=5000

# --- helpers ---------------------------------------------------------------------
have() { command -v "$1" >/dev/null 2>&1; }

# Try to free the port (kill any prior server) unless --keep.
if [[ "${1:-}" == "--stop" ]]; then
  if have fuser; then fuser -k "${PORT}/tcp" 2>/dev/null || true
  elif have lsof; then lsof -ti tcp:"${PORT}" | xargs -r kill -9 2>/dev/null || true
  fi
  echo "stopped (any process on port ${PORT})"
  exit 0
fi

if have fuser; then fuser -k "${PORT}/tcp" 2>/dev/null || true
elif have lsof; then lsof -ti tcp:"${PORT}" | xargs -r kill -9 2>/dev/null || true
fi
sleep 1

# --- python / venv ---------------------------------------------------------------
if [ -f "$BACKEND_DIR/.venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.venv/bin/activate"
  PYTHON=python
elif have python3; then
  PYTHON=python3
elif have python; then
  PYTHON=python
else
  echo "ERROR: no Python interpreter found. Install Python 3.10+ and retry." >&2
  exit 1
fi

# --- env file --------------------------------------------------------------------
cd "$BACKEND_DIR"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "Creating backend/.env from .env.example"
    cp .env.example .env
  else
    echo "WARNING: backend/.env is missing and no .env.example found."
  fi
fi

# --- launch ----------------------------------------------------------------------
LOG=/tmp/smart_recruiter_backend.log
echo "=========================================="
echo "  Smart Recruiter — starting backend"
echo "  listening on http://localhost:${PORT}"
echo "  logs: ${LOG}"
echo "=========================================="

# setsid so the server keeps running after this script returns to the shell.
setsid "$PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" > "${LOG}" 2>&1 < /dev/null &
BGPID=$!

# Wait up to ~15s for /health to respond.
echo -n "Waiting for backend"
for i in $(seq 1 30); do
  if curl -fs "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    echo ""
    echo ""
    echo "Backend is RUNNING (pid=${BGPID}) on http://localhost:${PORT}"
    echo ""
    echo "Next: in a SEPARATE terminal, start the frontend:"
    echo "    cd \"${REPO_ROOT}/frontend\""
    echo "    npm run dev"
    echo ""
    echo "Then open http://localhost:5173 and log in with:"
    echo "    recruiter@demo.com / secret123    (or candidate@demo.com)"
    echo ""
    echo "To stop the backend later, run:    ./start.sh --stop"
    exit 0
  fi
  sleep 0.5
  echo -n "."
done

echo ""
echo "ERROR: backend did not become healthy in time. Last log lines:" >&2
tail -n 40 "$LOG" >&2 || true
exit 1
