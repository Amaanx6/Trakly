import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getAnswersFromPDF 
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { taskValidator } from '../middleware/validators.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all tasks & Create new task
router.route('/')
  .get(getTasks)
  .post(taskValidator, upload.single('pdf'), createTask);

// Update & Delete task
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

// Get answers from PDF
router.get('/:taskId/answers', getAnswersFromPDF);

export default router;