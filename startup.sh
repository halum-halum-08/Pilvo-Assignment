#!/bin/bash

echo "🚀 Starting Status Page application..."

# Check if backend dependencies are installed
if [ ! -d "status-backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd status-backend && npm install
  cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "status-frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd status-frontend && npm install
  cd ..
fi

# Check if Prisma is generated
if [ ! -d "status-backend/node_modules/.prisma" ]; then
  echo "🔄 Generating Prisma client..."
  cd status-backend && npx prisma generate
  cd ..
fi

# Verify backend port is available
PORT=3001
if lsof -i :$PORT > /dev/null; then
  echo "⚠️ Port $PORT is already in use. Please close the application using this port."
  lsof -i :$PORT
  exit 1
fi

# Verify frontend port is available
PORT=3001
if lsof -i :$PORT > /dev/null; then
  echo "⚠️ Port $PORT is already in use. Please close the application using this port."
  lsof -i :$PORT
  exit 1
fi

echo "🔄 Starting services..."
npm run dev
