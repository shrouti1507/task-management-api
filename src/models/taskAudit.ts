import { Model, DataTypes, Sequelize } from 'sequelize';

export class TaskAudit extends Model {
  public taskId!: number;
  public version!: number;
  public title!: string;
  public description?: string;
  public status!: string;
  public assignedUserId!: number;
  public updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  return TaskAudit.init(
    {
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'task_audits',
      timestamps: true
    }
  );
}; 