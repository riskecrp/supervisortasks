import { Router, Request, Response } from 'express';
import { TasksService } from '../services/tasks.service';
import { SheetsValidationService } from '../services/sheets-validation.service';
import { SheetsService } from '../services/sheets.service';

export function createTasksRouter(tasksService: TasksService, sheetsService?: SheetsService): Router {
  const router = Router();

  // Validate sheet structure - helpful for debugging
  router.get('/validate', async (req: Request, res: Response) => {
    try {
      // Use provided sheetsService or create new one if not provided (for backwards compatibility)
      const service = sheetsService || new SheetsService();
      const validationService = new SheetsValidationService(service);
      const result = await validationService.validateTasksSheet();
      res.json(result);
    } catch (error: any) {
      console.error('Error validating sheet:', error);
      res.status(500).json({ error: error.message || 'Failed to validate sheet' });
    }
  });

  // Get sheet summary - helpful for debugging
  router.get('/sheet-summary', async (req: Request, res: Response) => {
    try {
      // Use provided sheetsService or create new one if not provided (for backwards compatibility)
      const service = sheetsService || new SheetsService();
      const validationService = new SheetsValidationService(service);
      const summary = await validationService.getTasksSummary();
      res.type('text/plain').send(summary);
    } catch (error: any) {
      console.error('Error getting sheet summary:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });

  // Get all tasks
  router.get('/', async (req: Request, res: Response) => {
    try {
      const tasks = await tasksService.getAllTasks();
      res.json(tasks);
    } catch (error: any) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
    }
  });

  // Get single task
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const task = await tasksService.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error: any) {
      console.error('Error getting task:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch task' });
    }
  });

  // Create task
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { task, claimedBy, status } = req.body;
      
      if (!task) {
        return res.status(400).json({ error: 'Task name is required' });
      }

      const newTask = await tasksService.createTask({
        task,
        claimedBy: claimedBy || '',
        status: status || 'Not Started',
        createdDate: new Date().toISOString().split('T')[0],
      });
      
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: error.message || 'Failed to create task' });
    }
  });

  // Update task
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updatedTask = await tasksService.updateTask(req.params.id, updates);
      res.json(updatedTask);
    } catch (error: any) {
      console.error('Error updating task:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to update task' });
    }
  });

  // Delete task
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await tasksService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: error.message || 'Failed to delete task' });
    }
  });

  // Get task history
  router.get('/history/all', async (req: Request, res: Response) => {
    try {
      const history = await tasksService.getTaskHistory();
      res.json(history);
    } catch (error: any) {
      console.error('Error getting task history:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch task history' });
    }
  });

  return router;
}
