# Supervisor Tasks Management Dashboard

A modern, full-stack web application for managing supervisor tasks, discussions, feedback, and leave of absence tracking. Built with Next.js, Express.js, TypeScript, and Google Sheets integration.

## 🚀 Features

- **Task Management**: Create, read, update, and delete tasks with automatic due date calculation
- **Discussion Tracking**: Monitor discussions and supervisor feedback responses
- **Supervisor Management**: View supervisors and manage their LOA (Leave of Absence) status
- **Task Rotation**: Fair distribution of tasks based on supervisor availability
- **Real-time Sync**: Two-way synchronization with Google Sheets
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and shadcn/ui components
- **Type-Safe**: Full TypeScript implementation across frontend and backend

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Google Sheets API
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod
- **Deployment**: Railway

## 🏗️ Project Structure

```
supervisortasks/
├── packages/
│   ├── frontend/              # Next.js application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router pages
│   │   │   │   ├── page.tsx              # Tasks dashboard
│   │   │   │   ├── discussions/          # Discussions page
│   │   │   │   └── supervisors/          # Supervisors page
│   │   │   ├── components/   # React components
│   │   │   │   ├── ui/                   # shadcn/ui components
│   │   │   │   └── Sidebar.tsx           # Navigation
│   │   │   ├── lib/          # Utilities, API client, mock data
│   │   │   └── types/        # TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vercel.json
│   │
│   └── backend/               # Express.js API
│       ├── src/
│       │   ├── services/     # Business logic & Google Sheets
│       │   ├── routes/       # API endpoints
│       │   ├── middleware/   # Error handling
│       │   ├── types/        # TypeScript types
│       │   └── index.ts      # Server entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker configuration
├── package.json               # Root workspace config
└── README.md                  # This file
```

## 🎯 Prerequisites

- Node.js 20.9.0 or higher
- npm 9.0.0 or higher
- Google Cloud Project with Sheets API enabled
- Google Service Account with access to your spreadsheet

## 🔧 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/riskecrp/supervisortasks.git
cd supervisortasks
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 3. Configure Environment Variables

#### Backend Configuration

Create `packages/backend/.env`:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration

Create `packages/frontend/.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Google Sheets Setup

Your Google Sheet should have the following tabs:

#### Names Tab
- Column A: Supervisor Names

#### Tasks Tab
- Column A: Task List (description)
- Column B: Task Owner (supervisor name)
- Column C: Status (Not Started, In Progress, Completed, Blocked)
- Column D: Claimed/Assigned Date
- Column E: Due Date (auto-calculated: assigned date + 5 days)
- Column F: Completed Date (set when status = Completed)
- Column G: Notes

#### Discussions Pending Feedback Tab
- Column A: Date Posted
- Column B: Topic
- Column C: Direct Link
- Columns D+: Supervisor columns (TRUE/FALSE for responses)

#### Task Rotation Tab
- Column A: Employee Name
- Column B: Rank
- Column C: LOA? (TRUE/FALSE)
- Column D: LOA Start Date
- Column E: LOA End Date

### 5. Share Google Sheet with Service Account

Share your Google Sheet with the service account email from your configuration.

## 🚀 Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Production Build

```bash
# Build both applications
npm run build

# Start backend
npm run start:backend

# Start frontend (in another terminal)
npm run start
```

### Docker

Run with Docker Compose:

```bash
# Create .env file with your configuration
cp .env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import repository in Vercel
3. Configure:
   - **Root Directory**: Leave empty (monorepo auto-detected)
   - **Framework**: Next.js
   - **Build Command**: `cd packages/frontend && npm run build`
   - **Output Directory**: `packages/frontend/.next`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
5. Deploy!

### Backend (Railway)

1. Create new project in Railway
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (or Railway's PORT)
   - `GOOGLE_SHEET_ID`: Your spreadsheet ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
   - `GOOGLE_PRIVATE_KEY`: Service account private key
   - `FRONTEND_URL`: Your Vercel frontend URL
5. Deploy!

## 📡 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Discussions
- `GET /api/discussions` - Get all discussions
- `GET /api/discussions/:id` - Get discussion by ID
- `POST /api/discussions` - Create new discussion
- `PUT /api/discussions/:id` - Update discussion
- `DELETE /api/discussions/:id` - Delete discussion

### Supervisors
- `GET /api/supervisors` - Get all supervisors
- `GET /api/supervisors/:id` - Get supervisor by ID
- `POST /api/supervisors` - Add new supervisor
- `PUT /api/supervisors/:id` - Update supervisor
- `DELETE /api/supervisors/:id` - Remove supervisor

### LOA (Leave of Absence)
- `GET /api/loa` - Get all LOA records
- `POST /api/loa` - Create LOA record
- `PUT /api/loa/:id` - Update LOA record
- `DELETE /api/loa/:id` - Delete LOA record

### Analytics
- `GET /api/analytics` - Get dashboard analytics
- `GET /api/analytics/task-distribution` - Get task distribution by supervisor

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:all          # Start both concurrently

# Building
npm run build            # Build both
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Production
npm start                # Start frontend
npm run start:backend    # Start backend

# Linting & Type Checking
npm run lint             # Lint frontend
npm run typecheck        # Type check backend
```

### Adding New Features

1. Create a feature branch
2. Make your changes in the appropriate workspace
3. Test thoroughly (frontend and backend)
4. Submit a pull request

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🆘 Support

For issues, questions, or feature requests, please open an issue on GitHub.

## 📝 Notes

- The application uses Google Sheets as its database for easy data management
- Two-way sync ensures data consistency between the app and Google Sheets
- Mock data fallback is available when backend is unavailable (read-only)
- The UI features conditional formatting (overdue tasks highlighted)
- Automatic due date calculation (5 days after claimed/assigned date)
- Status-based workflow (automatic completion date when task marked complete)
