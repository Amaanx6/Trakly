import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'The user no longer exists' });
      }

      // Set user in request
      req.user = { id: user._id };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};