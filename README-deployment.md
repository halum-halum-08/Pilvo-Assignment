# Deploying Status Page Application

This guide will help you deploy the Status Page application to free hosting services for easy review.

## Frontend Deployment to Vercel

Vercel offers a generous free tier that works perfectly for React applications.

### First-time Setup

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```

### Deployment

From the project root, run:
```bash
cd status-frontend
npm run deploy:vercel
```

Alternatively, you can deploy through the Vercel dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the `status-frontend` directory
4. Add the following environment variables:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., https://status-backend.onrender.com/api)
   - `REACT_APP_SOCKET_URL`: Your backend WebSocket URL (e.g., https://status-backend.onrender.com)
5. Click "Deploy"

## Backend Deployment to Render

Render offers a free tier for web services that includes automatic deployments from GitHub.

### First-time Setup

1. Create a Render account at [render.com](https://render.com)
2. Go to [dashboard.render.com/select-repo?type=web](https://dashboard.render.com/select-repo?type=web)
3. Connect your GitHub repository

### Deployment

1. Select your repository
2. Configure the service:
   - **Name**: status-backend
   - **Root Directory**: status-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
3. Add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 8080
   - `JWT_SECRET`: (generate a secure random string)
   - `JWT_EXPIRY`: 7d
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., https://status-page-frontend.vercel.app)
4. Add a PostgreSQL database under the "Add a Database" section
5. Click "Create Web Service"

## Using the Deployment Script

For convenience, you can use the provided deployment script:

```bash
bash deploy-free.sh
```

This script will guide you through deploying both frontend and backend.

## Testing the Deployment

Once deployed, you can access your application at:
- Frontend: https://status-page-frontend.vercel.app (your actual URL may differ)
- Backend API: https://status-backend.onrender.com/api

## Important Notes

1. **Free Tier Limitations**: 
   - Render's free tier web services will spin down after periods of inactivity, which can cause a delay on the first request.
   - Vercel's free tier has limited build minutes and deployments per month.

2. **Database**: 
   - Render offers a free PostgreSQL database with a 90-day lifespan.
   - You'll need to backup and restore your data before the 90-day period ends.

3. **Environment Variables**:
   - Always make sure your frontend points to the correct backend URL.
   - Keep your JWT_SECRET secure and unique for each environment.
