import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { taskValidator } from '../middleware/validators.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all tasks & Create new task
router.route('/')
  .get(getTasks)
  .post(taskValidator, createTask);

// Update & Delete task
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;