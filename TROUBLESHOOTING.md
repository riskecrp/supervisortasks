# Troubleshooting Google Sheets Integration

This guide helps diagnose and fix issues with the Google Sheets integration.

## Problem: Tasks showing default or incorrect values

If you're seeing default values like "CeeCee" for all supervisors or "Completed" for all statuses instead of the actual data from your Google Sheet, follow these steps:

### 1. Verify Google Sheets Credentials

**Check that credentials are properly configured:**

```bash
# Option A: Using credentials.json file
ls -la backend/credentials.json

# Option B: Using environment variables
cd backend
cat .env | grep GOOGLE
```

You should see either:
- A `credentials.json` file in the backend directory, OR
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` in the .env file

**If credentials are missing:**
1. Follow the setup instructions in README.md to create a service account
2. Download the credentials.json file and place it in the `backend/` directory
3. OR add the service account email and private key to `backend/.env`

### 2. Verify Sheet Access

**Ensure the service account has access to your spreadsheet:**

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
2. Click "Share" in the top right
3. Add the service account email (found in credentials.json or .env)
4. Give it "Editor" permissions
5. Click "Send"

### 3. Verify Sheet Structure

**The "Tasks" tab must have this exact structure:**

| Column | Header | Description | Example |
|--------|---------|-------------|---------|
| A | Task | The task description | "Review employee feedback" |
| B | Claimed By | Supervisor name | "CeeCee" |
| C | Status | Current status | "In Progress" |
| D | Completed Date | When completed | "2026-02-01" |
| E | Created Date | When created | "2026-01-15" |

**Valid Status Values:**
- Assigned
- Claimed
- Pending Reach Out
- Pending Meeting
- Pending Employee Reach Out
- Pending Discussion
- Completed

**Important:**
- Row 1 should contain headers (Task, Claimed By, Status, Completed Date, Created Date)
- Data should start from Row 2
- The tab must be named exactly "Tasks" (case-sensitive)

### 4. Verify Sheet Tab Name

**Check that the tab is named "Tasks":**

1. Open your Google Sheet
2. Look at the tab names at the bottom
3. The tab must be named exactly "Tasks" (not "tasks", "TASKS", or "Tasks Sheet")

If your tab has a different name, you can either:
- **Option A**: Rename the tab to "Tasks" in Google Sheets
- **Option B**: Update the code in `backend/src/services/tasks.service.ts`:
  ```typescript
  const TASKS_SHEET = 'Your Tab Name Here';
  ```

### 5. Test the Connection

**Run the backend and check the logs:**

```bash
cd backend
npm run dev
```

When the backend starts, it will attempt to read from Google Sheets. Check the console for:

```
Reading tasks from range: 'Tasks'!A2:E1000
Retrieved X rows from Google Sheets
Task 2: { ... }
Task 3: { ... }
Returning X valid tasks after filtering empty rows
```

**Common Error Messages:**

**"Google credentials not configured"**
- Fix: Set up credentials as described in step 1

**"The caller does not have permission"** (403 error)
- Fix: Share the spreadsheet with the service account (step 2)

**"Unable to parse range"** or "Sheet not found" (404 error)
- Fix: Verify the tab name is exactly "Tasks" (step 4)

**"Retrieved 0 rows from Google Sheets"**
- Fix: Add data to your sheet starting from row 2 (step 3)

### 6. Verify Frontend Configuration

**Ensure the frontend can connect to the backend:**

```bash
# Check that frontend/.env exists
cat frontend/.env
```

Should contain:
```
VITE_API_URL=http://localhost:3001/api
```

If missing, create it:
```bash
echo "VITE_API_URL=http://localhost:3001/api" > frontend/.env
```

### 7. Test End-to-End

1. Start the backend:
   ```bash
   npm run dev:backend
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev:frontend
   ```

3. Open http://localhost:5173 in your browser
4. Navigate to the Tasks page
5. You should see tasks loaded from your Google Sheet

### 8. Debugging Tips

**Enable verbose logging:**

The backend now includes detailed logging. Check the console output for:
- Sheet ID being used
- Range being read
- Number of rows retrieved
- Sample task data

**Verify data in Google Sheets:**

1. Open your Google Sheet
2. Go to the "Tasks" tab
3. Verify that:
   - Row 1 has headers
   - Row 2 and below have task data
   - Column B (Claimed By) has supervisor names (not all "CeeCee")
   - Column C (Status) has varied statuses (not all "Completed")

**Check browser console:**

1. Open your browser's Developer Tools (F12)
2. Go to the Network tab
3. Refresh the page
4. Look for the `/api/tasks` request
5. Check the response to see what data the backend is sending

## Still Having Issues?

If you've followed all these steps and are still seeing issues:

1. Check the backend console logs for error messages
2. Check the browser console for network errors
3. Verify the Google Sheet ID in `backend/.env` matches your spreadsheet
4. Try accessing the Google Sheet API directly using the credentials to confirm they work

## Quick Checklist

- [ ] Google Sheets credentials are configured (credentials.json or .env variables)
- [ ] Service account has Editor access to the spreadsheet
- [ ] Sheet has a tab named "Tasks" (exact match, case-sensitive)
- [ ] Tasks tab has headers in row 1: Task, Claimed By, Status, Completed Date, Created Date
- [ ] Tasks tab has data starting from row 2
- [ ] Column C (Status) values match valid statuses
- [ ] Backend .env has correct GOOGLE_SHEET_ID
- [ ] Frontend .env has VITE_API_URL=http://localhost:3001/api
- [ ] Backend is running and shows successful connection logs
- [ ] Frontend is running and can connect to backend
