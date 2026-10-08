const { answerResearchQuestion } = require('../services/researchAssistantService');

/**
 * Handle AI Research Assistant question answering endpoint
 * @route POST /api/ai/research
 * @access Private
 */
const handleResearchQuery = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { query, limit, minSimilarity } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        message: 'Research question parameter "query" is required and cannot be empty.',
      });
    }

    const result = await answerResearchQuestion(query, userId, {
      limit: limit || 5,
      minSimilarity,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Research Assistant API Error:', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Error executing AI research assistant synthesis',
    });
  }
};

module.exports = {
  handleResearchQuery,
};
