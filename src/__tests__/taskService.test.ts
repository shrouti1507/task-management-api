// First, setup the mock before any imports
const mockFindByPk = jest.fn();
const mockFindAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();
const mockUserFindByPk = jest.fn();
const mockTransaction = jest.fn().mockImplementation(() => ({
  commit: jest.fn().mockResolvedValue(null),
  rollback: jest.fn().mockResolvedValue(null),
  LOCK: { UPDATE: 'UPDATE' }
}));

// Mock the models module
jest.mock('../models', () => ({
  __esModule: true,
  default: {
    Task: {
      findAll: mockFindAll,
      findByPk: mockFindByPk,
      create: mockCreate,
      update: mockUpdate,
      destroy: mockDestroy,
    },
    User: {
      findByPk: mockUserFindByPk,
    },
    sequelize: {
      transaction: mockTransaction
    }
  },
  Task: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    create: mockCreate,
    update: mockUpdate,
    destroy: mockDestroy,
  },
  User: {
    findByPk: mockUserFindByPk,
  }
}));

// Then import the modules
import taskService from '../services/taskService';
import db from '../models';

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTaskData', () => {
    it('should return invalid when title is missing', async () => {
      const result = await taskService.validateTaskData({ title: '', description: 'Test' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title and description are required fields');
    });

    it('should return invalid when description is missing', async () => {
      const result = await taskService.validateTaskData({ title: 'Test', description: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title and description are required fields');
    });

    it('should return invalid when parent task not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      const result = await taskService.validateTaskData({
        title: 'Test',
        description: 'Test',
        parentTaskId: 1
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Parent task not found');
    });

    it('should return valid for complete task data', async () => {
      const result = await taskService.validateTaskData({
        title: 'Test',
        description: 'Test'
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('checkCircularDependency', () => {
    it('should detect circular dependency', async () => {
      mockFindByPk
        .mockResolvedValueOnce({ parentTaskId: 2 })
        .mockResolvedValueOnce({ parentTaskId: 1 });

      const result = await taskService.checkCircularDependency(1);
      expect(result).toBe(true);
    });

    it('should return false when no circular dependency', async () => {
      mockFindByPk
        .mockResolvedValueOnce({ parentTaskId: 2 })
        .mockResolvedValueOnce({ parentTaskId: null });

      const result = await taskService.checkCircularDependency(1);
      expect(result).toBe(false);
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };
      const mockCreatedTask = { id: 1, ...taskData };
      mockCreate.mockResolvedValue(mockCreatedTask);

      const result = await taskService.createTask(taskData);
      expect(result).toEqual(mockCreatedTask);
      expect(mockTransaction).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith({
        ...taskData,
        status: 'pending',
        assignedUserId: null,
        parentTaskId: null
      }, expect.any(Object));
    });

    it('should throw error on circular dependency', async () => {
      mockFindByPk.mockResolvedValue({ parentTaskId: 1 });
      
      await expect(taskService.createTask({
        title: 'Test',
        description: 'Test',
        parentTaskId: 1
      })).rejects.toThrow('Circular dependency detected in task hierarchy');
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [{ id: 1 }, { id: 2 }];
      mockFindAll.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();
      expect(result).toEqual(mockTasks);
    });

    it('should apply status filter', async () => {
      await taskService.getAllTasks({ status: 'pending' });
      expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'pending' }
      }));
    });
  });

  describe('getTaskWithSubtasks', () => {
    it('should return task with subtasks', async () => {
      const mockTask = {
        id: 1,
        subtasks: [{ id: 2 }]
      };
      mockFindByPk.mockResolvedValue(mockTask);

      const result = await taskService.getTaskWithSubtasks(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getUnassignedTasks', () => {
    it('should return unassigned tasks', async () => {
      const mockTasks = [{ id: 1, assignedUserId: null }];
      mockFindAll.mockResolvedValue(mockTasks);

      const result = await taskService.getUnassignedTasks();
      expect(result).toEqual(mockTasks);
      expect(mockFindAll).toHaveBeenCalledWith({
        where: { assignedUserId: null },
        include: expect.any(Object)
      });
    });
  });

  describe('getAssignedTasksForUserId', () => {
    it('should return tasks assigned to user', async () => {
      const mockUser = { id: 1 };
      const mockTasks = [{ id: 1, assignedUserId: 1 }];
      mockUserFindByPk.mockResolvedValue(mockUser);
      mockFindAll.mockResolvedValue(mockTasks);

      const result = await taskService.getAssignedTasksForUserId(1);
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when user not found', async () => {
      mockUserFindByPk.mockResolvedValue(null);

      await expect(taskService.getAssignedTasksForUserId(999))
        .rejects.toThrow('User not found');
    });
  });

  describe('assignTask', () => {
    it('should assign task to user', async () => {
      const mockTask = { 
        id: 1, 
        destroy: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue({ id: 1, assignedUserId: 1 })
      };
      const mockUser = { id: 1 };

      mockFindByPk.mockResolvedValue(mockTask);
      mockUserFindByPk.mockResolvedValue(mockUser);

      await taskService.assignTask(1, 1);
      expect(mockTask.update).toHaveBeenCalledWith(
        { assignedUserId: 1 },
        expect.any(Object)
      );
    });

    it('should throw error when user not found', async () => {
      const mockTask = { 
        id: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };
      mockFindByPk.mockResolvedValue(mockTask);
      mockUserFindByPk.mockResolvedValue(null);

      await expect(taskService.assignTask(1, 999))
        .rejects.toThrow('User not found');
    });
  });

  // describe('processPendingTasks', () => {
  //   it('should process pending tasks', async () => {
  //     const mockTasks = [{
  //       id: 1,
  //       title: 'Task 1',
  //       description: 'Desc 1',
  //       assignedUserId: 1,
  //       update: jest.fn()
  //     }];
  //     mockFindAll.mockResolvedValue(mockTasks);

  //     const result = await taskService.processPendingTasks();
  //     expect(result).toEqual({ message: '1 tasks queued for processing' });
  //   });
  // });

  describe('deleteTask', () => {
    it('should delete task and its subtasks', async () => {
      const mockTask = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      mockFindByPk.mockResolvedValue(mockTask);

      await taskService.deleteTask(1);
      
      expect(mockDestroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentTaskId: 1 },
          transaction: expect.any(Object)
        })
      );
      expect(mockTask.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.any(Object)
        })
      );
    });

    it('should throw error when task not found', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(taskService.deleteTask(999))
        .rejects.toThrow('Task not found');
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const mockTask = { 
        id: 1,
        version: 0,
        title: 'Original Title'
      };
      
      const mockUpdatedTask = {
        id: 1,
        version: 1,
        title: 'Updated Title'
      };
  
      mockFindByPk
        .mockResolvedValueOnce(mockTask)  // First call returns original task
        .mockResolvedValueOnce(mockUpdatedTask);  // Second call returns updated task
      
      mockUpdate.mockResolvedValue([1, [mockUpdatedTask]]); // Fix: Return proper update result format
  
      const result = await taskService.updateTask(1, { title: 'Updated Title' });
      
      expect(mockUpdate).toHaveBeenCalledWith(
        { 
          title: 'Updated Title',
          version: 1
        },
        {
          transaction: {
            LOCK: {
              UPDATE: "UPDATE"
            },
            commit: expect.any(Function),
            rollback: expect.any(Function)
          },
          where: { 
            id: 1,
            version: 0
          }
        }
      );
      expect(result).toEqual(mockUpdatedTask);
    });
  
    it('should throw error when task was modified by another user', async () => {
      const mockTask = { 
        id: 1,
        version: 0
      };
      
      mockFindByPk.mockResolvedValueOnce(mockTask);
      mockUpdate.mockResolvedValue([0, []]); // Fix: Return proper format for no updates
      
      await expect(taskService.updateTask(1, { title: 'Updated' }))
        .rejects.toThrow('Task was modified by another user');
    });
  });
});