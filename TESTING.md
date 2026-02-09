# Testing Guide - How to Test Without Backend

## Overview

This guide explains how to test the Supervisor Tasks application when the backend is not available. The application is designed with robust fallback mechanisms that allow full UI/UX testing using mock data.

## Quick Start - Testing Without Backend

The application **works out of the box** without a backend connection:

```bash
# Clone and install
git clone <repository-url>
cd supervisortasks
npm install

# Start frontend (no backend required!)
npm run dev
```

Open http://localhost:3000 - The app will automatically use mock data and display a warning banner.

## How the Fallback Mechanism Works

### Automatic Fallback to Mock Data

The application uses a smart fallback system:

1. **Frontend tries to connect** to the backend API (default: Railway URL)
2. **If backend is unavailable**, it automatically falls back to mock data
3. **User sees a warning** banner: "⚠️ Using mock data - backend not available"
4. **All features work** with realistic mock data

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

### 1. Test with Mock Data (Backend Unavailable)

**Use Case**: Develop and test UI changes without backend dependency

```bash
# Just run the frontend
cd frontend
npm run dev
```

**What happens**:
- ✅ Application loads immediately
- ✅ Shows warning: "Using mock data - backend not available"
- ✅ All pages display with mock data
- ✅ All UI interactions work

**Perfect for**:
- UI/UX development
- Component styling
- Layout adjustments
- Visual regression testing
- Dark mode testing

### 2. Force Mock Data (Even if Backend Available)

**Use Case**: Test fallback mechanism explicitly

**Option A**: Block backend in browser DevTools
```
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Right-click → Block request URL
4. Add: *supervisortasks-production.up.railway.app*
5. Reload page
```

**Option B**: Use invalid backend URL
```bash
# In frontend/.env.local
NEXT_PUBLIC_API_URL=http://invalid-backend-url:9999
```

### 3. Test with Local Backend (Full Integration)

**Use Case**: Test complete data flow with Google Sheets

```bash
# Terminal 1: Start backend
cd backend
npm install
cp .env.example .env
# Edit .env with your Google credentials
npm run dev

# Terminal 2: Start frontend with local backend
cd frontend
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

### 4. Test with Railway Backend (Production-like)

**Use Case**: Test against deployed backend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app
npm run dev
```

## Environment Configuration for Testing

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
# Use mock data (invalid URL forces fallback)
NEXT_PUBLIC_API_URL=http://mock-data

# Use local backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Use Railway backend
NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app
```

### Default Behavior

If no `NEXT_PUBLIC_API_URL` is set:
- **Defaults to**: `https://supervisortasks-production.up.railway.app`
- **Fallback**: Uses mock data if connection fails

## Testing Different Features

### Tasks Page (`/`)

**Mock data includes**:
- ✅ Overdue tasks (highlighted in amber)
- ✅ All status types (Not Started, In Progress, Completed, Blocked)
- ✅ Tasks with and without dates
- ✅ Various task owners

**Test scenarios**:
1. Verify overdue highlighting works
2. Check status badge colors
3. Validate date formatting
4. Test responsive layout

### Discussions Page (`/discussions`)

**Mock data includes**:
- ✅ Multiple discussion topics
- ✅ Supervisor response tracking (responded/not responded)
- ✅ Response count badges

**Test scenarios**:
1. Verify response counts display correctly
2. Check supervisor names render properly
3. Test link formatting

### Supervisors Page (`/supervisors`)

**Mock data includes**:
- ✅ Supervisors with different ranks
- ✅ One supervisor on LOA (Leave of Absence)
- ✅ LOA date ranges

**Test scenarios**:
1. Verify LOA status badge (Active/On Leave)
2. Check LOA date display
3. Validate rank information

## Manual Testing Checklist

### Visual Testing
- [ ] All pages load without errors
- [ ] Warning banner appears when using mock data
- [ ] Loading states display briefly on page load
- [ ] Status badges use correct colors
- [ ] Overdue tasks highlighted in amber
- [ ] LOA status shows correctly
- [ ] Dark mode works on all pages
- [ ] Responsive layout works (mobile, tablet, desktop)

### Navigation Testing
- [ ] Sidebar navigation works
- [ ] Active page highlighting in sidebar
- [ ] All routes accessible (`/`, `/discussions`, `/supervisors`)
- [ ] Page titles correct

### Error Handling Testing
- [ ] Warning banner shows when backend unavailable
- [ ] Mock data displays correctly as fallback
- [ ] Console shows appropriate error messages (not crashes)

## Verifying Backend Connectivity

### Check if Backend is Available

```bash
# Test Railway backend
curl https://supervisortasks-production.up.railway.app/health

# Expected response (backend is up):
# {"status":"ok","timestamp":"2026-02-09T..."}

# Test tasks endpoint
curl https://supervisortasks-production.up.railway.app/api/tasks

# Expected response (backend is up):
# [{"id":"task-2","taskList":"...","taskOwner":"..."}]
```

### Check Frontend Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for requests to `/api/tasks`, `/api/discussions`, `/api/supervisors`
5. Check if they:
   - ✅ Succeed (status 200) → Backend working
   - ❌ Fail (status 0, ERR_CONNECTION_REFUSED) → Using mock data

## Development Workflow

### Recommended: Start with Mock Data

```bash
# Day-to-day development - no backend needed
npm run dev
```

**Benefits**:
- ⚡ Fast startup (no backend dependency)
- 🎨 Focus on UI/UX
- 🔄 Instant feedback on changes
- 📦 Consistent test data

### When to Use Real Backend

Use real backend connection when:
- Testing Google Sheets integration
- Verifying data synchronization
- Testing CRUD operations (when implemented)
- End-to-end testing before deployment

## Common Issues and Solutions

### Issue: "Using mock data" warning always shows

**Cause**: Backend is not available or URL is incorrect

**Solutions**:
1. ✅ **This is normal!** Mock data is designed for testing
2. To use real backend:
   - Ensure Railway backend is deployed and running
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Test backend URL with `curl` command (see above)

### Issue: Changes to mock data not appearing

**Cause**: Browser cache or Next.js cache

**Solution**:
```bash
# Hard reload in browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Or clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Issue: Want to test with different data

**Solution**: Edit `frontend/src/lib/mockData.ts` to customize test scenarios

```typescript
// Add more tasks with specific test cases
export const mockTasks: Task[] = [
  {
    id: '1',
    taskList: 'Test overdue task',
    taskOwner: 'Test User',
    status: 'In Progress',
    dueDate: '2020-01-01', // Use any past date to test overdue highlighting
    // ...
  },
  // Add more test cases
];
```

## CI/CD Testing Notes

### Testing in CI Without Backend

The application can be built and tested in CI/CD pipelines without backend access:

```bash
# Build test (no backend needed)
npm run build

# Lint test
npm run lint

# Type check
cd frontend && npx tsc --noEmit
```

The build will succeed because:
- Mock data is bundled with the application
- API calls only happen at runtime (in browser)
- Build process doesn't require backend connection

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

✅ **Backend not required for testing** - Mock data provides complete functionality

✅ **Automatic fallback** - Application handles backend unavailability gracefully

✅ **Full feature coverage** - All UI scenarios testable with mock data

✅ **Flexible configuration** - Easy to switch between mock/local/production backends

**For UI/UX development**: Just run `npm run dev` - no backend setup needed!

**For integration testing**: Connect to local or Railway backend when available

---

## Quick Reference

| Scenario | Command | Backend URL |
|----------|---------|-------------|
| **Mock Data** | `npm run dev` | (any invalid or no URL) |
| **Local Backend** | `npm run dev` | `http://localhost:3001` |
| **Railway Backend** | `npm run dev` | `https://supervisortasks-production.up.railway.app` |

**Need help?** Check these docs:
- [QUICKSTART.md](QUICKSTART.md) - Full setup guide
- [RAILWAY_SETUP.md](RAILWAY_SETUP.md) - Railway backend setup
- [DATA_FLOW_VERIFICATION.md](DATA_FLOW_VERIFICATION.md) - How data flows through the system
