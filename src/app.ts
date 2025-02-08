import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './config/swagger';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import bodyParser from 'body-parser';

const app: Express = express();

app.use(bodyParser.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

export default app; 