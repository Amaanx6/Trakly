import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'The user no longer exists' });
      }
      req.user = { id: user._id };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error in auth middleware', error: err.message });
  }
};