@echo off
REM Smart Recruiter - first-time setup (Windows)
REM
REM Usage:   setup.bat                  REM install backend + seed DB
REM          setup.bat --frontend       REM also install frontend deps
REM          setup.bat --with-db        REM start the Postgres container
REM          setup.bat --with-db --frontend
REM
REM Postgres is REQUIRED.
REM For Linux/macOS use ./setup.sh instead.

setlocal ENABLEDELAYEDEXPANSION

set WITH_FRONTEND=0
set WITH_DB=0
for %%A in (%*) do (
    if "%%~A"=="--frontend" set WITH_FRONTEND=1
    if "%%~A"=="--with-db"  set WITH_DB=1
)

REM --- Python check ---
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python is not in PATH. Install Python 3.10+ and retry.
    exit /b 1
)
echo Using python:
python --version

REM --- Postgres ---
echo.
echo ==^> [1/4] PostgreSQL
if "%WITH_DB%"=="1" (
    where docker >nul 2>nul
    if errorlevel 1 (
        echo ERROR: --with-db requested but 'docker' is not in PATH.
        echo Install Docker Desktop and retry, or set up native Postgres
        echo and put its connection string in backend\.env DATABASE_URL.
        exit /b 1
    )
    echo Starting Postgres container (docker compose up -d)...
    docker compose up -d
    echo Waiting for Postgres to accept connections...
    :WAIT_PG
    timeout /t 2 /nobreak >nul
    docker compose exec -T postgres pg_isready -U smartrecruiter -d smartrecruiter >nul 2>&1
    if errorlevel 1 goto WAIT_PG
    echo Postgres is up.
) else (
    echo Skipping Postgres container start (no --with-db).
    echo Make sure your backend\.env DATABASE_URL points at a reachable Postgres.
)

REM --- Backend ---
echo.
echo ==^> [2/4] Setting up Python venv in backend\.venv
cd /d "%~dp0backend"
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo ==^> [3/4] Installing backend dependencies
python -m pip install --upgrade pip >nul
pip install -r requirements.txt

if not exist ".env" (
    echo Creating backend\.env from .env.example
    copy /Y .env.example .env >nul
)

REM --- Database schema + seed ---
echo.
echo ==^> [4/4] Seeding demo accounts
python -c "import app.main; from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)" >nul
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
