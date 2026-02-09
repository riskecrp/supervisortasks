# Railway Backend Deployment Guide

This guide explains how to connect the frontend to your Railway-hosted backend.

## Prerequisites

- Backend is already deployed on Railway
- You have your Railway backend URL (e.g., `https://your-backend.railway.app`)
- Backend is configured with Google Sheets credentials

## Step 1: Get Your Railway Backend URL

1. Log in to [Railway](https://railway.app)
2. Open your backend project
3. Go to the "Deployments" or "Settings" tab
4. Copy your backend URL (looks like: `https://your-backend-name.railway.app`)

## Step 2: Configure Frontend to Use Railway Backend

### For Local Development

1. Create a `.env.local` file in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. Edit `frontend/.env.local` and set your Railway backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 - it should now connect to your Railway backend!

### For Vercel Deployment (Recommended for Frontend)

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-name.railway.app` (your Railway backend URL)

5. Deploy!

## Step 3: Configure Backend CORS (Important!)

Your Railway backend needs to allow requests from your frontend domain.

### Update Backend Environment Variables on Railway

1. Go to your Railway project
2. Find the backend service
3. Go to "Variables" tab
4. Add or update:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```
   
   Or for multiple domains:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app,http://localhost:3000
   ```

5. Redeploy if necessary

## Step 4: Verify Connection

1. Open your frontend (local or deployed)
2. Check the browser console for any CORS errors
3. Navigate to the Tasks page - it should load data from Railway
4. If you see "Using mock data - backend not available", check:
   - Backend URL is correct
   - Backend is running on Railway
   - CORS is configured correctly
   - Network tab shows the API request

## Troubleshooting

### "Using mock data - backend not available"

**Possible causes:**
1. Backend URL is incorrect
   - Double-check your Railway URL
   - Make sure it doesn't have a trailing slash
   
2. Backend is not running
   - Check Railway dashboard for deployment status
   - View logs in Railway

3. CORS error
   - Check browser console for CORS errors
   - Update `FRONTEND_URL` in Railway backend variables
   - Redeploy backend after changing variables

### CORS Policy Error

If you see: `Access to fetch has been blocked by CORS policy`

**Solution:**
1. In Railway, add your frontend URL to `FRONTEND_URL` variable
2. Format: `https://your-frontend.vercel.app`
3. For multiple URLs, separate with commas: `https://app1.com,https://app2.com`
4. Redeploy the backend

### Network Error / Failed to Fetch

**Check:**
1. Backend URL is correct (https, not http for Railway)
2. Backend is deployed and healthy on Railway
3. Your Railway backend has `/api/tasks`, `/api/discussions`, `/api/supervisors` endpoints
4. Google Sheets credentials are configured in Railway

### 404 Not Found

The API endpoints should be:
- `https://your-backend.railway.app/api/tasks`
- `https://your-backend.railway.app/api/discussions`
- `https://your-backend.railway.app/api/supervisors`

If getting 404:
1. Verify backend is deployed correctly
2. Check Railway logs for errors
3. Ensure backend has the API routes implemented

## Testing Your Setup

### Test Backend Health

1. Open in browser: `https://your-backend.railway.app/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### Test API Endpoint

1. Open in browser: `https://your-backend.railway.app/api/tasks`
2. Should return JSON array of tasks from Google Sheets
3. If error, check Railway logs

## Environment Variables Summary

### Frontend (Local Development)
File: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
```

### Frontend (Vercel Deployment)
Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
```

### Backend (Railway)
Already configured on Railway:
```env
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3001
NODE_ENV=production
```

## Quick Start Commands

```bash
# Clone repository
git clone <your-repo-url>
cd supervisortasks

# Install frontend dependencies
cd frontend
npm install

# Create environment file with your Railway backend URL
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Start frontend
npm run dev

# Open browser
open http://localhost:3000
```

## Architecture Overview

```
┌─────────────────────┐
│   Vercel/Local      │
│   (Frontend)        │  NEXT_PUBLIC_API_URL
│   Next.js App       │────────────────────┐
└─────────────────────┘                    │
                                          │
                                          ▼
                                ┌─────────────────────┐
                                │   Railway           │
                                │   (Backend)         │
                                │   Express API       │
                                └─────────────────────┘
                                          │
                                          │ Google Sheets API
                                          ▼
                                ┌─────────────────────┐
                                │   Google Sheets     │
                                │   (Data Storage)    │
                                └─────────────────────┘
```

## Need Help?

1. Check Railway backend logs for errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure Google Sheets is shared with service account
5. Open an issue on GitHub if problems persist
