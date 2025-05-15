import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, college, year, branch } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, password, college, year, branch });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.VITE_JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        college: user.college, 
        year: user.year, 
        branch: user.branch 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.VITE_JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        college: user.college, 
        year: user.year, 
        branch: user.branch 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({ 
      id: user._id, 
      email: user.email, 
      name: user.name, 
      college: user.college, 
      year: user.year, 
      branch: user.branch,
      subjects: user.subjects 
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

router.put(
  '/update-profile',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name must be 50 characters or less'),
    body('college').trim().notEmpty().withMessage('College is required').isLength({ max: 100 }).withMessage('College must be 100 characters or less'),
    body('year').notEmpty().withMessage('Year is required').isIn(['1', '2', '3', '4', '5']).withMessage('Year must be between 1 and 5'),
    body('branch').trim().notEmpty().withMessage('Branch is required').isLength({ max: 50 }).withMessage('Branch must be 50 characters or less'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, college, year, branch } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name;
      user.college = college;
      user.year = year;
      user.branch = branch;

      await user.save();

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        college: user.college,
        year: user.year,
        branch: user.branch,
        subjects: user.subjects,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

router.get('/google', (req, res, next) => {
  const { action } = req.query; // 'login' or 'signup'
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: action || 'login' // Pass action as state
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.VITE_FRONTEND_URL}/login`
  }),
  (req, res) => {
    console.log('Google callback req.user:', req.user);
    const { user, token } = req.user; // Matches passport.js done(null, { user, token })
    const action = req.query.state || 'login';
    const redirectUrl = action === 'signup' 
      ? `${process.env.VITE_FRONTEND_URL}/dashboard?token=${token}&newUser=true`
      : `${process.env.VITE_FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

export default router;