# Quick Start Guide

This guide will help you get the Supervisor Tasks Management Dashboard up and running quickly.

## Prerequisites

- Node.js 18+ and npm 9+
- Google Cloud Project with Sheets API enabled
- A Google Sheet to manage (or use the template provided)

## Step 1: Google Sheets API Setup (5 minutes)

### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it (e.g., "supervisortasks-service")
   - Click "Create and Continue"
   - Skip optional steps, click "Done"

5. Create JSON Key:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON"
   - Download the file

### Share Your Google Sheet

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (found in the JSON file: `client_email`)
4. Give "Editor" permissions
5. Click "Done"

### Get Your Sheet ID

From the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
Copy the `SHEET_ID` part.

## Step 2: Configure Environment Variables (2 minutes)

### Option A: Using Credentials File (Recommended)

1. Copy the downloaded JSON file to `backend/credentials.json`
2. Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
FRONTEND_URL=http://localhost:5173
```

### Option B: Using Environment Variables

1. Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=http://localhost:5173
```

2. Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

## Step 3: Install and Run (3 minutes)

### Development Mode

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Production Mode with Docker

```bash
# Create root .env file with your Google credentials
cp .env.example .env
# Edit .env and fill in your values

# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

Access at: **http://localhost:3000**

## Step 4: Verify Setup

1. Open http://localhost:5173 (dev) or http://localhost:3000 (docker)
2. You should see the dashboard homepage
3. Click "Tasks" - it should load tasks from your Google Sheet
4. Try creating a new task to verify write permissions work

## Troubleshooting

### "The caller does not have permission"
- Ensure you shared the Google Sheet with the service account email
- Check that the service account has "Editor" permissions
- Verify the Sheet ID is correct

### "Failed to read from Google Sheets"
- Check that the Google Sheets API is enabled in your project
- Verify the sheet tab names match exactly (case-sensitive):
  - "Tasks"
  - "Discussions Pending Feedback"
  - "LOA Tracking" (will be created automatically if missing)
  - "Task History" (will be created automatically if missing)

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Port Already in Use
```bash
# Change ports in .env files:
# Backend: PORT=3002
# Frontend: Change in vite.config.ts
```

## What's Next?

- **Add Supervisors**: Go to Supervisors page and add your team
- **Create Tasks**: Use the Tasks page to start tracking work
- **Track Discussions**: Add discussion topics for feedback
- **View Analytics**: Check the Analytics dashboard for insights
- **Manage LOA**: Track supervisor leave of absence

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or questions

## Common First-Time Setup Commands

```bash
# Check if Node.js is installed
node --version  # Should be 18 or higher

# Check if npm is installed
npm --version   # Should be 9 or higher

# Install dependencies (run from project root)
npm install

# Start development servers
npm run dev

# Build for production
npm run build

# Run with Docker
docker-compose up
```

## Deployment Options

Once you've verified everything works locally:

- **Vercel** (Frontend) - Free tier available
- **Render** (Backend) - Free tier available
- **Railway** - Full-stack deployment
- **Self-hosted** - Use Docker Compose on your own server

See the [README.md](README.md#deployment-options) for detailed deployment instructions.
