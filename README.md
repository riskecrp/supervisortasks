# Supervisor Tasks Management Dashboard

A comprehensive web dashboard for managing supervisor tasks, discussions, feedback, and leave of absence tracking, integrated with Google Sheets.

## Features

- **Task Management**: Create, edit, delete, claim, and track tasks with status updates
- **Discussion Feedback**: Track discussions and feedback from supervisors
- **Supervisor Management**: Add/remove supervisors and track their assignments
- **LOA Tracking**: Manage leave of absence records with start/end dates
- **Analytics Dashboard**: View completion metrics, statistics, and charts
- **Google Sheets Integration**: Real-time sync with existing Google Sheets workflow

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui for styling
- React Query for data fetching
- Zustand for state management
- React Router for navigation

### Backend
- Node.js + Express
- TypeScript
- Google Sheets API integration
- RESTful API design
- Environment-based configuration

## Prerequisites

- Node.js 18+ and npm 9+
- Google Cloud Project with Sheets API enabled
- Service account credentials (JSON file)
- Google Sheet with appropriate permissions

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd supervisortasks
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a service account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
5. Create and download JSON key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the file
6. Share your Google Sheet with the service account email:
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (found in the JSON file)
   - Give "Editor" permissions

### 4. Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
PORT=3001
NODE_ENV=development

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="your_private_key_here"

# Or use credentials file
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# CORS
FRONTEND_URL=http://localhost:5173
```

**Finding your Sheet ID:**
From the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

#### Frontend Configuration

Create `frontend/.env` file:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Run the Application

#### Development Mode

Run both frontend and backend:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

#### Production Build

```bash
npm run build
npm start
```

## Docker Deployment

### Using Docker Compose

1. Set up environment variables in `.env` files
2. Build and run:

```bash
npm run docker:build
npm run docker:up
```

Or use docker-compose directly:

```bash
docker-compose up -d
```

Access the application at http://localhost:3000

### Manual Docker Build

#### Backend

```bash
cd backend
docker build -t supervisortasks-backend .
docker run -p 3001:3001 --env-file .env supervisortasks-backend
```

#### Frontend

```bash
cd frontend
docker build -t supervisortasks-frontend .
docker run -p 5173:5173 supervisortasks-frontend
```

## Deployment Options

### Vercel (Frontend)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy frontend:
   ```bash
   cd frontend
   vercel
   ```
3. Set environment variables in Vercel dashboard

### Render (Backend)

1. Create new Web Service on Render
2. Connect your repository
3. Set build command: `npm install && npm run build --workspace=backend`
4. Set start command: `npm start`
5. Add environment variables

### Railway

1. Create new project on Railway
2. Connect repository
3. Configure environment variables
4. Deploy

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Discussions
- `GET /api/discussions` - Get all discussions
- `POST /api/discussions` - Create new discussion
- `PUT /api/discussions/:id` - Update discussion feedback

### Supervisors
- `GET /api/supervisors` - Get all supervisors
- `POST /api/supervisors` - Add new supervisor
- `DELETE /api/supervisors/:name` - Remove supervisor

### LOA (Leave of Absence)
- `GET /api/loa` - Get all LOA records
- `POST /api/loa` - Create LOA record
- `PUT /api/loa/:id` - Update LOA record
- `DELETE /api/loa/:id` - Delete LOA record

### Analytics
- `GET /api/analytics` - Get dashboard statistics
- `GET /api/analytics/supervisor/:name` - Get supervisor-specific metrics

## Project Structure

```
supervisortasks/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and API client
│   │   ├── store/           # Zustand state management
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Server entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── package.json             # Root package.json (workspaces)
└── README.md
```

## Google Sheets Structure

The application integrates with the following Google Sheet tabs:

### Tasks Sheet
- **Column A**: Task List - Description of the task
- **Column B**: Task Owner - Name of the supervisor assigned to the task
- **Column C**: Status - Current status (Not Started, In Progress, Completed, etc.)
- **Column D**: Claimed/Assigned Date - Date the task was claimed or assigned
- **Column E**: Due Date - Target completion date
- **Column F**: Notes - Additional notes about the task

**Features:**
- Tasks open for more than 5 days are highlighted in red
- Completed tasks are moved to Task History automatically
- Supervisor names come from the Discussions Pending Feedback sheet headers

### Discussions Pending Feedback Sheet
- **Column A**: Date Posted
- **Column B**: Topic
- **Column C**: Direct Link
- **Columns D+**: Dynamic supervisor columns (TRUE/FALSE for feedback status)

**Features:**
- Adding a supervisor adds a new column dynamically
- Removing a supervisor removes their column
- Supervisor list is the source of truth for the application

### Task Rotation Sheet
- **Column A**: Employee Name - Supervisor name
- **Column B**: Rank - Supervisor rank/title
- **Column C**: LOA? - Leave of Absence status (TRUE/FALSE)
- **Column D**: LOA Start Date - Start date of leave
- **Column E**: LOA End Date - End date of leave

**Features:**
- Automatically synced when supervisors are added/removed
- LOA status automatically updated from LOA Tracking sheet
- Used by Google Sheet formulas for task distribution

### LOA Tracking Sheet
- **Column A**: Supervisor Name
- **Column B**: Start Date
- **Column C**: End Date
- **Column D**: Reason
- **Column E**: Status (Active/Completed)

**Features:**
- Active LOA records automatically update Task Rotation sheet
- Changes are immediately reflected in supervisor availability

### Task History Sheet
- **Column A**: Task Name
- **Column B**: Supervisor
- **Column C**: Completed Date
- **Column D**: Duration/Days Taken

**Features:**
- Automatically populated when tasks are marked as Completed
- Used for analytics and workload tracking
- Tracks completion time from Claimed Date to completion

## Troubleshooting

### Google Sheets API Errors

**"The caller does not have permission"**
- Ensure the service account email has Editor access to the sheet
- Check that the Sheet ID is correct

**"Unable to parse range"**
- Verify sheet tab names match exactly (case-sensitive)
- Check that the sheet structure matches the expected format

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Build Errors
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node.js version: `node --version` (should be 18+)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.
