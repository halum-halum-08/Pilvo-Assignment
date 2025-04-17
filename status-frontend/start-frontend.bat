@echo off
echo Starting status-frontend...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting frontend development server on port 3000...
echo.
echo Once started, you can access the application at:
echo http://localhost:3000
echo.

REM Set environment variable to disable TypeScript version warnings
set SKIP_TYPESCRIPT_CHECK=true

call npm start