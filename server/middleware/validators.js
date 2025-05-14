import { body } from 'express-validator';

// User validation
export const signupValidator = [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

export const loginValidator = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').notEmpty(),
];

// Task validation
export const taskValidator = [
  body('type', 'Task type is required')
    .notEmpty()
    .isIn(['Assignment', 'Surprise Test'])
    .withMessage('Type must be Assignment or Surprise Test'),
  body('subjectCode', 'Subject code is required').notEmpty().trim(),
  body('taskNumber', 'Task number must be between 1 and 5')
    .isInt({ min: 1, max: 5 })
    .toInt(),
  body('deadline', 'Valid deadline is required').isISO8601().toDate(),
  body('semester', 'Semester is required').notEmpty().trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
];