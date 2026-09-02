@echo off
REM Smart Recruiter - first-time setup (Windows)
REM
REM Usage:   setup.bat                 REM install backend + seed DB
REM          setup.bat --frontend      REM also install frontend deps
REM
REM For Linux/macOS use ./setup.sh instead.

setlocal ENABLEDELAYEDEXPANSION

set WITH_FRONTEND=0
if "%1"=="--frontend" set WITH_FRONTEND=1

REM --- Python check ---
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python is not in PATH. Install Python 3.10+ and retry.
    exit /b 1
)

echo Using python:
python --version

REM --- Backend ---
echo.
echo ==^> [1/3] Setting up Python venv in backend\.venv
cd /d "%~dp0backend"
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo ==^> [2/3] Installing backend dependencies
python -m pip install --upgrade pip >nul
pip install -r requirements.txt

if not exist ".env" (
    echo ==^> Creating backend\.env from .env.example
    copy /Y .env.example .env >nul
)

echo ==^> [3/3] Seeding demo accounts
python -m app.scripts.seed

REM --- Frontend (optional) ---
if "%WITH_FRONTEND%"=="1" (
    where node >nul 2>nul
    if errorlevel 1 (
        echo ERROR: --frontend requested but 'node' is not in PATH.
        exit /b 1
    )
    echo.
    echo ==^> Installing frontend dependencies
    cd /d "%~dp0frontend"
    call npm install
)

echo.
echo ===========================================================
echo   Setup complete.
echo ===========================================================
echo.
echo Next:
echo   1. Start the backend (port 5000):
echo        cd backend ^&^& .venv\Scripts\activate ^&^& uvicorn app.main:app --host 0.0.0.0 --port 5000
echo   2. In a separate terminal, start the frontend:
echo        cd frontend ^&^& npm run dev
echo   3. Open http://localhost:5173 and log in with:
echo        recruiter@demo.com / secret123    (or candidate@demo.com)
echo.
endlocal
