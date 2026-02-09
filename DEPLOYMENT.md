# Deployment Guide

This guide provides step-by-step instructions for deploying the Supervisor Tasks application to production.

## Prerequisites

Before deploying, ensure you have:

- A Google Cloud Project with Sheets API enabled
- A Google Service Account with JSON key
- Your Google Sheet shared with the service account email
- GitHub account with this repository
- Vercel account (for frontend)
- Railway account (for backend)

## Google Sheets Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create Service Account

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Click "Create and Continue"
5. Skip optional steps and click "Done"

### 3. Generate Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Click "Create" - a JSON file will be downloaded

### 4. Prepare Environment Variables

From the downloaded JSON file, extract:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com"
}
```

### 5. Share Google Sheet

1. Open your Google Sheet
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
3. Click "Share" button
4. Share with the service account email (from step 4)
5. Grant "Editor" permission

## Backend Deployment (Railway)

### 1. Create Railway Project

1. Go to [Railway](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose the `riskecrp/supervisortasks` repository

### 2. Configure Service

1. After project creation, click on the service
2. Go to "Settings" tab
3. Set the following:
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Add Environment Variables

Go to the "Variables" tab and add:

```bash
NODE_ENV=production
PORT=3001
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- For `GOOGLE_PRIVATE_KEY`, keep the quotes and newline characters (`\n`)
- Copy the entire private key including the BEGIN and END lines
- `FRONTEND_URL` will be updated after frontend deployment

### 4. Deploy

1. Railway will automatically deploy after configuration
2. Once deployed, copy the public URL (e.g., `https://your-backend.railway.app`)
3. Test the health endpoint: `https://your-backend.railway.app/health`

## Frontend Deployment (Vercel)

### 1. Import Project

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Add New..." > "Project"
4. Import the `riskecrp/supervisortasks` repository

### 2. Configure Build Settings

Configure the following settings in the Vercel dashboard:

- **Framework Preset**: Next.js
- **Root Directory**: `packages/frontend` (click Edit to set this)
- **Build Command**: Leave as default or use: `npm run build`
- **Output Directory**: `.next`

**Important**: The Root Directory must be set to `packages/frontend` in the Vercel Project Settings UI. This cannot be configured via `vercel.json`. The `vercel.json` file in the repo root provides additional build configuration that will be used once the Root Directory is set correctly.

### 3. Add Environment Variables

In the project settings, add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Replace with your actual Railway backend URL from the previous step.

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Copy the production URL (e.g., `https://your-app.vercel.app`)

### 5. Update Backend CORS

1. Go back to Railway
2. Update the `FRONTEND_URL` environment variable:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy the backend service

## Verification

### 1. Backend Health Check

Visit: `https://your-backend.railway.app/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-09T12:00:00.000Z"
}
```

### 2. Frontend Access

1. Visit: `https://your-app.vercel.app`
2. You should see the Tasks dashboard
3. Verify that data loads from Google Sheets
4. Check all three pages:
   - Tasks (/)
   - Discussions (/discussions)
   - Supervisors (/supervisors)

### 3. API Endpoints

Test the API endpoints:

```bash
# Get all tasks
curl https://your-backend.railway.app/api/tasks

# Get all discussions
curl https://your-backend.railway.app/api/discussions

# Get all supervisors
curl https://your-backend.railway.app/api/supervisors
```

## Local Development with Production Backend

If you want to develop locally but use the production backend:

1. Create `packages/frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

2. Run the frontend:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Backend Issues

**Issue**: "Failed to initialize services"
- **Solution**: Check that `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` are correctly set
- Verify the service account has access to the Google Sheet

**Issue**: CORS errors
- **Solution**: Ensure `FRONTEND_URL` in Railway matches your Vercel domain exactly
- Check that the backend is allowing requests from your frontend URL

**Issue**: API returns empty arrays
- **Solution**: Verify the Google Sheet structure matches the expected format
- Check that the sheet has the correct tab names: "Tasks", "Names", "Discussions Pending Feedback", "Task Rotation"

### Frontend Issues

**Issue**: "Failed to connect to the backend"
- **Solution**: Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify the backend is running and accessible
- Check browser console for CORS errors

**Issue**: Build fails on Vercel
- **Solution**: Verify the `vercel.json` configuration
- Check that all dependencies are listed in `package.json`
- Review build logs for specific errors

### Google Sheets Issues

**Issue**: "Permission denied"
- **Solution**: Share the Google Sheet with the service account email
- Grant "Editor" permission

**Issue**: "Invalid credentials"
- **Solution**: Verify the private key includes all newline characters (`\n`)
- Ensure the private key is enclosed in double quotes
- Check that you copied the entire key including BEGIN and END lines

## Custom Domain Setup

### Vercel Custom Domain

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update the Railway `FRONTEND_URL` environment variable to use the custom domain

### Railway Custom Domain

1. Go to your Railway project settings
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update the Vercel `NEXT_PUBLIC_API_URL` environment variable to use the custom domain

## Monitoring and Logs

### Railway Logs

- View logs in the Railway dashboard under the "Deployments" tab
- Use the "Logs" view for real-time log streaming

### Vercel Logs

- View deployment logs in the Vercel dashboard
- Access runtime logs in the "Functions" tab
- Set up log drains for persistent logging

## Updating the Application

### Backend Updates

1. Push changes to the repository
2. Railway will automatically detect and deploy
3. Monitor the deployment logs

### Frontend Updates

1. Push changes to the repository
2. Vercel will automatically detect and deploy
3. Monitor the deployment logs

## Security Best Practices

1. **Never commit sensitive data**:
   - Keep `.env` files in `.gitignore`
   - Use environment variables for all secrets

2. **Rotate credentials regularly**:
   - Generate new service account keys periodically
   - Update environment variables in Railway

3. **Limit API access**:
   - Configure proper CORS settings
   - Use rate limiting (already configured)

4. **Monitor usage**:
   - Check Railway metrics regularly
   - Review Vercel analytics

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review Railway and Vercel documentation
3. Check application logs for errors
4. Open an issue on GitHub with details
