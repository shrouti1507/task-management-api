import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { UserInstance } from './user';
import { TaskAudit } from './taskAudit';

export interface TaskAttributes {
  id?: number;
  title: string;
  description: string;
  status: string;
  assignedUserId?: number | null;
  parentTaskId?: number | null;
  priority?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version: number;
}

export interface TaskInstance extends Model<TaskAttributes>, TaskAttributes {
  User?: UserInstance;
  parentTask?: TaskInstance;
  subtasks?: TaskInstance[];
}

interface TaskModel extends ModelStatic<TaskInstance> {
  associate?: (models: any) => void;
}

export default (sequelize: Sequelize) => {
  const Task = sequelize.define<TaskInstance>('Task', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    assignedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    parentTaskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    timestamps: true,
    modelName: 'Task',
    tableName: 'tasks',
  }) as TaskModel;

  Task.associate = (models: any) => {
    Task.belongsTo(models.User, { 
      foreignKey: 'assignedUserId',
      as: 'assignedUser'
    });
    Task.belongsTo(models.Task, { 
      foreignKey: 'parentTaskId',
      as: 'parentTask'
    });
    Task.hasMany(models.Task, { 
      foreignKey: 'parentTaskId',
      as: 'subtasks'
    });
    Task.hasMany(models.TaskAudit, {
      foreignKey: 'taskId',
      as: 'history'
    });
  };

  Task.addHook('afterCreate', async (task: TaskInstance, options) => {
    await TaskAudit.create({
      taskId: task.id,
      version: 1,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedUserId: task.assignedUserId,
      updatedAt: task.updatedAt
    }, {
      transaction: options.transaction
    });
  });

  Task.addHook('beforeUpdate', async (task: TaskInstance) => {
    task.version = (task.version || 1) + 1;
  });

  Task.addHook('afterUpdate', async (task: TaskInstance, options) => {
    await TaskAudit.create({
      taskId: task.id,
      version: task.version,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedUserId: task.assignedUserId,
      updatedAt: task.updatedAt
    }, {
      transaction: options.transaction
    });
  });

  return Task;
};