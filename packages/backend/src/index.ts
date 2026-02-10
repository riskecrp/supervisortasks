import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { SheetsService } from './services/sheets.service';
import { TasksService } from './services/tasks.service';
import { DiscussionsService } from './services/discussions.service';
import { SupervisorsService } from './services/supervisors.service';
import { LOAService } from './services/loa.service';
import { AnalyticsService } from './services/analytics.service';

import { createTasksRouter } from './routes/tasks.routes';
import { createDiscussionsRouter } from './routes/discussions.routes';
import { createSupervisorsRouter } from './routes/supervisors.routes';
import { createLOARouter } from './routes/loa.routes';
import { createAnalyticsRouter } from './routes/analytics.routes';

import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Initialize services
let sheetsService: SheetsService;
let tasksService: TasksService;
let discussionsService: DiscussionsService;
let supervisorsService: SupervisorsService;
let loaService: LOAService;
let analyticsService: AnalyticsService;

try {
  sheetsService = new SheetsService();
  tasksService = new TasksService(sheetsService);
  discussionsService = new DiscussionsService(sheetsService);
  loaService = new LOAService(sheetsService);
  supervisorsService = new SupervisorsService(sheetsService, discussionsService, tasksService);
  analyticsService = new AnalyticsService(
    sheetsService,
    tasksService,
    supervisorsService,
    loaService
  );
  
  console.log('✓ Services initialized successfully');
} catch (error: any) {
  console.error('Failed to initialize services:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/tasks', createTasksRouter(tasksService));
app.use('/api/discussions', createDiscussionsRouter(discussionsService));
app.use('/api/supervisors', createSupervisorsRouter(supervisorsService));
app.use('/api/loa', createLOARouter(loaService));
app.use('/api/analytics', createAnalyticsRouter(analyticsService));

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Google Sheet ID: ${process.env.GOOGLE_SHEET_ID ? '✓ Configured' : '✗ Not configured'}`);
});

export default app;
