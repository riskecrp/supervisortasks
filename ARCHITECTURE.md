# Application Architecture

## Overview

The Supervisor Tasks Management Dashboard is a **cloud-hosted application** with the following architecture:

```
┌───────────────────────────────────────────────────────────────┐
│                    Production Architecture                     │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│   Vercel           ←→        Railway        ←→    Google       │
│  (Frontend)              (Backend API)           Sheets        │
│                                                  (Database)     │
│  Next.js                 Express.js                            │
│  React UI                Node.js                               │
│                          Two-Way Sync                          │
│                                                                 │
│  • User Interface        • REST API              • Tasks       │
│  • Client-side           • CRUD Operations       • Discussions │
│  • Routing               • Authentication        • Supervisors │
│  • Mock Data             • Google Sheets         • LOA Status  │
│    Fallback               Integration           • History     │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (Vercel)

**Technology**: Next.js 16 with App Router, React 19, TypeScript

**Hosting**: Vercel (https://your-app.vercel.app)

**Responsibilities**:
- Render user interface
- Handle client-side routing
- Make API calls to Railway backend
- Automatically fallback to mock data if backend unavailable
- Display warning banner when using mock data

**Key Files**:
- `/frontend/src/app/` - Page components
- `/frontend/src/components/` - Reusable UI components
- `/frontend/src/lib/api.ts` - API client
- `/frontend/src/lib/mockData.ts` - Fallback mock data

### Backend (Railway)

**Technology**: Express.js, Node.js, TypeScript, Google Sheets API

**Hosting**: Railway (https://supervisortasks-production.up.railway.app)

**Responsibilities**:
- Provide REST API endpoints
- Authenticate with Google Sheets API
- Perform CRUD operations on Google Sheets
- Handle CORS for frontend access
- Maintain task history

**Key Files**:
- `/backend/src/index.ts` - Express server entry point
- `/backend/src/routes/` - API route handlers
- `/backend/src/services/` - Business logic and Google Sheets integration
- `/backend/src/services/sheets.service.ts` - Google Sheets API wrapper

**API Endpoints**:

| Method | Endpoint | Description | Google Sheets Operation |
|--------|----------|-------------|------------------------|
| GET | `/api/tasks` | Get all tasks | Read from "Tasks" sheet |
| GET | `/api/tasks/:id` | Get single task | Read specific row |
| POST | `/api/tasks` | Create new task | Append row to "Tasks" sheet |
| PUT | `/api/tasks/:id` | Update task | Update row in "Tasks" sheet |
| DELETE | `/api/tasks/:id` | Delete task | Remove row from "Tasks" sheet |
| GET | `/api/discussions` | Get all discussions | Read from "Discussions" sheet |
| POST | `/api/discussions` | Create discussion | Append to "Discussions" sheet |
| PUT | `/api/discussions/:id/feedback` | Update feedback | Update "Discussions" sheet |
| DELETE | `/api/discussions/:id` | Delete discussion | Remove from "Discussions" sheet |
| GET | `/api/supervisors` | Get all supervisors | Read from "Supervisors" sheet |
| POST | `/api/supervisors` | Add supervisor | Append to "Supervisors" sheet |
| DELETE | `/api/supervisors/:name` | Remove supervisor | Remove from "Supervisors" sheet |
| GET | `/api/loa` | Get LOA records | Read from "LOA Status" sheet |
| POST | `/api/loa` | Create LOA record | Append to "LOA Status" sheet |
| PUT | `/api/loa/:id` | Update LOA record | Update "LOA Status" sheet |
| DELETE | `/api/loa/:id` | Delete LOA record | Remove from "LOA Status" sheet |

### Data Store (Google Sheets)

**Technology**: Google Sheets API v4

**Access**: Via service account with Editor permissions

**Sheet Structure**:

1. **Tasks Sheet**
   - Column A: Task List (task description)
   - Column B: Task Owner (supervisor name)
   - Column C: Status (Not Started, In Progress, Completed, Blocked)
   - Column D: Claimed/Assigned Date
   - Column E: Due Date
   - Column F: Notes

2. **Discussions Pending Feedback Sheet**
   - Column A: Date Posted
   - Column B: Topic
   - Column C: Direct Link
   - Columns D+: Dynamic supervisor feedback columns

3. **Task Rotation Sheet** (Supervisors)
   - Column A: Employee Name (supervisor name)
   - Column B: Rank (supervisor title)
   - Column C: LOA? (Leave of Absence status)
   - Column D: LOA Start Date
   - Column E: LOA End Date

4. **LOA Status Sheet**
   - Column A: Supervisor Name
   - Column B: Start Date
   - Column C: End Date
   - Column D: Status

5. **Task History Sheet** (Auto-created)
   - Column A: Task Name
   - Column B: Supervisor
   - Column C: Completed Date
   - Column D: Duration (days)

## Data Flow

### Two-Way Synchronization

The application provides full CRUD (Create, Read, Update, Delete) operations with Google Sheets:

#### Read Operation Flow
```
User → Frontend → Backend → Google Sheets API → Google Sheets
                  ↓
User ← Frontend ← Backend ← Data
```

#### Write Operation Flow (Create/Update/Delete)
```
User → Frontend → Backend → Google Sheets API → Google Sheets (Modified)
                  ↓
User ← Frontend ← Backend ← Confirmation
```

### Example: Creating a Task

1. **User Action**: User fills out form on frontend and clicks "Create Task"
2. **Frontend**: Makes POST request to `https://supervisortasks-production.up.railway.app/api/tasks`
3. **Backend**: Receives request, validates data
4. **Backend**: Calls `tasksService.createTask()`
5. **Backend**: Calls `sheetsService.appendRange()` with new task data
6. **Google Sheets API**: Appends new row to "Tasks" sheet
7. **Backend**: Returns created task to frontend
8. **Frontend**: Updates UI with new task
9. **Google Sheets**: New row is now visible in the spreadsheet

### Example: Updating Task Status

1. **User Action**: User changes task status to "Completed"
2. **Frontend**: Makes PUT request to `/api/tasks/:id`
3. **Backend**: Calls `tasksService.updateTask()`
4. **Backend**: Updates specific row using `sheetsService.writeRange()`
5. **Backend**: If status is "Completed", also calls `addToHistory()`
6. **Google Sheets**: Row updated in "Tasks" sheet, history added to "Task History" sheet
7. **Frontend**: Displays updated task

## Fallback Mechanism

### Mock Data (Read-Only)

**Purpose**: Provide UI testing capability when Railway backend is temporarily unavailable

**Location**: `/frontend/src/lib/mockData.ts`

**Behavior**:
- Frontend automatically detects backend connection failure
- Displays warning banner: "⚠️ Using mock data - backend not available"
- Loads pre-defined mock data for tasks, discussions, and supervisors
- **Limitation**: Read-only - No writes to Google Sheets possible

**Mock Data Includes**:
- 5 sample tasks (various statuses, some overdue)
- 3 sample discussions (with supervisor response tracking)
- 4 sample supervisors (including one on LOA)

**Use Cases**:
- Railway backend maintenance
- UI/UX development without affecting production data
- Visual testing of layouts and styling
- Demo/presentation mode

## Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Configure project**:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
3. **Set environment variable**:
   - `NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app`
4. **Deploy** - Vercel automatically builds and hosts

### Backend Deployment (Railway)

1. **Connect GitHub repository** to Railway
2. **Configure service**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. **Set environment variables**:
   - `GOOGLE_SHEET_ID` - Your Google Sheets ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
   - `GOOGLE_PRIVATE_KEY` - Service account private key
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `NODE_ENV=production`
4. **Deploy** - Railway automatically builds and hosts

### Google Sheets Setup

1. **Enable Google Sheets API** in Google Cloud Console
2. **Create service account** and download JSON credentials
3. **Share Google Sheet** with service account email (Editor permissions)
4. **Copy Sheet ID** from URL
5. **Configure** Railway backend with credentials

## Security

### Authentication
- **Google Sheets**: Service account authentication with private key
- **CORS**: Backend configured to only accept requests from Vercel frontend

### Environment Variables
- All credentials stored as environment variables (not in code)
- Private keys never committed to repository
- `.env.example` files provide templates without sensitive data

### Access Control
- Google Sheet must be explicitly shared with service account
- Service account has minimal permissions (only Sheets API)
- Frontend cannot directly access Google Sheets (must go through backend)

## Monitoring

### Health Checks
- Backend provides `/health` endpoint
- Returns: `{"status":"ok","timestamp":"..."}`

### Logs
- **Railway**: View logs in Railway dashboard
- **Vercel**: View logs in Vercel dashboard
- **Frontend**: Browser console for client-side errors

### Error Handling
- Backend returns appropriate HTTP status codes
- Frontend displays user-friendly error messages
- Automatic fallback to mock data on connection failure

## Development

### Local Development (Optional/Advanced)

For developers making code changes:

```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env
# Edit .env with Google credentials
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

**Requirements**:
- Google Cloud service account credentials
- Google Sheets API enabled
- Node.js 18+

**Note**: The application is designed for cloud deployment, not local development.

## Testing

### Production Testing (Recommended)

1. Access deployed frontend: `https://your-app.vercel.app`
2. Verify Railway backend connection (no warning banner)
3. Test CRUD operations:
   - Create a task → Verify in Google Sheets
   - Update task → Confirm change in Google Sheets
   - Delete task → Check removed from Google Sheets
4. Test all pages: Tasks, Discussions, Supervisors

### Mock Data Testing (Fallback)

1. Access frontend when Railway is down
2. Observe warning banner
3. Verify UI works with sample data (read-only)
4. Understand: No writes to Google Sheets in this mode

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## Summary

- **Architecture**: Cloud-hosted (Railway + Vercel)
- **Data**: Google Sheets with two-way synchronization
- **Operations**: Full CRUD (Create, Read, Update, Delete)
- **Fallback**: Read-only mock data when backend unavailable
- **Deployment**: Designed for production, not local development
- **Testing**: Primary method is testing deployed application

For deployment guides:
- [RAILWAY_SETUP.md](RAILWAY_SETUP.md) - Backend deployment
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Frontend deployment
- [DATA_FLOW_VERIFICATION.md](DATA_FLOW_VERIFICATION.md) - Data flow details
