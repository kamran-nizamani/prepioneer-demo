# PrepPioneer Automated Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 PrepPioneer Startup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$serverPath = Join-Path $projectRoot "server"
$clientPath = Join-Path $projectRoot "client"

# Check if paths exist
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server directory not found: $serverPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $clientPath)) {
    Write-Host "❌ Client directory not found: $clientPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Project root: $projectRoot" -ForegroundColor Green
Write-Host ""

# Function to start backend in new window
function Start-Backend {
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
    
    $backendScript = @"
`$host.UI.RawUI.WindowTitle = 'PrepPioneer Backend'
Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan
cd '$serverPath'
Write-Host '📦 Installing dependencies...' -ForegroundColor Yellow
npm install
Write-Host '🔨 Generating Prisma Client...' -ForegroundColor Yellow
npx prisma generate
Write-Host '🗄️  Running database migrations...' -ForegroundColor Yellow
npx prisma migrate dev --name auto_migration
Write-Host '🌱 Seeding database...' -ForegroundColor Yellow
npx prisma db seed
Write-Host '🚀 Starting server...' -ForegroundColor Green
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    Write-Host "✅ Backend terminal opened" -ForegroundColor Green
}

# Function to start frontend in new window
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
    
    $frontendScript = @"
`$host.UI.RawUI.WindowTitle = 'PrepPioneer Frontend'
Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Cyan
cd '$clientPath'
Write-Host '📦 Installing dependencies...' -ForegroundColor Yellow
npm install
Write-Host '🚀 Starting development server...' -ForegroundColor Green
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "✅ Frontend terminal opened" -ForegroundColor Green
}

# Start both servers
Write-Host "🚀 Launching servers..." -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 1
Start-Backend

Write-Host ""
Write-Host "⏳ Waiting 5 seconds before starting frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Start-Frontend

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Check the new terminal windows for server status" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:      admin@preppioneer.com / AdminPassword123" -ForegroundColor White
Write-Host "   Instructor: instructor@preppioneer.com / InstructorPass123" -ForegroundColor White
Write-Host "   Student:    student1@preppioneer.com / StudentPass123" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait ~10-15 seconds for servers to fully start" -ForegroundColor Yellow
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
