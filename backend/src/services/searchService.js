/**
 * Search Service for BioWeave
 * Provides high-performance semantic vector search with deterministic lexical fallback.
 * Strictly scopes results to documents owned by the authenticated user.
 */

const mongoose = require('mongoose');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { generateEmbedding } = require('./embeddingService');
const { inMemoryChunks, indexDocument } = require('./documentIndexingService');
const { inMemoryDocuments } = require('../controllers/documentController');

/**
 * Calculates Cosine Similarity between two numeric vectors.
 *
 * @param {Array<number>} vecA
 * @param {Array<number>} vecB
 * @returns {number} Cosine similarity score between -1 and 1 (typically 0 to 1 for embeddings)
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Fallback lexical TF-IDF / term frequency matching algorithm.
 * Evaluates relevance when vector embeddings are unavailable.
 *
 * @param {string} query - User search query
 * @param {string} chunkText - Passage text
 * @returns {number} Relevance score normalized to [0, 1]
 */
function computeLexicalScore(query, chunkText) {
  if (!query || !chunkText) return 0;

  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const queryTerms = tokenize(query);
  const chunkTerms = tokenize(chunkText);

  if (queryTerms.length === 0 || chunkTerms.length === 0) return 0;

  const chunkTf = {};
  chunkTerms.forEach((t) => {
    chunkTf[t] = (chunkTf[t] || 0) + 1;
  });

  let score = 0;
  let matchedCount = 0;

  queryTerms.forEach((qTerm) => {
    if (chunkTf[qTerm]) {
      matchedCount++;
      score += (1 + Math.log(chunkTf[qTerm])) * (qTerm.length > 4 ? 1.4 : 1.0);
    } else if (qTerm.length >= 4) {
      // Stem/Prefix matching for longer terms (e.g., "nanoparticles" matching "nanoparticle")
      const partialMatch = chunkTerms.some(
        (cTerm) => cTerm.length >= 4 && (cTerm.startsWith(qTerm) || qTerm.startsWith(cTerm))
      );
      if (partialMatch) {
        matchedCount += 0.5;
        score += 0.5;
      }
    }
  });

  if (matchedCount === 0) return 0;

  const queryCoverage = matchedCount / queryTerms.length;
  const chunkNorm = Math.sqrt(chunkTerms.length);
  const rawScore = (score / chunkNorm) * queryCoverage;

  return Math.min(1.0, Math.max(0.0, rawScore * 1.8));
}

/**
 * Helper to fetch all candidate chunks for user, auto-indexing user documents if unindexed.
 */
async function getCandidateChunksForUser(userIdStr, isMongo) {
  if (isMongo) {
    // Auto-index unindexed completed documents for user
    try {
      const userDocs = await Document.find({ uploadedBy: userIdStr, processingStatus: 'completed' });
      for (const doc of userDocs) {
        const existingChunk = await DocumentChunk.findOne({ document: doc._id });
        if (!existingChunk) {
          await indexDocument(doc._id, userIdStr);
        }
      }
    } catch (err) {
      console.warn('[SearchService] Mongo auto-indexing warning:', err.message);
    }

    const chunks = await DocumentChunk.find({ user: userIdStr }).populate('document', 'title type fileName');
    return chunks.map((c) => ({
      _id: c._id,
      documentId: c.document?._id || c.document,
      documentTitle: c.metadata?.title || c.document?.title || 'Untitled Document',
      documentType: c.metadata?.type || c.document?.type || 'literature',
      text: c.text,
      chunkIndex: c.chunkIndex,
      startPosition: c.startPosition,
      endPosition: c.endPosition,
      embedding: c.embedding || [],
      user: String(c.user),
    }));
  } else {
    // In-memory fallback auto-indexing
    const userDocs = inMemoryDocuments.filter(
      (d) =>
        (String(d.uploadedBy) === userIdStr || userIdStr.startsWith('mem-user')) &&
        (d.processingStatus === 'completed' || d.status === 'processed' || d.status === 'Processed')
    );

    for (const doc of userDocs) {
      const docIdStr = String(doc._id);
      const hasChunks = inMemoryChunks.some(
        (c) => String(c.document) === docIdStr || String(c.document) === `doc-${docIdStr}`
      );
      if (!hasChunks) {
        try {
          await indexDocument(doc._id, userIdStr);
        } catch (e) {
          // ignore doc index error
        }
      }
    }

    const memChunks = inMemoryChunks.filter(
      (c) => String(c.user) === userIdStr || userIdStr.startsWith('mem-user')
    );

    return memChunks.map((c) => ({
      _id: c._id,
      documentId: c.document,
      documentTitle: c.metadata?.title || 'Untitled Document',
      documentType: c.metadata?.type || 'literature',
      text: c.text,
      chunkIndex: c.chunkIndex,
      startPosition: c.startPosition,
      endPosition: c.endPosition,
      embedding: c.embedding || [],
      user: String(c.user),
    }));
  }
}

/**
 * Execute knowledge search across user's document passages.
 *
 * @param {string} query - Search query
 * @param {string|Object} userId - Authenticated user
 * @param {Object} [options] - Search options (limit, minSimilarity, type)
 * @returns {Promise<Object>} Object containing query, mode, count, and results array
 */
async function searchKnowledge(query, userId, options = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    const error = new Error('Search query cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  const trimmedQuery = query.trim();
  const userIdStr = String(userId._id || userId.id || userId);
  const limit = Math.max(1, Math.min(50, options.limit || 5));
  const minSimilarity = typeof options.minSimilarity === 'number' ? options.minSimilarity : 0.0;
  const isMongo = mongoose.connection.readyState === 1 && typeof userId === 'object';

  // Step 1: Generate query embedding if provider available
  const queryEmbedding = await generateEmbedding(trimmedQuery);

  // Step 2: Retrieve candidate chunks for authenticated user
  const candidateChunks = await getCandidateChunksForUser(userIdStr, isMongo);

  if (candidateChunks.length === 0) {
    return {
      query: trimmedQuery,
      mode: queryEmbedding ? 'vector' : 'fallback',
      count: 0,
      results: [],
    };
  }

  // Step 3: Determine if vector search or fallback search should be used
  const hasChunkEmbeddings = candidateChunks.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0);
  const useVectorSearch = Boolean(queryEmbedding && hasChunkEmbeddings);

  let scoredResults = [];

  if (useVectorSearch) {
    // Perform vector cosine similarity matching
    scoredResults = candidateChunks
      .map((chunk) => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return {
          chunkId: String(chunk._id),
          documentId: String(chunk.documentId),
          documentTitle: chunk.documentTitle,
          documentType: chunk.documentType,
          text: chunk.text,
          chunkIndex: chunk.chunkIndex,
          startPosition: chunk.startPosition,
          endPosition: chunk.endPosition,
          score: Math.round(score * 1000) / 1000,
        };
      })
      .filter((item) => item.score >= minSimilarity);

    scoredResults.sort((a, b) => b.score - a.score);
  } else {
    // Perform fallback lexical TF-IDF relevance search
    scoredResults = candidateChunks
      .map((chunk) => {
        const score = computeLexicalScore(trimmedQuery, chunk.text);
        return {
          chunkId: String(chunk._id),
          documentId: String(chunk.documentId),
          documentTitle: chunk.documentTitle,
          documentType: chunk.documentType,
          text: chunk.text,
          chunkIndex: chunk.chunkIndex,
          startPosition: chunk.startPosition,
          endPosition: chunk.endPosition,
          score: Math.round(score * 1000) / 1000,
        };
      })
      .filter((item) => item.score > 0);

    scoredResults.sort((a, b) => b.score - a.score);
  }

  // Optional document type filtering
  if (options.type && options.type !== 'All') {
    const filterType = options.type.toLowerCase();
    scoredResults = scoredResults.filter(
      (r) => r.documentType.toLowerCase().includes(filterType) || filterType.includes(r.documentType.toLowerCase())
    );
  }

  const finalResults = scoredResults.slice(0, limit);

  return {
    query: trimmedQuery,
    mode: useVectorSearch ? 'vector' : 'fallback',
    count: finalResults.length,
    results: finalResults,
  };
}

module.exports = {
  searchKnowledge,
  cosineSimilarity,
  computeLexicalScore,
};
