# Status Page Application

A real-time service status monitoring application with incident management.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 8.x or later
- PostgreSQL 14.x or later

### Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp status-frontend/.env.example status-frontend/.env
cp status-backend/.env.example status-backend/.env
```

4. Generate Prisma client:
```bash
cd status-backend
npx prisma generate
```

5. Start development servers:
```bash
# From the root directory
npm run dev
```

## Build & Deployment

### Building for Production

To build both frontend and backend for production:

```bash
# From the root directory
npm run build
```

Or use the deployment script which handles environment-specific builds:

```bash
./deploy.sh
```

### Frontend Deployment Options

#### Deploy to Vercel

```bash
cd status-frontend
npm run build:production
npx vercel --prod
```

#### Deploy to Netlify

```bash
cd status-frontend
npm run build:production
npx netlify deploy --prod
```

### Backend Deployment Options

#### Deploy with Docker

```bash
cd status-backend
docker-compose up -d
```

#### Deploy to Cloud Provider (Digital Ocean, AWS, etc.)

1. Build the backend:
```bash
cd status-backend
npm run deploy:prepare
```

2. Set up a server with the included script:
```bash
scp status-backend/deploy-scripts/setup-server.sh user@your-server:/tmp/
ssh user@your-server "chmod +x /tmp/setup-server.sh && sudo /tmp/setup-server.sh"
```

3. Deploy the application:
```bash
scp -r status-backend/dist user@your-server:/opt/status-app/
scp status-backend/.env.production user@your-server:/opt/status-app/.env
ssh user@your-server "cd /opt/status-app && npm start:prod"
```

## Environment Variables

### Frontend Variables

- `REACT_APP_API_URL`: URL for backend API
- `REACT_APP_SOCKET_URL`: URL for WebSocket connection
- `REACT_APP_ENVIRONMENT`: Environment name (development, production)

### Backend Variables

- `NODE_ENV`: Environment mode
- `PORT`: Server port
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `JWT_EXPIRY`: JWT token expiry time
- `ALLOWED_ORIGINS`: CORS allowed origins

## CI/CD

This project includes GitHub Actions workflows for continuous integration and deployment:

- Frontend: Tests and deploys to Vercel automatically on push to main branch
- Backend: Tests, builds a Docker image, and deploys to DigitalOcean

To set up CI/CD, add the following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `DOCKERHUB_USERNAME`: DockerHub username
- `DOCKERHUB_TOKEN`: DockerHub token
- `DEPLOY_HOST`: Server hostname
- `DEPLOY_USER`: Server username
- `DEPLOY_KEY`: SSH private key for server access

## License

This project is licensed under the MIT License.
