import { Sequelize as SequelizeType, Model, DataTypes } from 'sequelize';
import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const basename = _basename(__filename);

interface DbInterface {
  sequelize: SequelizeType;
  Sequelize: typeof SequelizeType;
  [key: string]: any;
}

const db: DbInterface = {
  sequelize: new SequelizeType(
    process.env.DB_NAME || 'database',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: false, // Set to console.log to see SQL queries
    }
  ),
  Sequelize: SequelizeType
};

// First, load all models
const modelFiles = readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
      file !== 'index.ts' &&
      file !== 'index.js'
    );
  });

// Import and initialize models
for (const file of modelFiles) {
  const model = require(join(__dirname, file)).default(db.sequelize, DataTypes);
  db[model.name] = model;
}

// Then, set up associations after all models are loaded
Object.keys(db).forEach(modelName => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

// Export the db object
export const sequelize = db.sequelize;
export const Sequelize = db.Sequelize;
export default db;