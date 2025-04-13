#!/bin/bash

echo "Starting Status Page Application..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start both frontend and backend
echo "Starting development servers..."
npm run dev
