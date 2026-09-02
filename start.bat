@echo off
REM Smart Recruiter - start the backend (port 5000) on Windows
REM
REM Usage:   start.bat             REM start the backend
REM          start.bat --stop      REM stop any process listening on port 5000
REM
REM For Linux/macOS use ./start.sh instead.

setlocal ENABLEDELAYEDEXPANSION

set PORT=5000
set REPO_ROOT=%~dp0
set BACKEND_DIR=%REPO_ROOT%backend

REM --- Stop mode ---
if "%1"=="--stop" (
    for /f "tokens=5" %%P in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
        echo Stopping PID %%P on port %PORT%
        taskkill /F /PID %%P >nul 2>&1
    )
    echo done.
    exit /b 0
)

REM --- Kill anything already on the port (best-effort) ---
for /f "tokens=5" %%P in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /F /PID %%P >nul 2>&1
)

REM --- venv ---
cd /d "%BACKEND_DIR%"
if not exist ".venv\Scripts\activate.bat" (
    echo ERROR: venv not found. Run setup.bat first.
    exit /b 1
)
call .venv\Scripts\activate.bat

REM --- env ---
if not exist ".env" (
    if exist ".env.example" (
        echo Creating backend\.env from .env.example
        copy /Y .env.example .env >nul
    )
)

REM --- launch (start /B so it survives the script) ---
set LOG=%TEMP%\smart_recruiter_backend.log
echo ==========================================
echo   Smart Recruiter - starting backend
echo   listening on http://localhost:%PORT%
echo   logs: %LOG%
echo ==========================================
start /B "" python -m uvicorn app.main:app --host 0.0.0.0 --port %PORT% > %LOG% 2>&1

REM --- wait for /health ---
echo Waiting for backend
:WAIT_LOOP
timeout /t 1 /nobreak >nul
curl -fs http://127.0.0.1:%PORT%/health >nul 2>&1
if errorlevel 1 goto WAIT_LOOP

echo.
echo Backend is RUNNING on http://localhost:%PORT%
echo.
echo Next: in a SEPARATE terminal, start the frontend:
echo     cd "%REPO_ROOT%frontend"
echo     npm run dev
echo.
echo Then open http://localhost:5173 and log in with:
echo     recruiter@demo.com / secret123    (or candidate@demo.com)
echo.
echo To stop the backend later:  start.bat --stop
endlocal
