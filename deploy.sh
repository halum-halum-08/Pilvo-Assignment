#!/bin/bash

# Build and deploy script for Status Page application
set -e

echo "🚀 Starting deployment process..."

# Step 1: Build the frontend
echo "📦 Building frontend..."
cd status-frontend
npm run build:production
echo "✅ Frontend build completed"

# Step 2: Build the backend
echo "📦 Building backend..."
cd ../status-backend
npm run deploy:prepare
echo "✅ Backend build completed"

# Step 3: Deploy based on target
if [ "$1" == "vercel" ]; then
  echo "🚀 Deploying frontend to Vercel..."
  cd ../status-frontend
  npx vercel --prod
elif [ "$1" == "netlify" ]; then
  echo "🚀 Deploying frontend to Netlify..."
  cd ../status-frontend
  npx netlify deploy --prod
elif [ "$1" == "docker" ]; then
  echo "🚀 Deploying backend with Docker..."
  cd ../status-backend
  docker-compose -f docker-compose.yml up -d
else
  echo "🚀 Deployment packages prepared"
  echo "To deploy frontend to Vercel: cd status-frontend && npx vercel --prod"
  echo "To deploy frontend to Netlify: cd status-frontend && npx netlify deploy --prod"
  echo "To deploy backend with Docker: cd status-backend && docker-compose -f docker-compose.yml up -d"
fi

echo "✨ Deployment process completed!"
