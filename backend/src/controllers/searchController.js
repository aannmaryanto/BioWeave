const { searchKnowledge } = require('../services/searchService');

/**
 * Handle knowledge search endpoint
 * @route POST /api/search
 * @route GET /api/search
 * @access Private
 */
const handleSearch = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let query = '';
    let limit = 5;
    let minSimilarity = 0.0;
    let type = 'All';

    if (req.method === 'POST') {
      query = req.body.query;
      limit = req.body.limit || 5;
      minSimilarity = req.body.minSimilarity || 0.0;
      type = req.body.type || 'All';
    } else {
      query = req.query.q || req.query.query || '';
      limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
      minSimilarity = req.query.minSimilarity ? parseFloat(req.query.minSimilarity) : 0.0;
      type = req.query.type || 'All';
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        message: 'Search query parameter is required and cannot be empty.',
      });
    }

    const searchResults = await searchKnowledge(query, userId, {
      limit,
      minSimilarity,
      type,
    });

    return res.status(200).json(searchResults);
  } catch (error) {
    console.error('Search API Error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Error processing knowledge search',
    });
  }
};

module.exports = {
  handleSearch,
};
