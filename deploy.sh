#!/bin/bash

# Personal Finance Tracker Deployment Script

echo "🚀 Starting deployment of Personal Finance Tracker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is not set in .env file"
    exit 1
fi

if [ -z "$JWT_ACCESS_SECRET" ]; then
    echo "❌ Error: JWT_ACCESS_SECRET is not set in .env file"
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "❌ Error: JWT_REFRESH_SECRET is not set in .env file"
    exit 1
fi

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

echo "🎉 Deployment completed!"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:4000"
echo "📚 API Documentation: http://localhost:4000/api-docs"

echo ""
echo "🔐 Default Admin Credentials:"
echo "Email: admin@finance.com"
echo "Password: SecureAdmin2024!"
