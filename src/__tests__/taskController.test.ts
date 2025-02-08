import TaskAssignmentController from '../controllers/task/TaskAssignmentController';
// import TaskProcessingController from '../controllers/task/TaskProcessingController';
import TaskManagementController from '../controllers/task/TaskManagementController';
import taskService from '../services/taskService';
import { Request, Response } from 'express';

describe('TaskController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    mockReq = {
      body: {
        title: 'Test Task',
        description: 'Test Description'
      }
    };

    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as Partial<Response>;
  });

  it('should create task and return 201 status when task data is valid', async () => {
    const mockValidationResult = {
      isValid: true
    };

    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description'
    };

    jest.spyOn(taskService, 'validateTaskData').mockResolvedValue(mockValidationResult);
    jest.spyOn(taskService, 'createTask').mockResolvedValue(mockTask);

    await TaskManagementController.createTask(mockReq as Request, mockRes as Response);

    expect(taskService.validateTaskData).toHaveBeenCalledWith(mockReq.body);
    expect(taskService.createTask).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockTask);
  });

  // You can add more test cases for error scenarios
  it('should return 400 status when validation fails', async () => {
    const mockValidationResult = {
      isValid: false,
      error: 'Invalid task data'
    };

    jest.spyOn(taskService, 'validateTaskData').mockResolvedValue(mockValidationResult);

    await TaskManagementController.createTask(mockReq as Request, mockRes as Response);

    expect(taskService.validateTaskData).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: mockValidationResult.error });
  });

  it('should return 400 status when an error occurs', async () => {
    jest.spyOn(taskService, 'validateTaskData').mockRejectedValue(new Error('Failed to validate task data'));

    await TaskManagementController.createTask(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to validate task data' });
  });

  describe('getAllTasks', () => {
    beforeEach(() => {
      mockReq = {
        query: {}
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return all tasks with 200 status when no filter is provided', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'PENDING' },
        { id: 2, title: 'Task 2', status: 'COMPLETED' }
      ];

      jest.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);

      await TaskManagementController.getAllTasks(mockReq as Request, mockRes as Response);

      expect(taskService.getAllTasks).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return filtered tasks when status filter is provided', async () => {
      mockReq.query = { status: 'PENDING' };
      
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'PENDING' }
      ];

      jest.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);

      await TaskManagementController.getAllTasks(mockReq as Request, mockRes as Response);

      expect(taskService.getAllTasks).toHaveBeenCalledWith({ status: 'PENDING' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 500 status when service throws error', async () => {
      const errorMessage = 'Database error';
      jest.spyOn(taskService, 'getAllTasks').mockRejectedValue(new Error(errorMessage));
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error in tests

      await TaskManagementController.getAllTasks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get tasks' });
    });
  });


  describe('getTaskWithSubtasks', () => {
    beforeEach(() => {
      mockReq = {
        params: { taskId: '1' }
      } as Partial<Request>;
    });

    it('should return task with subtasks and 200 status', async () => {
      const mockTask = {
        id: 1,
        title: 'Parent Task',
        subtasks: [{ id: 2, title: 'Subtask' }]
      };
      jest.spyOn(taskService, 'getTaskWithSubtasks').mockResolvedValue(mockTask);

      await TaskManagementController.getTaskWithSubtasks(mockReq as Request, mockRes as Response);

      expect(taskService.getTaskWithSubtasks).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 when task not found', async () => {
      jest.spyOn(taskService, 'getTaskWithSubtasks').mockResolvedValue(null);

      await TaskManagementController.getTaskWithSubtasks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 500 when service throws error', async () => {
      const errorMessage = 'Database error';
      jest.spyOn(taskService, 'getTaskWithSubtasks').mockRejectedValue(new Error(errorMessage));

      await TaskManagementController.getTaskWithSubtasks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getUnassignedTasks', () => {
    it('should return unassigned tasks with 200 status', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', assignedTo: null },
        { id: 2, title: 'Task 2', assignedTo: null }
      ];
      jest.spyOn(taskService, 'getUnassignedTasks').mockResolvedValue(mockTasks);

      await TaskAssignmentController.getUnassignedTasks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 500 when service throws error', async () => {
      const errorMessage = 'Failed to fetch unassigned tasks';
      jest.spyOn(taskService, 'getUnassignedTasks').mockRejectedValue(new Error(errorMessage));

      await TaskAssignmentController.getUnassignedTasks(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('assignTask', () => {
    beforeEach(() => {
      mockReq = {
        params: { 
          taskId: '1',
          userId: '2'
        }
      } as Partial<Request>;
    });

    it('should assign task and return 200 status', async () => {
      const mockTask = { id: 1, title: 'Task 1', assignedTo: 2 };
      jest.spyOn(taskService, 'assignTask').mockResolvedValue(mockTask);

      await TaskAssignmentController.assignTask(mockReq as Request, mockRes as Response);

      expect(taskService.assignTask).toHaveBeenCalledWith(1, 2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTask);
    });

    it('should return 500 when service throws error', async () => {
      const errorMessage = 'Failed to assign task';
      jest.spyOn(taskService, 'assignTask').mockRejectedValue(new Error(errorMessage));

      await TaskAssignmentController.assignTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' }
      } as Partial<Request>;
    });

    it('should delete task and return 204 status', async () => {
      jest.spyOn(taskService, 'deleteTask').mockResolvedValue({
        success: true,
        message: 'Task and its subtasks were successfully deleted',
        deletedTaskId: 1
      });

      await TaskManagementController.deleteTask(mockReq as Request, mockRes as Response);

      expect(taskService.deleteTask).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 500 when deletion fails', async () => {
      const errorMessage = 'Failed to delete task';
      jest.spyOn(taskService, 'deleteTask').mockRejectedValue(new Error(errorMessage));

      await TaskManagementController.deleteTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: '1' },
        body: { title: 'Updated Task' }
      } as Partial<Request>;
    });

    it('should update task and return 200 status', async () => {
      const mockUpdatedTask = { id: 1, title: 'Updated Task' };
      jest.spyOn(taskService, 'updateTask').mockResolvedValue(mockUpdatedTask);

      await TaskManagementController.updateTask(mockReq as Request, mockRes as Response);

      expect(taskService.updateTask).toHaveBeenCalledWith(1, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedTask);
    });

    it('should return 500 when update fails', async () => {
      const errorMessage = 'Failed to update task';
      jest.spyOn(taskService, 'updateTask').mockRejectedValue(new Error(errorMessage));

      await TaskManagementController.updateTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
}); 