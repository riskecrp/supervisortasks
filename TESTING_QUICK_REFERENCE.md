# Quick Testing Reference

## ⚠️ Important: Cloud-Hosted Architecture

This application is **NOT for local development**. It runs on:
- **Backend**: Railway (with Google Sheets two-way sync)
- **Frontend**: Vercel
- **Data**: Google Sheets (persistent storage)

## 🚀 Primary Testing Method

**Access the deployed application**:
```
https://your-app.vercel.app
```

**What you can do**:
- ✅ **View** data from Google Sheets
- ✅ **Create** tasks/discussions/supervisors → Writes to Google Sheets
- ✅ **Update** data → Updates Google Sheets  
- ✅ **Delete** data → Removes from Google Sheets

**This is the intended way to use the application!**

## 📋 Mock Data Fallback (Read-Only)

If Railway backend is temporarily unavailable:
- ⚠️ Warning banner appears: "Using mock data - backend not available"
- ✅ View sample data for UI testing
- ❌ **Cannot create/update/delete** (read-only mode)
- ❌ **No writes to Google Sheets**

## 🎯 Testing Modes

### 1. Production Testing (Recommended)
**Use for**: Full testing with two-way Google Sheets sync

```
Frontend: https://your-app.vercel.app
Backend: https://supervisortasks-production.up.railway.app
```

✅ All CRUD operations work  
✅ Changes persist to Google Sheets  
✅ Real data testing

### 2. Mock Data Mode (Fallback Only)
**Use for**: UI testing when Railway is down

- Frontend automatically uses mock data if backend unavailable
- **Read-only** - No writes possible
- Warning banner shows: "Using mock data"

### 3. Local Development (Advanced - Not Recommended)
**Use for**: Code changes only

```bash
# Only if you're a developer making backend changes
cd backend && npm run dev
cd frontend && npm run dev
```

**Requires**: Google credentials, Node.js, manual setup

## ✅ Testing Checklist

### Production Deployment
- [ ] Access deployed Vercel frontend
- [ ] No warning banner (Railway connected)
- [ ] Create a test task → Check Google Sheets
- [ ] Update task → Verify in Google Sheets
- [ ] Delete task → Confirm removed from Google Sheets
- [ ] Test discussions and supervisors pages

### Mock Data Fallback
- [ ] Warning banner appears if Railway down
- [ ] Can view sample data (read-only)
- [ ] Understand: No writes to Google Sheets in this mode

## 🔍 Verify Backend Status

```bash
# Check if Railway backend is up
curl https://supervisortasks-production.up.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 📊 Two-Way Sync Verification

1. **Create via frontend** → Check appears in Google Sheets
2. **Edit in Google Sheets** → Refresh frontend, see changes
3. **Delete via frontend** → Verify removed from Google Sheets

✅ Confirms: Two-way synchronization working

## 📚 More Information

**Complete guide**: [TESTING.md](TESTING.md)

**Deployment guides**:
- [RAILWAY_SETUP.md](RAILWAY_SETUP.md) - Backend deployment
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Frontend deployment
- [DATA_FLOW_VERIFICATION.md](DATA_FLOW_VERIFICATION.md) - Architecture overview
