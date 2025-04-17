#!/bin/bash
# Run database migrations and setup

# Move to the project root directory
cd "$(dirname "$0")"

# Check if prisma is installed
if ! command -v prisma &> /dev/null
then
    echo "Prisma CLI not found, installing..."
    npm install -g prisma
fi

echo "Running Prisma migrations..."
npx prisma migrate dev --name init

echo "Generating Prisma client..."
npx prisma generate

echo "Seeding database with initial data..."
npx ts-node prisma/seed.ts

echo "Database setup complete!"