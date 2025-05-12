import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);
    }

    // Check if token exists
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'The user no longer exists' });
      }

      // Set user in request
      req.user = { id: user._id };
      console.log('User authenticated:', user._id);
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error in auth middleware', error: err.message });
  }
};