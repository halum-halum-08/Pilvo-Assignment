#!/bin/bash

# Deploy the status page app to free hosting services
set -e

echo "🚀 Deploying Status Page Application to free hosting services..."

# Step 1: Deploy frontend to Vercel
echo "📦 Deploying frontend to Vercel..."
cd status-frontend

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
  npm install -g vercel
fi

# Deploy to Vercel
vercel --prod

# Step 2: Deploy backend to Render
echo "📦 Deploying backend to Render..."
cd ../status-backend

# Check if render-cli is installed
if ! command -v render &> /dev/null; then
  echo "Render CLI not found. You can deploy manually through Render Dashboard."
  echo "Visit: https://dashboard.render.com/select-repo?type=web"
  echo "Make sure to connect your GitHub repository and select the status-backend directory."
else
  render deploy
fi

echo "✅ Deployment process completed!"
echo "Frontend URL: https://status-page-frontend.vercel.app"
echo "Backend URL: https://status-backend.onrender.com"
echo ""
echo "Note: For first-time deployment, you need to:"
echo "1. Create a Vercel account at vercel.com"
echo "2. Create a Render account at render.com"
echo "3. Connect your GitHub repository to both services"
