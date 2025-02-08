import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A REST API for managing tasks',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'] // files containing annotations
};

export const swaggerSpecs = swaggerJsdoc(options); 