@echo off
echo Starting status-backend server...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if database exists
if not exist "prisma\dev.db" (
    echo Database not found. Setting up database...
    call node scripts\init-db.js
)

REM Generate Prisma client if needed
if not exist "node_modules\.prisma" (
    echo Generating Prisma client...
    call npx prisma generate
)

echo Starting server on port 8080...
echo.
echo If you see "API Server Unavailable" in the frontend:
echo 1. Make sure port 8080 is not in use
echo 2. Check for any errors in this console
echo.

call npm run dev