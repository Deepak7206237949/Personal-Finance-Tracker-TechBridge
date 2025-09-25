# Personal Finance Tracker Deployment Script (PowerShell)

Write-Host "🚀 Starting deployment of Personal Finance Tracker..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your environment variables." -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Validate required environment variables
$requiredVars = @("DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET")
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        Write-Host "❌ Error: $var is not set in .env file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional)
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
docker system prune -f

# Build and start containers
Write-Host "🏗️ Building and starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if services are running
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend health check failed" -ForegroundColor Red
}

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
}

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:4000/api-docs" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔐 Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@finance.com" -ForegroundColor White
Write-Host "Password: SecureAdmin2024!" -ForegroundColor White
