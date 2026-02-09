# Data Flow Verification

## Question: Does this read the backend data from Google Sheets?

**Short Answer: YES** ✅ - The code is correctly configured to read from Google Sheets, but the Railway backend needs to be running for the full data flow to work.

---

## 📊 How the Data Flow Works

```
Google Sheets → Railway Backend (Node.js/Express) → Vercel Frontend (Next.js)
```

### 1. Google Sheets (Data Source)
- **Sheet ID**: `1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4`
- Contains tabs for: Tasks, Discussions, Supervisors, LOA Status, etc.
- Backend reads from these sheets using Google Sheets API

### 2. Railway Backend (API Server)
- **URL**: `https://supervisortasks-production.up.railway.app`
- **Code Location**: `/backend/src/`
- **Key Service**: `SheetsService` (`backend/src/services/sheets.service.ts`)
  - Authenticates with Google using service account credentials
  - Reads data from Google Sheets via `readRange()` method
  - Provides data to API endpoints

**API Endpoints**:
- `GET /api/tasks` - Reads from "Tasks" sheet
- `GET /api/discussions` - Reads from "Discussions" sheet  
- `GET /api/supervisors` - Reads from "Supervisors" sheet

**Example from TasksService**:
```typescript
async getAllTasks(): Promise<Task[]> {
  const rows = await this.sheetsService.readRange(`${TASKS_SHEET}!A2:F`);
  // Processes and returns task data from Google Sheets
}
```

### 3. Vercel Frontend (UI)
- **Code Location**: `/frontend/src/`
- **API Client**: `frontend/src/lib/api.ts`
  - Default URL: `https://supervisortasks-production.up.railway.app`
  - Calls backend API endpoints
  - Falls back to mock data if backend is unavailable

**Example from Tasks Page**:
```typescript
useEffect(() => {
  async function fetchTasks() {
    try {
      const data = await api.tasks.getAll(); // Calls Railway backend
      setTasks(data as Task[]); // Uses real Google Sheets data
    } catch (err) {
      setError('Using mock data - backend not available');
      // Falls back to mock data only if API fails
    }
  }
  fetchTasks();
}, []);
```

---

## ✅ What This PR Changes

### Before PR:
- Frontend defaulted to `http://localhost:3001` (doesn't exist on Vercel)
- Result: **Always used mock data on Vercel**

### After PR:
- Frontend defaults to `https://supervisortasks-production.up.railway.app`
- Result: **Will use real Google Sheets data when Railway backend is running**

---

## 🔍 Current Status

### Backend Configuration ✅
- ✅ `SheetsService` properly configured to read from Google Sheets
- ✅ All service classes use `SheetsService` to fetch data
- ✅ API routes expose the data via REST endpoints
- ✅ Environment variables configured in `backend/.env`

### Frontend Configuration ✅
- ✅ API client configured to call Railway backend
- ✅ All pages fetch from API endpoints
- ✅ Mock data available as fallback if backend unavailable

### Railway Backend Status ⚠️
- ⚠️ **Backend is currently not responding**
- Testing shows: `curl https://supervisortasks-production.up.railway.app/health` - No response
- **Possible causes**:
  1. Service is stopped/sleeping
  2. Needs to be redeployed
  3. Environment variables not set on Railway

---

## 🚀 To Enable Full Google Sheets Integration

### For Railway Backend to Work:

1. **Ensure Railway service is running**
   - Check Railway dashboard
   - Redeploy if necessary

2. **Set Environment Variables on Railway**:
   ```
   GOOGLE_SHEET_ID=1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Verify Backend is Responding**:
   ```bash
   curl https://supervisortasks-production.up.railway.app/health
   # Should return: {"status":"ok","timestamp":"..."}
   
   curl https://supervisortasks-production.up.railway.app/api/tasks
   # Should return: JSON array of tasks from Google Sheets
   ```

### For Vercel Frontend:

**No changes needed!** ✅ This PR already configures the frontend to use the Railway backend.

When you deploy to Vercel, it will:
1. Use the Railway backend URL by default
2. Fetch real data from Google Sheets (via Railway)
3. Only show mock data if Railway backend is down

---

## 📝 Summary

**YES**, the code is properly configured to read from Google Sheets:

✅ **Backend Code**: Reads from Google Sheets via API  
✅ **Frontend Code**: Calls backend API to get data  
✅ **This PR**: Connects frontend to Railway backend by default

**Next Step**: Ensure Railway backend is deployed and running with correct environment variables.

Once Railway is up, the full data flow will work:
```
Google Sheets → Railway Backend → Vercel Frontend → User sees real data ✅
```
