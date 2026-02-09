# Quick Testing Reference

## ❓ Backend Not Available? No Problem!

The app automatically uses mock data when the backend is unavailable. This is **by design** for easy testing.

## 🚀 Quick Start (No Backend Needed)

```bash
git clone <repository-url>
cd supervisortasks
npm install
npm run dev
```

Open http://localhost:3000 - **It just works!** ✅

## 📋 What You'll See

- ⚠️ Warning banner: "Using mock data - backend not available"
- ✅ All pages work normally with sample data
- ✅ All UI features testable

## 🎯 Testing Modes

### 1. Mock Data Mode (Default)
**Use for**: UI development, styling, layout testing

```bash
npm run dev
# Backend connection fails → Uses mock data automatically
```

### 2. Force Mock Data
**Use for**: Testing fallback mechanism

```bash
# Create frontend/.env.local
NEXT_PUBLIC_API_URL=http://invalid-url
npm run dev
```

### 3. Local Backend
**Use for**: Integration testing

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

### 4. Railway Backend
**Use for**: Production-like testing

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app" > .env.local
npm run dev
```

## ✅ Testing Checklist

- [ ] Run `npm run dev` - app loads
- [ ] Navigate to `/` - Tasks page shows mock data
- [ ] Navigate to `/discussions` - Discussions page works
- [ ] Navigate to `/supervisors` - Supervisors page works
- [ ] Check console - no critical errors
- [ ] See warning banner about mock data

## 🔍 Verify Backend Status

```bash
# Check if Railway backend is up
curl https://supervisortasks-production.up.railway.app/health

# Working: {"status":"ok","timestamp":"..."}
# Not working: Connection refused or timeout
```

## 📚 More Information

See **[TESTING.md](TESTING.md)** for comprehensive guide including:
- Detailed testing scenarios
- Environment configuration
- Mock data customization
- Troubleshooting
- CI/CD testing
