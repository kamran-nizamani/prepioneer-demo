# PrepPioneer Startup Script with Exam Content Integration
# Run this script to start both backend and frontend servers

Write-Host "🚀 Starting PrepPioneer Platform..." -ForegroundColor Green
Write-Host ""

# Check if ports are available
Write-Host "🔍 Checking ports..." -ForegroundColor Cyan
$backendPort = Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue
$frontendPort = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue

if ($backendPort.TcpTestSucceeded) {
    Write-Host "✅ Backend already running on port 5000" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Starting Backend Server (port 5000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; node server.js"
    Start-Sleep -Seconds 3
}

if ($frontendPort.TcpTestSucceeded) {
    Write-Host "✅ Frontend already running on port 5173" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Starting Frontend Server (port 5173)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "✨ PrepPioneer Platform Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 New Feature: Exam Content Pages!" -ForegroundColor Magenta
Write-Host "   • View detailed exam guides for all 8 Pakistani exams" -ForegroundColor White
Write-Host "   • Click 'View Complete Details' on any exam card" -ForegroundColor White
Write-Host "   • Access comprehensive preparation roadmaps (30-Day/3-Month/6-Month)" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Test Exam Content API:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000/api/public/exam-content/CSS" -ForegroundColor White
Write-Host "   http://localhost:5000/api/public/exam-content/MDCAT" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring..." -ForegroundColor Gray
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "`n👋 Shutting down..." -ForegroundColor Yellow
}
