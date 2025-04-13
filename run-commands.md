# Status Page Application - Command Guide

This document lists all available npm commands for developing, testing, and deploying the Status Page application.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run dev:frontend` | Start only the frontend in development mode |
| `npm run dev:backend` | Start only the backend in development mode |

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build both frontend and backend for production |
| `npm run build:frontend` | Build only the frontend for production |
| `npm run build:backend` | Build only the backend for production |

## Start Commands (Production)

| Command | Description |
|---------|-------------|
| `npm start` | Start both frontend and backend in production mode |
| `npm run start:frontend` | Start only the frontend in production mode |
| `npm run start:backend` | Start only the backend in production mode |

## Testing Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests for both frontend and backend |

## Utility Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Initialize the project, install dependencies, and set up environment |
| `npm run prisma:generate` | Generate Prisma client for database operations |
| `npm run deploy` | Deploy the application using the deploy.sh script |

## Examples

1. To start development environment:
   ```bash
   npm run dev
   ```

2. To build for production:
   ```bash
   npm run build
   ```

3. To deploy:
   ```bash
   npm run deploy
   ```

> Note: Make sure you have installed all dependencies with `npm install` before running these commands.
