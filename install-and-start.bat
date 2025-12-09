@echo off
echo ==========================================
echo      PrepPioneer Installer & Launcher
echo ==========================================
echo.

echo [1/4] Checking for Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)
echo Node.js is installed.
echo.

echo [2/4] Setting up Backend (Server)...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install
) else (
    echo Server dependencies already installed.
)

echo Running database setup...
call npx prisma generate
call npx prisma migrate dev --name auto_migration
call npx prisma db seed
cd ..
echo.

echo [3/4] Setting up Frontend (Client)...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
) else (
    echo Client dependencies already installed.
)
cd ..
echo.

echo [4/4] Starting Servers...
echo.
echo Starting Backend Server in a new window...
start "PrepPioneer Backend" cmd /k "cd server && npm run dev"

echo Starting Frontend Client in a new window...
start "PrepPioneer Frontend" cmd /k "cd client && npm run dev"

echo.
echo ==========================================
echo      Servers are starting!
echo ==========================================
echo.
echo Please wait about 10-15 seconds.
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo If a window closes immediately, there was an error.
echo Check the window output for details.
echo.
pause
