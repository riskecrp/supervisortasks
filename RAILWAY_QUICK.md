# Quick Railway Connection Guide

## ⚡ 3-Minute Setup

Your backend is already on Railway. Here's how to connect the frontend:

### Step 1: Get Railway Backend URL

Your Railway backend URL looks like:
```
https://your-backend-name.railway.app
```

To find it:
1. Go to [Railway Dashboard](https://railway.app)
2. Open your backend project
3. Copy the URL from the deployment settings

### Step 2: Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-name.railway.app
```

**Important:** Replace `your-backend-name` with your actual Railway URL!

### Step 3: Run Frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000 - Done! 🎉

---

## What You Should See

✅ **Tasks page loads data from Google Sheets**
✅ **Discussions page shows real discussions**
✅ **Supervisors page displays actual supervisors**

⚠️ If you see "Using mock data - backend not available":
- Double-check your Railway URL in `.env.local`
- Make sure backend is running on Railway
- Check for CORS errors in browser console

---

## CORS Setup (If Needed)

If you get CORS errors:

1. Go to Railway backend service
2. Add environment variable:
   ```
   FRONTEND_URL=http://localhost:3000
   ```
3. Redeploy backend

For production (Vercel):
```
FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
```

---

## Deploy Frontend to Vercel

1. Push code to GitHub
2. Import in Vercel
3. Set Root Directory: `frontend`
4. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-name.railway.app`
5. Deploy!

---

## Need Help?

See [RAILWAY_SETUP.md](RAILWAY_SETUP.md) for detailed troubleshooting.

---

## Check Backend Health

Test your Railway backend:
```
https://your-backend-name.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

Test Tasks API:
```
https://your-backend-name.railway.app/api/tasks
```

Should return JSON array of tasks from Google Sheets.
