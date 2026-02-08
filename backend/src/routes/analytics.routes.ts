import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export function createAnalyticsRouter(analyticsService: AnalyticsService): Router {
  const router = Router();

  // Get overall analytics
  router.get('/', async (req: Request, res: Response) => {
    try {
      const analytics = await analyticsService.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
    }
  });

  // Get supervisor-specific metrics
  router.get('/supervisor/:name', async (req: Request, res: Response) => {
    try {
      const metrics = await analyticsService.getSupervisorMetrics(req.params.name);
      if (!metrics) {
        return res.status(404).json({ error: 'Supervisor not found' });
      }
      res.json(metrics);
    } catch (error: any) {
      console.error('Error getting supervisor metrics:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch supervisor metrics' });
    }
  });

  return router;
}
