const express = require('express');
const router = express.Router();
const { handleSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

// Search endpoint supporting both POST and GET
router.route('/')
  .post(protect, handleSearch)
  .get(protect, handleSearch);

module.exports = router;
