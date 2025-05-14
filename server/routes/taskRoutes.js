import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getAnswersFromPDF,
  getAvailableTaskNumbers 
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { taskValidator } from '../middleware/validators.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(upload.single('pdf'), taskValidator, createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.get('/:taskId/answers', getAnswersFromPDF);
router.get('/available-task-numbers', getAvailableTaskNumbers);

export default router;