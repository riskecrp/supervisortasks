import { Router, Request, Response } from 'express';
import { DiscussionsService } from '../services/discussions.service';

export function createDiscussionsRouter(discussionsService: DiscussionsService): Router {
  const router = Router();

  // Get all discussions
  router.get('/', async (req: Request, res: Response) => {
    try {
      const discussions = await discussionsService.getAllDiscussions();
      res.json(discussions);
    } catch (error: any) {
      console.error('Error getting discussions:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch discussions' });
    }
  });

  // Get single discussion
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const discussion = await discussionsService.getDiscussion(req.params.id);
      if (!discussion) {
        return res.status(404).json({ error: 'Discussion not found' });
      }
      res.json(discussion);
    } catch (error: any) {
      console.error('Error getting discussion:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch discussion' });
    }
  });

  // Create discussion
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { datePosted, topic, link } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const newDiscussion = await discussionsService.createDiscussion({
        datePosted: datePosted || new Date().toISOString().split('T')[0],
        topic,
        link: link || '',
        supervisorFeedback: {},
      });
      
      res.status(201).json(newDiscussion);
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      res.status(500).json({ error: error.message || 'Failed to create discussion' });
    }
  });

  // Update discussion feedback
  router.put('/:id/feedback', async (req: Request, res: Response) => {
    try {
      const { supervisorName, completed } = req.body;
      
      if (!supervisorName) {
        return res.status(400).json({ error: 'Supervisor name is required' });
      }

      const updatedDiscussion = await discussionsService.updateDiscussionFeedback(
        req.params.id,
        supervisorName,
        completed === true
      );
      
      res.json(updatedDiscussion);
    } catch (error: any) {
      console.error('Error updating discussion feedback:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to update discussion feedback' });
    }
  });

  // Delete discussion
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await discussionsService.deleteDiscussion(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      res.status(500).json({ error: error.message || 'Failed to delete discussion' });
    }
  });

  return router;
}
