const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentDocuments } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protected Dashboard API routes
router.get('/stats', protect, getDashboardStats);
router.get('/recent', protect, getRecentDocuments);

module.exports = router;
