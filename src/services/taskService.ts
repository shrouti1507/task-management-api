import { Transaction, Sequelize } from 'sequelize';
import db from '../models';
import { TaskInstance } from '../models/task';
import { TaskAudit } from '../models/taskAudit';
const { Task, User } = db;

interface TaskData {
  title: string;
  description: string;
  status?: string;
  assignedUserId?: number | null;
  parentTaskId?: number | null;
  priority?: string;
}

interface TaskFilter {
  id?: number;
  status?: string;
  priority?: string;
  assignedTo?: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface TaskVersionData {
  [version: number]: {
    title: string;
    description?: string;
    status: string;
    assignedUserId?: number;
    parentTaskId?: number | null;
    priority?: string;
    updatedAt: Date;
  }
}

interface TaskVersionHistory {
  [key: string]: {
    [version: number]: {
      title: string;
      description?: string;
      status: string;
      assignedUserId?: number | null;
      parentTaskId?: number | null;
      priority?: string;
      updatedAt?: Date;
      subtasks?: TaskInstance[];
    }
  }
}

class TaskService {
  async validateTaskData(taskData: TaskData): Promise<ValidationResult> {
    if (!taskData.title || !taskData.description) {
      return {
        isValid: false,
        error: 'Title and description are required fields'
      };
    }

    if (taskData.parentTaskId) {
      const parentTask = await Task.findByPk(taskData.parentTaskId);
      if (!parentTask) {
        return {
          isValid: false,
          error: 'Parent task not found'
        };
      }
    }

    return { isValid: true };
  }

  async checkCircularDependency(parentTaskId: number, visitedTasks: Set<number> = new Set()): Promise<boolean> {
    if (visitedTasks.has(parentTaskId)) {
      return true; // Circular dependency detected
    }

    visitedTasks.add(parentTaskId);
    const parentTask = await Task.findByPk(parentTaskId);
    
    if (!parentTask || !parentTask.parentTaskId) {
      return false;
    }

    return this.checkCircularDependency(parentTask.parentTaskId, visitedTasks);
  }

  async createTask(taskData: TaskData) {
    const transaction: Transaction = await db.sequelize.transaction();
    try {
      // Check for circular dependency if parentTaskId is provided
      if (taskData.parentTaskId) {
        const hasCircularDependency = await this.checkCircularDependency(taskData.parentTaskId);
        if (hasCircularDependency) {
          throw new Error('Circular dependency detected in task hierarchy');
        }
      }

      const task = await Task.create({
        ...taskData,
        status: taskData.status || 'pending',
        assignedUserId: taskData.assignedUserId || null,
        parentTaskId: taskData.parentTaskId || null
      }, { transaction });

      await transaction.commit();
      return task;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAllTasks(filter?: TaskFilter) {
    try {
      const where: any = {};
      if (filter?.status) {
        where.status = filter.status;
      }

      return await Task.findAll({
        where,
        include: [
          {
            model: User,
            as: 'assignedUser',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Task,
            as: 'parentTask'
          },
          {
            model: Task,
            as: 'subtasks'
          }
        ]
      });
    } catch (error) {
      throw error;
    }
  }

  async getTaskWithSubtasks(taskId: number) {
    return await Task.findByPk(taskId, {
      include: [
        {
          model: Task,
          as: 'subtasks',
          include: [{
            model: User,
            as: 'User',
            attributes: ['id', 'name', 'email'],
          }]
        },
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'email'],
        }
      ]
    });
  }

  async getUnassignedTasks() {
    return await Task.findAll({
      where: { assignedUserId: null },
      include: {
        model: User,
        as: 'assignedUser',
        attributes: ['id', 'name', 'email'],
      },
    });
  }

  async getAssignedTasksForUserId(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await Task.findAll({
      where: { 
        assignedUserId: userId 
      },
      include: {
        model: User,
        as: 'assignedUser',  
        attributes: ['id', 'name', 'email'],
      },
    });
  }

  // Example improvement for task assignment
  async assignTask(taskId: number, userId: number) {
    const transaction = await db.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE // Highest isolation level
    });
    
    try {
      const task = await Task.findByPk(taskId, { 
        lock: transaction.LOCK.UPDATE,  // Pessimistic locking
        transaction 
      });

      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('User not found');
      }
      
      // Perform assignment
      await task.update({ assignedUserId: userId }, { transaction });
      
      await transaction.commit();
      return task;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteTask(taskId: number) {
    const transaction: Transaction = await db.sequelize.transaction();
    try {
      // Find the task and its subtasks in a single query for efficiency
      const task = await Task.findByPk(taskId, { 
        include: [{ model: Task, as: 'subtasks' }],
        transaction 
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Optional: Add business rule validations
      // For example: check if task is in a deletable state
      if (task.status === 'urgent') {
        throw new Error('Cannot delete a task that is urgent');
      }

      // Delete all subtasks first
      if (task.subtasks?.length > 0) {
        await Task.destroy({
          where: { parentTaskId: taskId },
          transaction
        });
      }

      // Delete the main task
      await task.destroy({ transaction });
      await transaction.commit();

      // Return a success response instead of trying to fetch deleted task
      return {
        success: true,
        message: 'Task and its subtasks were successfully deleted',
        deletedTaskId: taskId
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // In update operations
  async updateTask(taskId: number, data: Partial<TaskData>) {
    const transaction = await db.sequelize.transaction();
    try {
      const task = await Task.findByPk(taskId, { 
        transaction,
        lock: transaction.LOCK.UPDATE 
      });
      
      if (!task) {
        await transaction.rollback();
        throw new Error('Task not found');
      }
      
      const currentVersion = task.version;
      
      const [updatedRows] = await Task.update(
        { 
          ...data,
          version: currentVersion + 1 
        },
        { 
          where: { 
            id: taskId,
            version: currentVersion  // Optimistic locking check
          },
          transaction
        }
      );

      if (updatedRows === 0) {
        await transaction.rollback();
        throw new Error('Task was modified by another user');
      }

      await transaction.commit();
      
      // Fetch and return the updated record with its history
      const updatedTask = await Task.findByPk(taskId);
      return updatedTask;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserTasksWithHistory(userId: number) {
    const transaction = await db.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
    });

    try {
      // First get all tasks assigned to user
      const tasks = await Task.findAll({
        where: {
          assignedUserId: userId
        },
        include: [{
          model: Task,
          as: 'subtasks',
          required: false
        }],
        transaction
      });

      // Get task history from audit table
      const taskIds = tasks.map((task: TaskInstance) => task.id);
      const taskHistory = await TaskAudit.findAll({
        where: {
          taskId: taskIds
        },
        order: [['taskId', 'ASC'], ['version', 'ASC']], // Ensure proper ordering
        transaction
      });

      // Organize data by taskId and version
      const taskVersions: TaskVersionHistory = {};

      // Add all historical versions from audit table
      taskHistory.forEach((history: TaskAudit) => {
        if (!taskVersions[history.taskId.toString()]) {
          taskVersions[history.taskId.toString()] = {};
        }
        taskVersions[history.taskId.toString()][history.version] = {
          title: history.title,
          description: history.description,
          status: history.status,
          assignedUserId: history.assignedUserId,
          updatedAt: history.updatedAt
        };
      });

      // Add current versions if they're newer than what's in history
      tasks.forEach((task: TaskInstance) => {
        if (task.id) {
          const taskId = task.id.toString();
          if (!taskVersions[taskId] || !taskVersions[taskId][task.version]) {
            if (!taskVersions[taskId]) {
              taskVersions[taskId] = {};
            }
            taskVersions[taskId][task.version] = {
              title: task.title,
              description: task.description,
              status: task.status,
              assignedUserId: task.assignedUserId,
              updatedAt: task.updatedAt,
              subtasks: task.subtasks
            };
          }
        }
      });

      await transaction.commit();

      return {
        data: taskVersions,
        metadata: {
          fetchTimestamp: new Date(),
          userId
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new TaskService(); 