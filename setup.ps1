# Personal Finance Tracker Setup Script for Windows PowerShell
# Run this script from the personal-finance-tracker directory

Write-Host "🚀 Setting up Personal Finance Tracker..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Setup Backend
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location backend

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "✅ Backend setup complete!" -ForegroundColor Green

# Setup Frontend
Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Yellow
Set-Location ../frontend

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green

# Return to root directory
Set-Location ..

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "Option 1 - Local Development:" -ForegroundColor White
Write-Host "1. Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "`nOption 2 - Production Deployment:" -ForegroundColor White
Write-Host "1. Configure .env file with production settings" -ForegroundColor White
Write-Host "2. Use Docker: docker-compose -f docker-compose.prod.yml up --build" -ForegroundColor White
Write-Host "3. Or deploy to cloud platform using Dockerfile" -ForegroundColor White
Write-Host "`nAccess Points:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "API Docs: http://localhost:4000/api-docs" -ForegroundColor White
Write-Host "`nDemo credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin@finance.com / SecureAdmin2024!" -ForegroundColor White
