import { Router, Request, Response } from 'express';
import { LOAService } from '../services/loa.service';
import { SheetAccessError } from '../services/sheets.service';

export function createLOARouter(loaService: LOAService): Router {
  const router = Router();
  const handleSheetError = (res: Response, error: any, fallbackMessage: string) => {
    if (error instanceof SheetAccessError) {
      return res.status(503).json({
        error: 'LOA data temporarily unavailable',
        details: error.message || '',
      });
    }
    return res.status(500).json({ error: error?.message || fallbackMessage });
  };

  // Get all LOA records
  router.get('/', async (req: Request, res: Response) => {
    try {
      const records = await loaService.getAllLOARecords();
      res.json(records);
    } catch (error: any) {
      console.error('Error getting LOA records:', error);
      handleSheetError(res, error, 'Failed to fetch LOA records');
    }
  });

  // Get active LOA records
  router.get('/active', async (req: Request, res: Response) => {
    try {
      const records = await loaService.getActiveLOA();
      res.json(records);
    } catch (error: any) {
      console.error('Error getting active LOA records:', error);
      handleSheetError(res, error, 'Failed to fetch active LOA records');
    }
  });

  // Get single LOA record
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const record = await loaService.getLOARecord(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'LOA record not found' });
      }
      res.json(record);
    } catch (error: any) {
      console.error('Error getting LOA record:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch LOA record' });
    }
  });

  // Create LOA record
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { supervisorName, startDate, endDate, reason, status } = req.body;
      
      if (!supervisorName || !startDate || !endDate) {
        return res.status(400).json({ error: 'Supervisor name, start date, and end date are required' });
      }

      const newRecord = await loaService.createLOARecord({
        supervisorName,
        startDate,
        endDate,
        reason: reason || '',
        status: status || 'Active',
      });
      
      res.status(201).json(newRecord);
    } catch (error: any) {
      console.error('Error creating LOA record:', error);
      res.status(500).json({ error: error.message || 'Failed to create LOA record' });
    }
  });

  // Update LOA record
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updatedRecord = await loaService.updateLOARecord(req.params.id, updates);
      res.json(updatedRecord);
    } catch (error: any) {
      console.error('Error updating LOA record:', error);
      if (error.message === 'LOA record not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to update LOA record' });
    }
  });

  // Delete LOA record
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await loaService.deleteLOARecord(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting LOA record:', error);
      res.status(500).json({ error: error.message || 'Failed to delete LOA record' });
    }
  });

  return router;
}
