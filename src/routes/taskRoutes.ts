import express, { Router } from 'express';
import TaskAssignmentController from '../controllers/task/TaskAssignmentController';
import taskAuditController from '../controllers/task/taskAuditController';
import TaskManagementController from '../controllers/task/TaskManagementController';

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated task ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           description: Task status
 *         assignedUserId:
 *           type: integer
 *           description: Assigned user ID
 *         parentTaskId:
 *           type: integer
 *           description: Parent task ID for subtasks
 */

const router: Router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', TaskManagementController.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter tasks by status
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', TaskManagementController.getAllTasks);

/**
 * @swagger
 * /api/tasks/unassigned:
 *   get:
 *     summary: Get unassigned tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of unassigned tasks
 */
router.get('/unassigned', TaskAssignmentController.getUnassignedTasks);

/**
 * @swagger
 * /api/tasks/user/{id}/history:
 *   get:
 *     summary: Get user's task history
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's task history
 */
router.get('/user/:id/history', taskAuditController.getUserTasks);

/**
 * @swagger
 * /api/tasks/{taskId}/with-subtasks:
 *   get:
 *     summary: Get task with its subtasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task with subtasks
 *       404:
 *         description: Task not found
 */
router.get('/:taskId/with-subtasks', TaskManagementController.getTaskWithSubtasks);

/**
 * @swagger
 * /api/tasks/{taskId}/assign/{userId}:
 *   patch:
 *     summary: Assign task to user
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task assigned successfully
 */
router.patch('/:taskId/assign/:userId', TaskAssignmentController.assignTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted successfully
 */
router.delete('/:id', TaskManagementController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/:id', TaskManagementController.updateTask);

export default router; 