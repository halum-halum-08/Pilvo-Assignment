@echo off
echo Running Prisma setup...

:: Stop any running node processes that might be locking files
echo Stopping any running node processes...
taskkill /f /im node.exe >nul 2>&1

:: Make sure the prisma directory exists
if not exist "prisma\migrations" mkdir "prisma\migrations"

:: Generate the Prisma client
echo Generating Prisma client...
call npx prisma generate

:: Create and apply migrations
echo Creating and applying migrations...
call npx prisma migrate dev --name init --skip-generate

echo Database setup complete!
pause