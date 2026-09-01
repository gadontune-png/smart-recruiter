#!/bin/bash
echo "========================================="
echo "  Smart Recruiter - Starting Backend"
echo "========================================="

# Kill any existing server
fuser -k 5000/tcp 2>/dev/null
sleep 1

cd /home/gadontune/smart-recruiter/backend
source .venv/bin/activate

# Start server in a new session so it survives
setsid python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 > /tmp/smart_recruiter_backend.log 2>&1 &
BGPID=$!

# Wait for server to be ready
echo "Waiting for backend..."
for i in $(seq 1 10); do
    if curl -s http://127.0.0.1:5000/health > /dev/null 2>&1; then
        echo ""
        echo "Backend is RUNNING on http://localhost:5000"
        echo ""
        echo "Now run in a SEPARATE terminal:"
        echo "  cd /home/gadontune/smart-recruiter/frontend"
        echo "  npm run dev"
        echo ""
        echo "Then open http://localhost:5173"
        echo ""
        echo "Login with:"
        echo "  Register a new account at http://localhost:5173/register"
        echo "  OR use: interviewee@demo.com / secret123"
        echo ""
        exit 0
    fi
    sleep 1
    echo -n "."
done

echo ""
echo "ERROR: Backend failed to start. Check /tmp/smart_recruiter_backend.log"
cat /tmp/smart_recruiter_backend.log
