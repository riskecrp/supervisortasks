# Railway Environment Variables - Quick Reference

## 🎯 You Currently Have:
```
NODE_ENV=production ✅
```

## ⚠️ You MUST Add These:

```bash
# 1. Google Sheet ID (from your spreadsheet URL)
GOOGLE_SHEET_ID=1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4

# 2. Service Account Email (from Google Cloud Console)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# 3. Private Key (from downloaded JSON - keep the \n characters!)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# 4. Frontend URL (your Vercel app + localhost for development)
FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
```

---

## 📋 Copy-Paste Template for Railway

Go to Railway → Your Project → Variables → Add these:

```
GOOGLE_SHEET_ID=1izZOyJ6ZbXlPZWPKwffb6wHAEjjR-IGEF-aZ2XD-2_4
GOOGLE_SERVICE_ACCOUNT_EMAIL=YOUR_SA_EMAIL_HERE
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔑 Where to Get Google Credentials

### Service Account Email:
1. [Google Cloud Console](https://console.cloud.google.com)
2. IAM & Admin → Service Accounts
3. Create service account
4. Copy the email (format: `something@project.iam.gserviceaccount.com`)

### Private Key:
1. Service Accounts → Your account → Keys tab
2. Add Key → Create New Key → JSON
3. Download JSON file
4. Open it and copy the `private_key` value
5. **Important**: Keep the `\n` characters in the string!

### Share Google Sheet:
1. Open your Google Sheet
2. Click Share
3. Add the service account email
4. Give "Viewer" access (or "Editor" if backend needs to write)

---

## ✅ After Setting Variables

Railway will automatically redeploy. Check:

1. **Logs** - Look for:
   ```
   ✓ Services initialized successfully
   🚀 Server running on port 3001
   📝 Google Sheet ID: ✓ Configured
   ```

2. **Health Check**:
   ```bash
   curl https://supervisortasks-production.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Tasks API**:
   ```bash
   curl https://supervisortasks-production.up.railway.app/api/tasks
   ```
   Should return: JSON array of tasks from Google Sheets

---

## 🚨 Common Mistakes

❌ **Missing `\n` in private key**
- Wrong: `-----BEGIN PRIVATE KEY-----MIIEvQ...`
- Right: `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"`

❌ **Not sharing Google Sheet with service account**
- You MUST share the sheet with the service account email
- Give at least "Viewer" permission

❌ **Forgetting to wrap private key in quotes**
- The private key value must be wrapped in double quotes
- Example: `GOOGLE_PRIVATE_KEY="-----BEGIN..."`

❌ **Wrong service account email format**
- Should end with `.iam.gserviceaccount.com`
- Not your personal Gmail account

---

## 📊 Variables Summary

| Variable | Required? | You Have It? | What It Does |
|----------|-----------|--------------|--------------|
| `NODE_ENV` | Yes | ✅ YES | Tells Node to run in production mode |
| `GOOGLE_SHEET_ID` | Yes | ❌ NEED | ID of your Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | ❌ NEED | Service account email for auth |
| `GOOGLE_PRIVATE_KEY` | Yes | ❌ NEED | Private key for Google Sheets API |
| `FRONTEND_URL` | Recommended | ❌ NEED | Allowed origins for CORS |
| `PORT` | No | 🔵 Auto | Railway sets this automatically |
| `RATE_LIMIT_*` | No | 🔵 Optional | Has default values |

---

## 🎯 Your Action Items

1. [ ] Get service account credentials from Google Cloud Console
2. [ ] Share Google Sheet with service account email
3. [ ] Add 4 variables to Railway (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, FRONTEND_URL)
4. [ ] Wait for Railway to redeploy
5. [ ] Test health endpoint
6. [ ] Test tasks API
7. [ ] Connect frontend to backend

---

For detailed instructions, see: **RAILWAY_ENV_VARIABLES.md**
