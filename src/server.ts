import app from './app';
import db from './models';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Extract to database/init.ts
const initializeDatabase = async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Unable to sync database:', error);
    throw error;
  }
};

// Extract to server/init.ts
const startServer = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to start server:', error);
    throw error;
  }
};

// Main initialization flow
const bootstrap = async () => {
  try {
    await initializeDatabase();
    await startServer();
  } catch (error) {
    process.exit(1);
  }
};

bootstrap(); 