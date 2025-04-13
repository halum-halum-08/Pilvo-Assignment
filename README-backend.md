# Status Page Backend

This document provides instructions for running the backend server for the Status Page application.

## Prerequisites

- Node.js 14+ installed
- PostgreSQL database running

## Environment Setup

1. Create a `.env` file in the `status-backend` directory:

```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/statuspage
JWT_SECRET=your-dev-jwt-secret
JWT_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:3000
```

Adjust the `DATABASE_URL` to match your PostgreSQL configuration.

## Running the Server

From the project root:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start the backend server in development mode
npm run dev:backend
```

## Verifying the Server

Once started, you should see console output indicating the server is running on port 3001.

You can verify the server is running by making a request to the health check endpoint:

```
http://localhost:3001/health
```

This should return a JSON response with status "ok".

## Common Issues

1. **Port already in use**: If port 3001 is already in use, change the `PORT` in your `.env` file.

2. **Database connection error**: Ensure your PostgreSQL database is running and the connection string is correct.

3. **Module not found errors**: Run `npm install` to ensure all dependencies are installed.

4. **Prisma errors**: Run `npm run prisma:generate` to regenerate the Prisma client.
