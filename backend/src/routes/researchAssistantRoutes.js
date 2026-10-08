const express = require('express');
const router = express.Router();
const { handleResearchQuery } = require('../controllers/researchAssistantController');
const { protect } = require('../middleware/authMiddleware');

// Protected RAG research endpoint
router.post('/research', protect, handleResearchQuery);

module.exports = router;
