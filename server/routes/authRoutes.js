// In server/routes/authRoutes.js
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  (req, res) => {
    console.log('Google callback req.user:', req.user);
    const { user, token } = req.user; // Matches passport.js done(null, { user, token })
    const action = req.query.state || 'login';
    const redirectUrl = action === 'signup' 
      ? `${process.env.FRONTEND_URL}/dashboard?token=${token}&newUser=true`
      : `${process.env.FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

export default router;