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

### 3. Run the Application

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
│   │   ├── lib/             # Utilities and mock data
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # (To be integrated with Google Sheets API)
└── package.json             # Root package.json
```

## Current Features

### Pages

1. **Tasks Page (`/`)**
   - Display tasks in a table format
   - Columns: Task List, Task Owner, Status, Claimed/Assigned Date, Due Date, Completed Date, Notes
   - Color-coded status badges (In Progress, Not Started, Completed, Blocked)
   - Red highlighting for overdue tasks
   - Uses mock data

2. **Discussions Page (`/discussions`)**
   - Display discussion topics
   - Columns: Date Posted, Topic, Direct Link, Supervisor Responses
   - Response count badges
   - Uses mock data

3. **Supervisors Page (`/supervisors`)**
   - Display supervisor information
   - Columns: Name, Rank, LOA Status, LOA Start Date, LOA End Date
   - Active/On Leave status badges
   - Uses mock data

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

## Deployment to Vercel

This Next.js application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure the root directory to `frontend`
4. Deploy

Vercel will automatically detect the Next.js framework and configure the build settings.

## Contributing

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
