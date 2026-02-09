# Railway Environment Variables Configuration

## Required Environment Variables for Node.js Backend

Your Railway backend needs the following environment variables to run properly. Currently you have `NODE_ENV=production`, but you need several more.

---

## 📋 Complete List of Required Variables

### 1. **NODE_ENV** (You already have this! ✅)
```
NODE_ENV=production
```
- **Purpose**: Tells Node.js to run in production mode
- **Already Set**: YES ✅
- **What it does**: Optimizes performance, disables development features

### 2. **PORT** (Optional - Railway sets this automatically)
```
PORT=3001
```
- **Purpose**: Port for the Express server to listen on
- **Required**: NO - Railway automatically provides this
- **Default**: Railway will inject its own PORT variable
- **Note**: You don't need to set this manually

### 3. **GOOGLE_SHEET_ID** ⚠️ REQUIRED
```
GOOGLE_SHEET_ID=1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4
```
- **Purpose**: ID of your Google Sheet containing the data
- **Required**: YES ⚠️
- **Where to get it**: From your Google Sheets URL
  - URL format: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
- **Your value**: `1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4`

### 4. **GOOGLE_SERVICE_ACCOUNT_EMAIL** ⚠️ REQUIRED
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```
- **Purpose**: Email of the Google service account with access to the sheet
- **Required**: YES ⚠️
- **Where to get it**: From your Google Cloud Console
  - Go to: IAM & Admin → Service Accounts
  - Create a service account if you don't have one
  - Format: `something@project-name.iam.gserviceaccount.com`
- **Important**: This service account must have access to your Google Sheet!

### 5. **GOOGLE_PRIVATE_KEY** ⚠️ REQUIRED
```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```
- **Purpose**: Private key for authenticating with Google Sheets API
- **Required**: YES ⚠️
- **Where to get it**: Download from Google Cloud Console
  - Go to: Service Account → Keys → Add Key → Create New Key (JSON)
  - Open the downloaded JSON file
  - Copy the `private_key` field value
- **Important Notes**:
  - Must be wrapped in double quotes
  - Must include `\n` characters (they're literal in the string)
  - Format: `"-----BEGIN PRIVATE KEY-----\nMIIE...rest of key...\n-----END PRIVATE KEY-----\n"`

### 6. **FRONTEND_URL** (Recommended for CORS)
```
FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
```
- **Purpose**: Allowed origins for CORS (Cross-Origin Resource Sharing)
- **Required**: Recommended for production
- **Format**: Comma-separated list of URLs
- **Examples**:
  - For Vercel only: `https://your-app.vercel.app`
  - For local dev only: `http://localhost:3000`
  - For both: `https://your-app.vercel.app,http://localhost:3000`
- **What happens if not set**: Backend defaults to `http://localhost:5173`

### 7. **RATE_LIMIT_WINDOW_MS** (Optional)
```
RATE_LIMIT_WINDOW_MS=900000
```
- **Purpose**: Rate limiting window in milliseconds
- **Required**: NO - has default value
- **Default**: 900000 (15 minutes)
- **What it does**: Time window for rate limiting API requests

### 8. **RATE_LIMIT_MAX_REQUESTS** (Optional)
```
RATE_LIMIT_MAX_REQUESTS=100
```
- **Purpose**: Maximum requests per window
- **Required**: NO - has default value
- **Default**: 100 requests
- **What it does**: Max number of API requests allowed per time window

---

## 🚀 Step-by-Step: Setting Variables in Railway

### Method 1: Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Log in to your account

2. **Select Your Project**
   - Click on your backend project
   - Should be something like "supervisortasks-production"

3. **Go to Variables Tab**
   - Click on your backend service
   - Click the "Variables" tab

4. **Add Each Variable**
   - Click "New Variable" button
   - Enter the variable name (e.g., `GOOGLE_SHEET_ID`)
   - Enter the value
   - Click "Add"

5. **Required Variables to Add**:
   ```
   GOOGLE_SHEET_ID=1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"
   FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
   ```

6. **Deploy**
   - Railway will automatically redeploy with new variables
   - Wait for deployment to complete

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set variables
railway variables set GOOGLE_SHEET_ID="1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4"
railway variables set GOOGLE_SERVICE_ACCOUNT_EMAIL="your-sa@project.iam.gserviceaccount.com"
railway variables set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----\n"
railway variables set FRONTEND_URL="https://your-app.vercel.app,http://localhost:3000"
```

---

## ✅ Quick Setup Checklist

Copy this checklist for setting up Railway:

- [ ] **NODE_ENV** = `production` ✅ (You already have this!)
- [ ] **GOOGLE_SHEET_ID** = Your sheet ID from Google Sheets URL
- [ ] **GOOGLE_SERVICE_ACCOUNT_EMAIL** = Email from Google Cloud Console
- [ ] **GOOGLE_PRIVATE_KEY** = Private key from downloaded JSON (with `\n` characters)
- [ ] **FRONTEND_URL** = Your Vercel app URL(s)
- [ ] Share your Google Sheet with the service account email (Viewer access)
- [ ] Redeploy backend on Railway
- [ ] Test: `curl https://your-railway-url.railway.app/health`
- [ ] Test: `curl https://your-railway-url.railway.app/api/tasks`

---

## 🔑 Getting Google Credentials

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to: **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Give it a name (e.g., "supervisortasks-backend")
6. Click **Create and Continue**
7. Skip role assignment (click Continue)
8. Click **Done**

### Step 2: Create & Download Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download - **SAVE IT SECURELY!**

### Step 3: Extract Information

Open the downloaded JSON file. It looks like:

```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "supervisortasks@your-project.iam.gserviceaccount.com",
  ...
}
```

**Extract these values**:
- `client_email` → Use for `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → Use for `GOOGLE_PRIVATE_KEY` (keep the `\n` characters!)

### Step 4: Share Google Sheet

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from `client_email`)
4. Give it **Viewer** access (or Editor if backend needs to write)
5. Click **Send**

---

## 🧪 Testing Your Configuration

### Test 1: Health Check
```bash
curl https://supervisortasks-production.up.railway.app/health
```

**Expected Response**:
```json
{"status":"ok","timestamp":"2026-02-09T07:00:00.000Z"}
```

### Test 2: Tasks API
```bash
curl https://supervisortasks-production.up.railway.app/api/tasks
```

**Expected Response**:
```json
[
  {
    "id": "task-2",
    "taskList": "Review and approve monthly reports",
    "taskOwner": "John Smith",
    "status": "In Progress",
    ...
  },
  ...
]
```

### Test 3: Check Logs

In Railway Dashboard:
1. Go to your backend service
2. Click **Deployments** tab
3. Click on the latest deployment
4. View logs for any errors

**Look for these success messages**:
```
✓ Services initialized successfully
🚀 Server running on port 3001
📊 Environment: production
📝 Google Sheet ID: ✓ Configured
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Google credentials not configured"

**Error in logs**: 
```
Error: Google credentials not configured
```

**Solution**: 
- Make sure you set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`
- Check that the private key includes the `\n` characters
- Verify the key is wrapped in double quotes

### Issue 2: "Failed to read from Google Sheets"

**Error in logs**:
```
Error reading range Tasks!A2:F: The caller does not have permission
```

**Solution**:
- Share your Google Sheet with the service account email
- Give it at least Viewer access
- Wait a minute for permissions to propagate

### Issue 3: CORS Errors

**Error in browser console**:
```
Access to fetch has been blocked by CORS policy
```

**Solution**:
- Set `FRONTEND_URL` in Railway
- Include your Vercel app URL
- Redeploy backend
- Example: `FRONTEND_URL=https://your-app.vercel.app`

### Issue 4: Backend Not Starting

**Check logs for**:
- TypeScript compilation errors
- Missing dependencies
- Port binding issues

**Solution**:
- Ensure `package.json` has `build` and `start` scripts
- Railway should run: `npm run build` then `npm start`
- Check Railway build logs

---

## 📝 Summary: What You Need to Do

Since you already have `NODE_ENV=production`, you need to add:

### Required (Must Add):
1. ✅ `GOOGLE_SHEET_ID` - Your sheet ID
2. ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email  
3. ✅ `GOOGLE_PRIVATE_KEY` - Private key (with `\n` characters)

### Recommended:
4. ✅ `FRONTEND_URL` - Your frontend URL(s) for CORS

### Optional (Have defaults):
5. ⚪ `RATE_LIMIT_WINDOW_MS` - Rate limiting window
6. ⚪ `RATE_LIMIT_MAX_REQUESTS` - Rate limiting max requests

---

## 🎯 Final Checklist

Before considering your Railway setup complete:

- [ ] Set all 3 required variables in Railway
- [ ] Service account has access to Google Sheet
- [ ] Backend deploys successfully (check Railway logs)
- [ ] Health endpoint returns 200 OK
- [ ] Tasks API returns data from Google Sheets
- [ ] Frontend can connect to backend (no CORS errors)
- [ ] Data flows: Google Sheets → Railway → Vercel → User

---

## 📞 Need Help?

If you're stuck:
1. Check Railway deployment logs
2. Test health endpoint: `/health`
3. Verify Google Sheet is shared with service account
4. Check that all environment variables are set correctly
5. Open an issue on GitHub with error logs

---

**Last Updated**: February 9, 2026
