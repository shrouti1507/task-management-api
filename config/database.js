require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'shroutigangopadhyay',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'taskdb',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432
  },
  test: {
    username: process.env.DB_USER || 'shroutigangopadhyay',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'taskdb_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 