@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo ===================================================
echo   Starting RenderLab AI-Powered Practice Suite
echo ===================================================
echo.

:: Check if port 8000 is already running
netstat -ano | findstr :8000 | findstr LISTENING > nul
if %errorlevel% equ 0 (
    echo [INFO] Backend is already running on http://127.0.0.1:8000
) else (
    echo [INFO] Starting FastAPI Backend on port 8000 with auto-reload...
    start "RenderLab Backend" cmd /k "backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
)

:: Check if frontend is already running on 5173 or 5174
netstat -ano | findstr :5173 | findstr LISTENING > nul
set F1=%errorlevel%
netstat -ano | findstr :5174 | findstr LISTENING > nul
set F2=%errorlevel%

if %F1% equ 0 (
    echo [INFO] Frontend is already running on http://localhost:5173
) else if %F2% equ 0 (
    echo [INFO] Frontend is already running on http://localhost:5174
) else (
    echo [INFO] Starting Vite Frontend...
    start "RenderLab Frontend" cmd /k "cd frontend && npm run dev"
)

echo.
echo ===================================================
echo   RenderLab is Ready!
echo   - Backend:  http://127.0.0.1:8000/docs
echo   - Frontend: http://localhost:5174 (or 5173)
echo ===================================================
echo.
pause
