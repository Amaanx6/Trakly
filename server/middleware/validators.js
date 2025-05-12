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
  body('title', 'Title is required').notEmpty().trim(),
  body('deadline', 'Valid deadline is required').isISO8601().toDate(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];