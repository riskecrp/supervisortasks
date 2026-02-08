import { Router, Request, Response } from 'express';
import { SupervisorsService } from '../services/supervisors.service';

export function createSupervisorsRouter(supervisorsService: SupervisorsService): Router {
  const router = Router();

  // Get all supervisors
  router.get('/', async (req: Request, res: Response) => {
    try {
      const supervisors = await supervisorsService.getAllSupervisors();
      res.json(supervisors);
    } catch (error: any) {
      console.error('Error getting supervisors:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch supervisors' });
    }
  });

  // Add supervisor
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name, rank } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Supervisor name is required' });
      }

      const newSupervisor = await supervisorsService.addSupervisor(name, rank);
      res.status(201).json(newSupervisor);
    } catch (error: any) {
      console.error('Error adding supervisor:', error);
      if (error.message === 'Supervisor already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to add supervisor' });
    }
  });

  // Remove supervisor
  router.delete('/:name', async (req: Request, res: Response) => {
    try {
      await supervisorsService.removeSupervisor(req.params.name);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing supervisor:', error);
      if (error.message === 'Supervisor not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to remove supervisor' });
    }
  });

  return router;
}
