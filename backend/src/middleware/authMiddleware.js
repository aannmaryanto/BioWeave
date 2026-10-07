const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT in the Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }

      const secret = process.env.JWT_SECRET || 'bioweave_secret_fallback_key';
      const decoded = jwt.verify(token, secret);

      if (mongoose.connection.readyState === 1) {
        // Find user from MongoDB excluding password
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        // Fallback for in-memory user lookup when MongoDB is offline
        const { inMemoryUsers } = require('../controllers/authController');
        const memUser = inMemoryUsers.find((u) => u._id === decoded.id);
        if (memUser) {
          const { password, ...userWithoutPassword } = memUser;
          req.user = userWithoutPassword;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
