// In server/routes/userRoutes.js
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/subjects', authMiddleware, async (req, res) => {
  try {
    const { subjectCode, subjectName } = req.body;
    if (!subjectCode || !subjectName) {
      return res.status(400).json({ message: 'Subject code and name are required' });
    }
    req.user.subjects.push({ subjectCode, subjectName });
    await req.user.save();
    res.json({ subjects: req.user.subjects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



export default router;