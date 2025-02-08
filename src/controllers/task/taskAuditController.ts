import { Request, Response } from 'express';
import taskService from '../../services/taskService';

class TaskAuditController {
  async getUserTasks(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const result = await taskService.getUserTasksWithHistory(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch task history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new TaskAuditController(); 