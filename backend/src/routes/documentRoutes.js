const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  processDocumentHandler,
  getExtractedTextHandler,
  getDocumentFile,
  updateDocument,
  deleteDocument,
  indexDocumentHandler,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const handleUpload = require('../middleware/uploadMiddleware');

// All document management routes are protected
router.route('/')
  .get(protect, getDocuments)
  .post(protect, createDocument);

// File upload endpoint
router.post('/upload', protect, handleUpload, uploadDocument);

// Document processing endpoint
router.post('/:id/process', protect, processDocumentHandler);

// Document vector indexing endpoint
router.post('/:id/index', protect, indexDocumentHandler);

// Extracted text retrieval endpoint
router.get('/:id/text', protect, getExtractedTextHandler);

// File download / view endpoint
router.get('/:id/file', protect, getDocumentFile);

// Document CRUD by ID
router.route('/:id')
  .get(protect, getDocumentById)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

module.exports = router;
