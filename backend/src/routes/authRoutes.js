const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected auth route
router.get('/me', protect, getCurrentUser);

module.exports = router;
