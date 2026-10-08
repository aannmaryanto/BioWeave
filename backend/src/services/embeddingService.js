/**
 * Embedding Service for BioWeave
 * Handles vector embedding generation via OpenAI SDK.
 * Fails gracefully when API key is missing or service is unavailable.
 */

const { OpenAI } = require('openai');

/**
 * Returns OpenAI client instance or null if API key is unconfigured.
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey });
}

/**
 * Check whether embedding capability is enabled and configured.
 * @returns {boolean}
 */
function isEmbeddingConfigured() {
  const apiKey = process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_openai_api_key_here');
}

/**
 * Generate numeric embedding vector for a single string.
 *
 * @param {string} text - Input text
 * @returns {Promise<Array<number>|null>} Vector array or null on error/unconfigured
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

  try {
    const response = await client.embeddings.create({
      model,
      input: text.trim(),
    });

    if (response && response.data && response.data.length > 0) {
      return response.data[0].embedding;
    }
    return null;
  } catch (error) {
    console.warn(`[EmbeddingService] Warning: Failed to generate embedding (${model}):`, error.message);
    return null;
  }
}

/**
 * Generate numeric embedding vectors for multiple strings.
 *
 * @param {Array<string>} texts - Array of input texts
 * @returns {Promise<Array<Array<number>|null>>} Array of embedding vectors
 */
async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const client = getOpenAIClient();
  if (!client) {
    return texts.map(() => null);
  }

  const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

  try {
    const validTexts = texts.map((t) => (t && typeof t === 'string' && t.trim() ? t.trim() : ' '));
    const response = await client.embeddings.create({
      model,
      input: validTexts,
    });

    if (response && response.data) {
      return response.data.map((item) => item.embedding);
    }
    return texts.map(() => null);
  } catch (error) {
    console.warn(`[EmbeddingService] Warning: Batch embedding failed (${model}):`, error.message);
    return texts.map(() => null);
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  isEmbeddingConfigured,
};
