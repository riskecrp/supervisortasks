# Supervisor Tasks Management Dashboard

A modern web dashboard for managing supervisor tasks, discussions, feedback, and leave of absence tracking, built with Next.js and ready for Google Sheets integration.

## Features

- **Task Management**: View and track tasks with status updates and due dates
- **Discussion Feedback**: Track discussions and supervisor responses
- **Supervisor Management**: View supervisors and their LOA status
- **Conditional Formatting**: Overdue tasks highlighted in red
- **Status Badges**: Color-coded status indicators for quick visual reference

## Tech Stack

### Frontend
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS v4 for styling
- shadcn/ui components
- Lucide React icons

## Prerequisites

- Node.js 18+ and npm 9+
- (Future) Google Cloud Project with Sheets API enabled
- (Future) Service account credentials for Google Sheets API

## Testing Without Backend

**Note**: This application is designed to run on **Railway (backend) + Vercel (frontend)**, not locally.

### Cloud-Hosted Architecture

- **Backend**: Railway with Google Sheets **two-way sync** (read AND write)
- **Frontend**: Vercel
- **Data**: Google Sheets (persistent storage)

### Primary Testing Method

Access your deployed application:
```
https://your-app.vercel.app
```

All CRUD operations (Create, Read, Update, Delete) work with full Google Sheets synchronization.

### Mock Data Fallback

If Railway backend is temporarily unavailable, the frontend automatically uses **read-only** mock data for UI testing. See **[TESTING.md](TESTING.md)** for complete testing guide.

**Important**: Mock data is read-only. For full two-way Google Sheets synchronization, use the deployed Railway backend.

## Setup Instructions

### Quick Start (With Railway Backend)

**If you already have a backend deployed on Railway:**

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd supervisortasks
   npm install
   ```

2. Configure frontend to use your Railway backend:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
3. Edit `frontend/.env.local` and set your Railway backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 - Your app will load data from Railway! 🚀

**For detailed Railway setup and troubleshooting, see [RAILWAY_SETUP.md](RAILWAY_SETUP.md)**

---

### Full Setup (Local Development with Backend)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd supervisortasks
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Backend (Optional - if running locally)

See [QUICKSTART.md](QUICKSTART.md) for detailed backend setup instructions with Google Sheets.

### 4. Run the Application

#### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

#### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
supervisortasks/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.tsx     # Tasks page (/)
│   │   │   ├── discussions/ # Discussions page
│   │   │   └── supervisors/ # Supervisors page
│   │   ├── components/      # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── Sidebar.tsx  # Navigation sidebar
│   │   ├── lib/             # Utilities, API client, and mock data
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # Express API with Google Sheets integration
│   │                         # (Can be deployed to Railway)
│   ├── src/
│   │   ├── services/        # Google Sheets service, business logic
│   │   ├── routes/          # API endpoints
│   │   └── index.ts         # Server entry point
│   └── package.json
└── package.json             # Root package.json
```

## Current Features

### Backend Integration

- **API Client**: Connects to Railway-hosted backend or local backend
- **Real-time Data**: Fetches tasks, discussions, and supervisors from Google Sheets via API
- **Graceful Fallback**: Uses mock data if backend is unavailable
- **Loading States**: Shows loading indicators while fetching data
- **Error Handling**: Displays warnings when backend connection fails

### Pages

1. **Tasks Page (`/`)**
   - Display tasks in a table format
   - Columns: Task List, Task Owner, Status, Claimed/Assigned Date, Due Date, Completed Date, Notes
   - Soft, muted status badges (In Progress, Not Started, Completed, Blocked)
   - Subtle amber highlighting for overdue tasks
   - Fetches from backend API with fallback to mock data

2. **Discussions Page (`/discussions`)**
   - Display discussion topics
   - Columns: Date Posted, Topic, Direct Link, Supervisor Responses
   - Response count badges with muted colors
   - Fetches from backend API with fallback to mock data

3. **Supervisors Page (`/supervisors`)**
   - Display supervisor information
   - Columns: Name, Rank, LOA Status, LOA Start Date, LOA End Date
   - Active/On Leave status badges with soft colors
   - Fetches from backend API with fallback to mock data

### Navigation

- Sidebar navigation with active page highlighting
- Clean, modern UI with dark mode support

## Next Steps

The foundational UI is complete. Future development will include:

1. **Google Sheets Integration**
   - Connect to Google Sheets API
   - Implement two-way synchronization
   - Real-time data updates

2. **CRUD Operations**
   - Add, edit, and delete tasks
   - Manage discussions
   - Update supervisor information

3. **Deployment**
   - Deploy frontend to Vercel
   - Set up backend API for Google Sheets integration

## Google Sheets Structure

The application is designed to work with the following Google Sheet tabs:

### Tasks Sheet
- **Column A**: Task List - Description of the task
- **Column B**: Task Owner - Name of the supervisor assigned to the task
- **Column C**: Status - Current status (Not Started, In Progress, Completed, Blocked)
- **Column D**: Claimed/Assigned Date - Date the task was claimed or assigned
- **Column E**: Due Date - Target completion date
- **Column F**: Completed Date - Date task was completed  
- **Column G**: Notes - Additional notes about the task

### Discussions Pending Feedback Sheet
- **Column A**: Date Posted
- **Column B**: Topic
- **Column C**: Direct Link
- **Columns D+**: Dynamic supervisor columns (TRUE/FALSE for feedback status)

### Task Rotation Sheet
- **Column A**: Employee Name - Supervisor name
- **Column B**: Rank - Supervisor rank/title
- **Column C**: LOA? - Leave of Absence status (TRUE/FALSE)
- **Column D**: LOA Start Date - Start date of leave
- **Column E**: LOA End Date - End date of leave

## Deployment

### Using Railway-Hosted Backend (Quick Setup)

**If you already have a backend deployed on Railway:**

**Your Railway backend is at:** `https://supervisortasks-production.up.railway.app`

1. Configure the frontend:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local and set:
   # NEXT_PUBLIC_API_URL=https://supervisortasks-production.up.railway.app
   ```

2. Run the frontend:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 - it will connect to your Railway backend!

**For detailed Railway setup instructions, see [RAILWAY_SETUP.md](RAILWAY_SETUP.md)**

### Deployment to Vercel (Frontend)

This Next.js application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
4. Add environment variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://supervisortasks-production.up.railway.app`
5. Deploy!

### Railway Backend Environment Variables

**⚠️ Important**: Your Railway backend needs these environment variables to work:

**Quick Reference**: See [RAILWAY_QUICK_REFERENCE.md](RAILWAY_QUICK_REFERENCE.md)  
**Detailed Guide**: See [RAILWAY_ENV_VARIABLES.md](RAILWAY_ENV_VARIABLES.md)

**Required Variables**:
```bash
NODE_ENV=production                      # ✅ You have this
GOOGLE_SHEET_ID=your_sheet_id           # ⚠️ Need to add
GOOGLE_SERVICE_ACCOUNT_EMAIL=...        # ⚠️ Need to add
GOOGLE_PRIVATE_KEY="-----BEGIN..."      # ⚠️ Need to add
FRONTEND_URL=https://your-app.vercel.app # 📝 Recommended
```

For step-by-step instructions on getting Google credentials and setting these variables in Railway, see:
- **[RAILWAY_QUICK_REFERENCE.md](RAILWAY_QUICK_REFERENCE.md)** - Quick copy-paste template
- **[RAILWAY_ENV_VARIABLES.md](RAILWAY_ENV_VARIABLES.md)** - Complete guide with troubleshooting

### Backend CORS Configuration

Make sure your Railway backend has the correct CORS configuration:

1. In Railway, go to your backend service
2. Add/update environment variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. For multiple origins (local + production):
   ```
   FRONTEND_URL=https://your-frontend.vercel.app,http://localhost:3000
   ```

## Google Sheets Structure

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.
