/**
 * Document Indexing Service for BioWeave
 * Handles chunking document text, generating embeddings, and managing stored vector chunks.
 */

const mongoose = require('mongoose');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { chunkText } = require('./textChunkingService');
const { generateEmbeddings } = require('./embeddingService');
const { inMemoryDocuments } = require('../controllers/documentController');

// In-memory chunks repository for fallback execution when MongoDB is offline
const inMemoryChunks = [];

/**
 * Index or re-index a document by creating chunks and generating embeddings.
 *
 * @param {string} documentId - ID of document to index
 * @param {string|Object} userId - Authenticated user ID or user object
 * @returns {Promise<Object>} Statistics of the indexing operation
 */
async function indexDocument(documentId, userId) {
  const docIdStr = String(documentId);
  const userIdStr = String(userId._id || userId.id || userId);

  let doc = null;
  let isMongo = false;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docIdStr)) {
    doc = await Document.findById(docIdStr);
    if (doc) isMongo = true;
  }

  if (!doc) {
    doc = inMemoryDocuments.find(
      (d) => String(d._id) === docIdStr || String(d._id) === `doc-${docIdStr}`
    );
  }

  if (!doc) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership
  const ownerId = doc.uploadedBy ? String(doc.uploadedBy._id || doc.uploadedBy) : null;
  if (
    ownerId &&
    ownerId !== 'mem-user-default' &&
    ownerId !== userIdStr
  ) {
    const error = new Error('Not authorized to access or index this document');
    error.statusCode = 403;
    throw error;
  }

  // Verify processing status
  const isProcessed =
    doc.processingStatus === 'completed' ||
    doc.status === 'processed' ||
    doc.status === 'Processed';

  if (!isProcessed || !doc.extractedText || doc.extractedText.trim().length === 0) {
    const error = new Error('Document has not completed text extraction or contains no text');
    error.statusCode = 400;
    throw error;
  }

  // Chunk document text
  const chunks = chunkText(doc.extractedText);
  if (chunks.length === 0) {
    const error = new Error('Document text yields zero valid chunks');
    error.statusCode = 400;
    throw error;
  }

  // Generate vector embeddings for chunks
  const chunkTexts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(chunkTexts);

  let validEmbeddingCount = 0;

  if (isMongo) {
    // Delete existing chunks for document (prevents duplicate indexing)
    await DocumentChunk.deleteMany({ document: doc._id });

    // Prepare Mongoose documents
    const chunkDocs = chunks.map((chunk, idx) => {
      const emb = Array.isArray(embeddings[idx]) ? embeddings[idx] : [];
      if (emb.length > 0) validEmbeddingCount++;

      return {
        document: doc._id,
        user: doc.uploadedBy || userIdStr,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        startPosition: chunk.startPosition,
        endPosition: chunk.endPosition,
        embedding: emb,
        metadata: {
          title: doc.title,
          type: doc.type,
          fileName: doc.fileName || '',
        },
      };
    });

    await DocumentChunk.insertMany(chunkDocs);
  } else {
    // In-memory fallback indexing
    for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
      const existingDocId = String(inMemoryChunks[i].document);
      if (existingDocId === docIdStr || existingDocId === String(doc._id)) {
        inMemoryChunks.splice(i, 1);
      }
    }

    chunks.forEach((chunk, idx) => {
      const emb = Array.isArray(embeddings[idx]) ? embeddings[idx] : [];
      if (emb.length > 0) validEmbeddingCount++;

      inMemoryChunks.push({
        _id: `chunk-${docIdStr}-${chunk.chunkIndex}`,
        document: doc._id || docIdStr,
        user: userIdStr,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        startPosition: chunk.startPosition,
        endPosition: chunk.endPosition,
        embedding: emb,
        metadata: {
          title: doc.title,
          type: doc.type,
          fileName: doc.fileName || '',
        },
        createdAt: new Date(),
      });
    });
  }

  return {
    message: 'Document indexed successfully',
    documentId: doc._id || docIdStr,
    chunkCount: chunks.length,
    embeddingCount: validEmbeddingCount,
  };
}

/**
 * Remove stored chunks for a document
 */
async function removeDocumentChunks(documentId) {
  const docIdStr = String(documentId);
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docIdStr)) {
    await DocumentChunk.deleteMany({ document: docIdStr });
  }
  for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
    if (String(inMemoryChunks[i].document) === docIdStr) {
      inMemoryChunks.splice(i, 1);
    }
  }
}

module.exports = {
  indexDocument,
  removeDocumentChunks,
  inMemoryChunks,
};
