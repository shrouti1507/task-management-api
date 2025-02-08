# Task Management API

A robust REST API for managing tasks, built with Node.js, Express, TypeScript, and PostgreSQL. This API provides a comprehensive solution for task management with features focused on scalability, reliability, and maintainability.

## Key Features

- **Task Management (CRUD Operations)**
  - Create, read, update, and delete tasks
  - Task status tracking
  - Task history logging

- **Advanced Task Organization**
  - Task hierarchy with parent-child relationships
  - Circular dependency prevention
  - Task assignment and reassignment capabilities

- **User Management**
  - User authentication and authorization
  - Task assignment to users
  - User-specific task views

- **Database & Caching**
  - PostgreSQL for reliable data storage
  - Transaction support for data integrity

- **API Documentation**
  - Interactive Swagger UI documentation
  - OpenAPI specification
  - Comprehensive endpoint documentation

## Technical Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Testing**: Jest with code coverage reporting
- **Documentation**: Swagger/OpenAPI
- **ORM**: Sequelize
- **Environment**: Docker support


## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Installation

1. Clone the repository:

bash
git clone https://github.com/yourusername/task-management-api.git
cd task-management-api

2. Install dependencies:

bash
npm install

3. Configure environment variables:

bash
# Copy example env file
cp .env.example .env

# Update .env with your configurations
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/taskdb
DB_NAME=taskdb
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

4. Run database migrations:

bash
npm run migrate

## Running the Application

Development mode:

bash
npm run dev

Production mode:

bash
npm run build
npm start

Run tests:

bash
npm test

## API Endpoints

### Task Management

#### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "parentTaskId": null  // optional
}
```

#### Get All Tasks

```http
GET /api/tasks
```

#### Get Task with Subtasks

```http
GET /api/tasks/:taskId/with-subtasks
```

#### Update Task

```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

#### Delete Task

```http
DELETE /api/tasks/:id
```

### Task Assignment

#### Assign Task

```http
PATCH /api/tasks/:taskId/assign/:userId
```

#### Get Unassigned Tasks

```http
GET /api/tasks/unassigned
```

#### Get User's Tasks

```http
GET /api/tasks/user/:id/history
```

### Response Examples

Success Response:

```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task Description",
  "status": "pending",
  "assignedUserId": null,
  "parentTaskId": null,
  "createdAt": "2024-01-22T07:00:45.992Z",
  "updatedAt": "2024-01-22T07:00:45.992Z"
}
```

Error Response:

```json
{
  "error": "Error message description"
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Development

Project Structure:

```
src/
├── controllers/
│   ├── task/
│   └── user/
├── services/
├── routes/
├── models/
├── config/
└── migrations/
```

## Testing

Run the test suite:

```bash
npm test
```

Generate coverage report:

```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## API Documentation

The API documentation is available via Swagger UI at:

```
http://localhost:3000/api-docs
```

This provides an interactive interface to:
- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- Download OpenAPI specification



