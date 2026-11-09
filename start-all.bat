@echo off
TITLE Medisense AI Healthcare Ecosystem - Local Runner
echo =========================================================================
echo    MEDISENSE AI - CONNECTED HEALTHCARE ECOSYSTEM
echo    Production-Style MVP [Backend + Frontend + PGlite Embedded Database]
echo =========================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "NODE_EXE=%SCRIPT_DIR%..\nodejs\node.exe"

if not exist "%NODE_EXE%" (
    set "NODE_EXE=node"
)

echo [1/3] Verifying Node runtime...
"%NODE_EXE%" -v

echo [2/3] Starting Medisense Backend API Server on port 4000...
start "Medisense Backend (Port 4000)" cmd /k "cd /d "%SCRIPT_DIR%backend" && "%NODE_EXE%" node_modules\tsx\dist\cli.mjs src\server.ts"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Medisense React Frontend Web Application on port 3000...
start "Medisense Frontend (Port 3000)" cmd /k "cd /d "%SCRIPT_DIR%frontend" && "%NODE_EXE%" node_modules\vite\bin\vite.js --port 3000 --open"

echo.
echo =========================================================================
echo    Medisense AI Ecosystem running!
echo    - Frontend Web App: http://localhost:3000
echo    - Backend API:      http://localhost:4000
echo    - Health Check:     http://localhost:4000/health
echo =========================================================================
echo.
pause
