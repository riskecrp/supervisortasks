# Testing Guide - Railway + Vercel Deployment

## Overview

This application is **cloud-hosted** and designed to run on:
- **Backend**: Railway (hosting Express API with Google Sheets integration)
- **Frontend**: Vercel (hosting Next.js application)
- **Data**: Google Sheets (two-way synchronous - read AND write operations)

This guide explains how to test the deployed application and use the mock data fallback when the backend is temporarily unavailable.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Cloud-Hosted Architecture                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Vercel (Frontend)  ←→  Railway (Backend)  ←→  Google   │
│  Next.js App            Express API            Sheets    │
│                         Two-Way Sync           (Data)    │
│                                                           │
│  • Display UI          • Create tasks          • Store   │
│  • User input          • Update tasks          • Persist │
│  • Fallback to         • Delete tasks          • Query   │
│    mock data           • Read tasks                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Primary Use: Testing Deployed Application

The application is meant to be **deployed and tested in the cloud**:

```bash
# Access deployed frontend (example)
https://your-app.vercel.app

# Backend automatically connects to Railway
https://supervisortasks-production.up.railway.app
```

**Two-Way Synchronization**:
- ✅ **Create** tasks/discussions/supervisors → Writes to Google Sheets
- ✅ **Read** data → Fetches from Google Sheets
- ✅ **Update** tasks/discussions → Modifies Google Sheets
- ✅ **Delete** tasks/discussions → Removes from Google Sheets

## How the Fallback Mechanism Works

### Automatic Fallback to Mock Data

The application has a **fallback mechanism for development/testing purposes** when the Railway backend is temporarily unavailable:

1. **Frontend tries to connect** to the Railway backend API
2. **If Railway backend is unavailable**, it automatically falls back to mock data
3. **User sees a warning** banner: "⚠️ Using mock data - backend not available"
4. **Read-only mode** - Mock data allows UI testing but NO writes to Google Sheets

**Important**: Mock data is **read-only** and does NOT write to Google Sheets. For full two-way synchronization testing, the Railway backend must be running.

### What Mock Data Includes

Located in `frontend/src/lib/mockData.ts`:

- **5 sample tasks** - Various statuses (In Progress, Not Started, Completed, Blocked)
- **3 sample discussions** - With supervisor response tracking
- **4 sample supervisors** - Including one on Leave of Absence (LOA)

This covers all UI scenarios:
- ✅ Overdue task highlighting
- ✅ Different status badges
- ✅ LOA status indicators
- ✅ Supervisor response counts
- ✅ Date formatting and display

## Testing Scenarios

### 1. Test Production Deployment (Primary Method)

**Use Case**: Test the complete cloud-hosted application with Google Sheets integration

**Access deployed application**:
```
Frontend: https://your-app.vercel.app
Backend: https://supervisortasks-production.up.railway.app
```

**What works**:
- ✅ View data from Google Sheets
- ✅ Create new tasks/discussions/supervisors (writes to Google Sheets)
- ✅ Update existing data (two-way sync)
- ✅ Delete data (removes from Google Sheets)
- ✅ Full two-way synchronization

**Perfect for**:
- End-to-end testing
- User acceptance testing
- Real data validation
- Google Sheets integration verification

### 2. Test with Mock Data (Fallback Only)

**Use Case**: UI testing when Railway backend is temporarily unavailable

**When to use**:
- Railway backend is down for maintenance
- Developing UI changes without affecting production data
- Quick visual testing of layout/styling

**Limitation**: **Read-only** - No writes to Google Sheets

```bash
# If backend is unavailable, frontend automatically uses mock data
# Access your Vercel deployment normally
```

### 3. Local Development (Optional/Advanced)

**Use Case**: Developers making code changes to frontend or backend

**Note**: This is an **advanced setup**. The application is designed to run on Railway/Vercel, not locally.

```bash
# Terminal 1: Start backend locally (requires Google credentials)
cd backend
npm install
cp .env.example .env
# Edit .env with your Google credentials
npm run dev

# Terminal 2: Start frontend pointing to local backend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

**Requirements**:
- Google Cloud service account credentials
- Google Sheets API enabled
- Shared Google Sheet with service account

**When to use**:
- Making changes to backend API
- Testing new features before deploying to Railway
- Debugging Google Sheets integration

## Environment Configuration for Testing

### Deployed Application (Primary)

**Vercel Frontend** - Environment Variables in Vercel Dashboard:
```env
NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app
```

**Railway Backend** - Environment Variables in Railway Dashboard:
```env
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Local Development (Optional)

Create `frontend/.env.local` for local testing:

```env
# Point to Railway backend (recommended)
NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app

# Or point to local backend (advanced)
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Force mock data for UI testing (not recommended)
# NEXT_PUBLIC_API_URL=http://invalid-url
```

### Default Behavior

If no `NEXT_PUBLIC_API_URL` is set:
- **Defaults to**: `https://supervisortasks-production.up.railway.app` (Railway backend)
- **Fallback**: Uses mock data (read-only) if Railway connection fails

## Testing Different Features

### Tasks Page (`/`)

**Cloud Deployment Testing**:
- ✅ View tasks from Google Sheets
- ✅ **Create new tasks** → Writes to Google Sheets
- ✅ **Update task status** → Updates Google Sheets
- ✅ **Delete tasks** → Removes from Google Sheets
- ✅ Overdue highlighting
- ✅ Status badges (Not Started, In Progress, Completed, Blocked)

**Mock data** (fallback only):
- ✅ View sample tasks (read-only)
- ❌ Cannot create/update/delete (no write capability)

### Discussions Page (`/discussions`)

**Cloud Deployment Testing**:
- ✅ View discussions from Google Sheets
- ✅ **Create new discussions** → Writes to Google Sheets
- ✅ **Update supervisor feedback** → Updates Google Sheets
- ✅ **Delete discussions** → Removes from Google Sheets
- ✅ Supervisor response tracking

**Mock data** (fallback only):
- ✅ View sample discussions (read-only)
- ❌ Cannot create/update/delete

### Supervisors Page (`/supervisors`)

**Cloud Deployment Testing**:
- ✅ View supervisors from Google Sheets
- ✅ **Add new supervisors** → Writes to Google Sheets
- ✅ **Remove supervisors** → Deletes from Google Sheets
- ✅ LOA (Leave of Absence) status tracking
- ✅ LOA date ranges

**Mock data** (fallback only):
- ✅ View sample supervisors (read-only)
- ❌ Cannot create/update/delete

## Manual Testing Checklist

### Production Deployment (Railway + Vercel)
- [ ] Access deployed frontend on Vercel
- [ ] Verify connection to Railway backend (no warning banner)
- [ ] **Create** a new task → Check it appears in Google Sheets
- [ ] **Update** a task status → Verify change in Google Sheets
- [ ] **Delete** a task → Confirm removal from Google Sheets
- [ ] Navigate to `/discussions` → View and modify discussions
- [ ] Navigate to `/supervisors` → View and manage supervisors
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Verify two-way synchronization works

### Fallback Mode (Mock Data)
- [ ] Access frontend when Railway is down
- [ ] See warning banner: "Using mock data - backend not available"
- [ ] View mock tasks (read-only)
- [ ] View mock discussions (read-only)
- [ ] View mock supervisors (read-only)
- [ ] Confirm no errors in console
- [ ] Understand: **No writes to Google Sheets** in this mode

## Verifying Backend Connectivity and Two-Way Sync

### Check if Railway Backend is Available

```bash
# Test Railway backend health
curl https://supervisortasks-production.up.railway.app/health

# Expected response (backend is up):
# {"status":"ok","timestamp":"2026-02-09T..."}

# Test tasks endpoint
curl https://supervisortasks-production.up.railway.app/api/tasks

# Expected response (backend is up):
# [{"id":"task-2","taskList":"...","taskOwner":"..."}]
```

### Verify Two-Way Synchronization

1. **Test Write to Google Sheets**:
   ```bash
   # Create a new task via API
   curl -X POST https://supervisortasks-production.up.railway.app/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"taskList":"Test Task","taskOwner":"Test User","status":"Not Started"}'
   ```

2. **Check Google Sheets**:
   - Open your Google Sheet
   - Verify the new task appears in the "Tasks" tab
   - Confirms: ✅ Frontend → Backend → Google Sheets (Write)

3. **Update in Google Sheets**:
   - Manually edit the task in Google Sheets
   - Refresh your frontend application
   - Verify the changes appear
   - Confirms: ✅ Google Sheets → Backend → Frontend (Read)

4. **Delete via Frontend**:
   - Delete a task using the frontend UI
   - Check Google Sheets
   - Verify the task is removed
   - Confirms: ✅ Two-way synchronization working

### Check Frontend Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for requests to `/api/tasks`, `/api/discussions`, `/api/supervisors`
5. Check if they:
   - ✅ Succeed (status 200) → Backend working
   - ❌ Fail (status 0, ERR_CONNECTION_REFUSED) → Using mock data

## Development Workflow

### Recommended: Deploy and Test on Railway/Vercel

```bash
# 1. Deploy backend to Railway
# - Configure Google Sheets credentials
# - Set environment variables
# - Deploy from GitHub

# 2. Deploy frontend to Vercel
# - Set NEXT_PUBLIC_API_URL to Railway backend
# - Deploy from GitHub
# - Test deployed application
```

**Benefits**:
- ⚡ Test in production environment
- 🔄 Full two-way Google Sheets synchronization
- 🎨 Real data validation
- 📦 No local setup required

### Optional: Local Development (Advanced)

Use local development only when:
- Making changes to backend API code
- Debugging Google Sheets integration
- Testing new features before deployment

**Requirements**:
- Google Cloud service account credentials
- Google Sheets API enabled
- Node.js 18+ installed locally

```bash
# Local backend + local frontend
npm install
npm run dev
```

**Not recommended for**: Regular testing or usage

## Common Issues and Solutions

### Issue: "Using mock data" warning always shows

**Cause**: Railway backend is not available or URL is incorrect

**Solutions**:
1. **Check Railway backend status**:
   - Go to Railway dashboard
   - Verify backend service is running
   - Check deployment logs for errors

2. **Verify environment variable**:
   - In Vercel: Check `NEXT_PUBLIC_API_URL` is set correctly
   - Should be: `https://supervisortasks-production.up.railway.app`

3. **Test backend URL**:
   ```bash
   curl https://supervisortasks-production.up.railway.app/health
   ```

4. **Check Railway backend has Google credentials configured**

### Issue: Can't create/update/delete data

**Cause**: Using mock data fallback (read-only mode)

**Solution**:
- Ensure Railway backend is running
- Mock data is **read-only** and cannot write to Google Sheets
- Deploy and use Railway backend for full CRUD operations

### Issue: Changes not appearing in Google Sheets

**Cause**: Two-way sync issue or permissions

**Solutions**:
1. **Verify Google Sheets is shared** with service account
2. **Check service account has "Editor" permissions**
3. **Verify GOOGLE_SHEET_ID** in Railway environment variables
4. **Check Railway logs** for API errors
5. **Test API directly**:
   ```bash
   curl -X POST https://supervisortasks-production.up.railway.app/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"taskList":"Test","status":"Not Started"}'
   ```

### Issue: Frontend not connecting to Railway backend

**Cause**: CORS configuration or environment variable

**Solutions**:
1. **Add frontend URL to Railway backend**:
   - In Railway, set `FRONTEND_URL` variable
   - Value: `https://your-frontend.vercel.app`

2. **Check browser console** for CORS errors

3. **Verify NEXT_PUBLIC_API_URL** in Vercel matches Railway URL

## CI/CD Testing Notes

### Testing in CI Without Backend

The application can be **built** in CI/CD pipelines without backend access:

```bash
# Build test (no backend needed for build)
npm run build

# Lint test
npm run lint

# Type check
cd frontend && npx tsc --noEmit
```

The build succeeds because:
- Mock data is bundled with the application as fallback
- API calls only happen at runtime (in browser)
- Build process doesn't require backend connection

### Deployment Testing

After deployment to Vercel/Railway:
1. **Smoke test deployed frontend**: Visit Vercel URL
2. **Verify backend connection**: Check for warning banner (should NOT appear)
3. **Test CRUD operations**: Create, read, update, delete a task
4. **Verify Google Sheets sync**: Check changes appear in Google Sheets
5. **Test from Google Sheets**: Edit data in Sheets, verify it appears in frontend

## Next Steps

### Adding Automated Tests (Optional)

Consider adding these test types:

1. **Unit Tests** (Jest/Vitest)
   - Component rendering
   - Mock data utilities
   - Date formatting functions

2. **Integration Tests**
   - API client with mocked fetch
   - Page-level data fetching

3. **E2E Tests** (Playwright/Cypress)
   - Full user flows with mock data
   - Navigation testing
   - Visual regression tests

See `package.json` for adding test dependencies.

## Summary

✅ **Primary Architecture**: Cloud-hosted on Railway (backend) + Vercel (frontend)

✅ **Two-Way Synchronization**: Full CRUD operations write to and read from Google Sheets

✅ **Mock Data Fallback**: Read-only fallback when Railway backend is unavailable

✅ **Testing Approach**: Deploy to Railway/Vercel for full testing, not local development

---

## Quick Reference

| Component | Hosting | Purpose |
|-----------|---------|---------|
| **Backend** | Railway | Express API with Google Sheets two-way sync |
| **Frontend** | Vercel | Next.js UI that connects to Railway backend |
| **Data** | Google Sheets | Persistent storage with full CRUD support |
| **Mock Data** | Frontend | Read-only fallback for UI testing only |

| Operation | Railway Backend | Mock Data Fallback |
|-----------|----------------|-------------------|
| **View Data** | ✅ From Google Sheets | ✅ Sample data |
| **Create** | ✅ Writes to Google Sheets | ❌ Read-only |
| **Update** | ✅ Updates Google Sheets | ❌ Read-only |
| **Delete** | ✅ Removes from Google Sheets | ❌ Read-only |

---

## Need Help?

**For deployment issues**:
- [RAILWAY_SETUP.md](RAILWAY_SETUP.md) - Railway backend deployment
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Vercel frontend deployment
- [RAILWAY_ENV_VARIABLES.md](RAILWAY_ENV_VARIABLES.md) - Environment configuration

**For architecture understanding**:
- [DATA_FLOW_VERIFICATION.md](DATA_FLOW_VERIFICATION.md) - How data flows through the system
- [BACKEND_VERIFICATION.md](BACKEND_VERIFICATION.md) - Backend Google Sheets integration
