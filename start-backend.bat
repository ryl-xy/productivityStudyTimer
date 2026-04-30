@echo off
REM Backend startup script for Productivity Study Timer (Windows)
REM This script installs dependencies and starts the Node.js/Express server

echo.
echo ============================================
echo Productivity Study Timer - Backend Server
echo ============================================
echo.

echo 1. Installing backend dependencies...
call npm install express sqlite3 cors

if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo 2. Starting backend server on http://0.0.0.0:5000
echo.
echo Note: The app will connect to http://10.0.2.2:5000 (Android emulator default)
echo.

node services/todoService.js

pause
