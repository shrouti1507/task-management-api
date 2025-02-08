import { Request, Response } from 'express';
import taskService from '../../services/taskService';

export class TaskManagementController {
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = await taskService.validateTaskData(req.body);
      if (!validationResult.isValid) {
        res.status(400).json({ error: validationResult.error });
        return;
      }

      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query.status ? { status: req.query.status as string } : {};
      const tasks = await taskService.getAllTasks(filter);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  async getTaskWithSubtasks(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const task = await taskService.getTaskWithSubtasks(taskId);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      await taskService.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      const task = await taskService.updateTask(taskId, req.body);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 

export default new TaskManagementController();