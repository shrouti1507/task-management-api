import { Request, Response } from 'express';
import taskService from '../../services/taskService';

export class TaskAssignmentController {
  async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const userId = parseInt(req.params.userId, 10);
      const task = await taskService.assignTask(taskId, userId);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getUnassignedTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await taskService.getUnassignedTasks();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 

export default new TaskAssignmentController();