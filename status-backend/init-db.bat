@echo off
echo Initializing database with Prisma db push...

:: Run the database initialization script
node scripts\init-db.js

:: After the database is created, seed it with initial data
echo Seeding database with initial data...
npx ts-node prisma\seed.ts

echo All database setup tasks completed!
pause