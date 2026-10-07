const dashboardService = require('../services/dashboardService');

/**
 * Get dashboard statistics for the authenticated user
 * @route GET /api/dashboard/stats
 * @access Private
 */
const getDashboardStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const data = await dashboardService.fetchUserStats(req.user);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Unable to load dashboard stats', error: error.message });
  }
};

/**
 * Get recent documents for the authenticated user
 * @route GET /api/dashboard/recent
 * @access Private
 */
const getRecentDocuments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const data = await dashboardService.fetchRecentDocuments(req.user);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get Recent Documents Error:', error);
    return res.status(500).json({ message: 'Unable to load recent documents', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentDocuments,
};
