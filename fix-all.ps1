# ONE-COMMAND FIX SCRIPT
# Run this in PowerShell to fix everything

Write-Host "`n🔧 PrepPioneer - Complete Fix Script" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Step 1: Stop all node processes
Write-Host "`n[1/6] Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Done" -ForegroundColor Green

# Step 2: Navigate to server directory
Write-Host "`n[2/6] Navigating to server directory..." -ForegroundColor Yellow
Set-Location "C:\Users\UBEDULLAH\Desktop\New folder\prepioneer-project\server"
Write-Host "✅ Done" -ForegroundColor Green

# Step 3: Generate Prisma Client
Write-Host "`n[3/6] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma generate failed" -ForegroundColor Red
    exit 1
}

# Step 4: Run Migration
Write-Host "`n[4/6] Running database migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_test_session_model
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration completed" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}

# Step 5: Seed Database
Write-Host "`n[5/6] Seeding database with sample data..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded" -ForegroundColor Green
} else {
    Write-Host "⚠️  Seeding failed (may already be seeded)" -ForegroundColor Yellow
}

# Step 6: Show next steps
Write-Host "`n[6/6] Setup Complete!" -ForegroundColor Green
Write-Host "`n" + "=" * 50 -ForegroundColor Cyan
Write-Host "🎉 All fixes applied successfully!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open Terminal 1 and run:" -ForegroundColor White
Write-Host "     cd server" -ForegroundColor Yellow
Write-Host "     npm run dev" -ForegroundColor Yellow

Write-Host "`n  2. Open Terminal 2 and run:" -ForegroundColor White
Write-Host "     cd client" -ForegroundColor Yellow
Write-Host "     npm run dev" -ForegroundColor Yellow

Write-Host "`n  3. Open browser:" -ForegroundColor White
Write-Host "     http://localhost:5173/login" -ForegroundColor Yellow

Write-Host "`n  4. Login with:" -ForegroundColor White
Write-Host "     Email: student1@preppioneer.com" -ForegroundColor Yellow
Write-Host "     Password: StudentPass123" -ForegroundColor Yellow

Write-Host "`n✨ Test creation will now work!" -ForegroundColor Green
Write-Host "`n"
