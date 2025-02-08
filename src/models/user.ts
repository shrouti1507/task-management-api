import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {
  // Add any instance methods here if needed
}

interface UserModel extends ModelStatic<UserInstance> {
  associate?: (models: any) => void;
}

export default (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    timestamps: true,
    modelName: 'User',
    tableName: 'users',
  }) as UserModel;

  User.associate = (models: any) => {
    User.hasMany(models.Task, {
      foreignKey: 'assignedUserId',
      as: 'assignedTasks'
    });
  };

  return User;
};