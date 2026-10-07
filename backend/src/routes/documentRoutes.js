const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  getDocumentFile,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const handleUpload = require('../middleware/uploadMiddleware');

// All document management routes are protected
router.route('/')
  .get(protect, getDocuments)
  .post(protect, createDocument);

// File upload endpoint
router.post('/upload', protect, handleUpload, uploadDocument);

// File download / view endpoint
router.get('/:id/file', protect, getDocumentFile);

// Document CRUD by ID
router.route('/:id')
  .get(protect, getDocumentById)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

module.exports = router;
