#!/bin/bash

# Personal Finance Tracker Setup Script
# Run this script from the personal-finance-tracker directory

echo "🚀 Setting up Personal Finance Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Backend setup complete!"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

# Return to root directory
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "Option 1 - Docker Compose (Recommended):"
echo "   docker-compose up --build"
echo "   # Then in new terminal:"
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev --name init"
echo "   node prisma/seed.js"
echo ""
echo "Option 2 - Local Development:"
echo "1. Make sure MySQL running on localhost:3306"
echo "2. Backend: cd backend && npm run dev"
echo "3. Frontend: cd frontend && npm run dev"
echo ""
echo "Access Points:"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:4000"
echo "API Docs: http://localhost:4000/api-docs"
echo ""
echo "Demo credentials:"
echo "Admin: admin@demo.com / AdminPass123!"
echo "User: user@demo.com / UserPass123!"
echo "Read Only: readonly@demo.com / ReadOnly123"
