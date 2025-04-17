@echo off
REM Run database migrations and setup for Windows

echo Running Prisma migrations...
npx prisma migrate dev --name init

echo Generating Prisma client...
npx prisma generate

echo Seeding database with initial data...
npx ts-node prisma/seed.ts

echo Database setup complete!
pause