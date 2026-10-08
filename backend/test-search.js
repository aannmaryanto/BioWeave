/**
 * Comprehensive Test Suite for Semantic / Knowledge Search
 * BioWeave - Feature/Semantic-Search
 */

const assert = require('assert');
const { chunkText } = require('./src/services/textChunkingService');
const { generateEmbedding, generateEmbeddings, isEmbeddingConfigured } = require('./src/services/embeddingService');
const { indexDocument, removeDocumentChunks, inMemoryChunks } = require('./src/services/documentIndexingService');
const { searchKnowledge, cosineSimilarity, computeLexicalScore } = require('./src/services/searchService');
const { inMemoryDocuments } = require('./src/controllers/documentController');

async function runAllTests() {
  console.log('\n==================================================');
  console.log('🧪 BioWeave Semantic & Knowledge Search Test Suite');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ Test ${total} FAILED: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ Test ${total} FAILED: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // 1. Text chunking
  test('1. Text chunking generates chunks with correct index and positions', () => {
    const text = 'Paragraph one describing lipid nanoparticles for mRNA delivery.\n\nParagraph two describing Cas12a plant protocol and RNP electroporation.';
    const chunks = chunkText(text, { chunkSize: 100, chunkOverlap: 20 });
    assert(chunks.length >= 2, 'Should create at least 2 chunks');
    assert.strictEqual(chunks[0].chunkIndex, 0);
    assert.strictEqual(chunks[1].chunkIndex, 1);
    assert(typeof chunks[0].startPosition === 'number');
    assert(typeof chunks[0].endPosition === 'number');
    assert(chunks[0].text.includes('lipid nanoparticles'));
  });

  // 2. Chunk overlap
  test('2. Chunk overlap includes overlapping text context', () => {
    const longText = 'A '.repeat(200) + 'B '.repeat(200);
    const chunks = chunkText(longText, { chunkSize: 200, chunkOverlap: 50 });
    assert(chunks.length >= 2, 'Should create multiple chunks for long text');
    assert(chunks[1].startPosition < chunks[0].endPosition, 'Chunk 2 start position should overlap with Chunk 1 end position');
  });

  // 3. Empty text handling
  test('3. Empty text returns empty array without throwing', () => {
    assert.deepStrictEqual(chunkText(''), []);
    assert.deepStrictEqual(chunkText(null), []);
    assert.deepStrictEqual(chunkText('   \n  \t '), []);
  });

  // 4. Document indexing
  await asyncTest('4. Document indexing processes extracted text into chunks', async () => {
    const testDocId = 'doc-1';
    const testUserId = 'mem-user-default';
    const result = await indexDocument(testDocId, testUserId);
    assert.strictEqual(result.documentId, 'doc-1');
    assert(result.chunkCount > 0, 'Chunk count should be > 0');
    assert(typeof result.embeddingCount === 'number');
  });

  // 5. Re-indexing removes old chunks
  await asyncTest('5. Re-indexing replaces old document chunks without duplicate accumulation', async () => {
    const testDocId = 'doc-2';
    const testUserId = 'mem-user-default';
    await indexDocument(testDocId, testUserId);
    const initialCount = inMemoryChunks.filter((c) => String(c.document) === testDocId).length;
    
    // Re-index doc-2
    await indexDocument(testDocId, testUserId);
    const reindexedCount = inMemoryChunks.filter((c) => String(c.document) === testDocId).length;
    
    assert.strictEqual(initialCount, reindexedCount, 'Chunk count should not duplicate after re-indexing');
  });

  // 6. Unprocessed documents cannot be indexed
  await asyncTest('6. Unprocessed documents reject indexing request', async () => {
    // Inject a pending document into in-memory store for testing
    inMemoryDocuments.push({
      _id: 'doc-pending-test',
      title: 'Unprocessed Pending Document',
      type: 'protocol',
      status: 'uploaded',
      processingStatus: 'pending',
      extractedText: '',
      uploadedBy: 'mem-user-default',
    });

    try {
      await indexDocument('doc-pending-test', 'mem-user-default');
      assert.fail('Should have thrown an error for unprocessed document');
    } catch (err) {
      assert(err.message.includes('has not completed text extraction') || err.message.includes('no text'), 'Should reject pending doc');
    }
  });

  // 7. User ownership is enforced on indexing
  await asyncTest('7. Indexing rejects unauthorized user access', async () => {
    inMemoryDocuments.push({
      _id: 'doc-private-owner',
      title: 'Private Scientist Protocol',
      type: 'protocol',
      status: 'processed',
      processingStatus: 'completed',
      extractedText: 'Confidential sequence details for proprietary vector.',
      uploadedBy: 'user-private-owner-123',
    });

    try {
      await indexDocument('doc-private-owner', 'user-intruder-999');
      assert.fail('Should have thrown unauthorized error');
    } catch (err) {
      assert.strictEqual(err.statusCode, 403, 'StatusCode should be 403');
    }
  });

  // 8. Missing API key is handled gracefully
  await asyncTest('8. Missing OPENAI_API_KEY does not crash embedding service', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const singleEmb = await generateEmbedding('lipid nanoparticle');
    assert.strictEqual(singleEmb, null, 'Should return null gracefully when API key missing');

    const batchEmb = await generateEmbeddings(['LNP 1', 'CRISPR 2']);
    assert.deepStrictEqual(batchEmb, [null, null], 'Should return array of nulls');

    process.env.OPENAI_API_KEY = originalKey;
  });

  // 9. Search rejects empty queries
  await asyncTest('9. Search rejects empty queries with 400 error', async () => {
    try {
      await searchKnowledge('', 'mem-user-default');
      assert.fail('Should throw error for empty query');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400, 'Should return 400 status code');
    }
  });

  // 10. Search returns only authenticated user's chunks
  await asyncTest('10. Search restricts results strictly to authenticated user', async () => {
    const res = await searchKnowledge('PETase enzyme thermostability', 'mem-user-default');
    assert(res.results.length >= 1, 'Should return matching results for user');
    res.results.forEach((r) => {
      assert(r.documentId !== 'doc-private-owner', 'Must not return documents belonging to other users');
    });
  });

  // 11. Search returns fallback results when vector search is unavailable
  await asyncTest('11. Search produces deterministic fallback text results when embeddings unavailable', async () => {
    const res = await searchKnowledge('Cas12a electroporation protocol', 'mem-user-default');
    assert(res.mode === 'vector' || res.mode === 'fallback', 'Mode must be vector or fallback');
    assert(res.results.length > 0, 'Should find matching passage results');
    assert(res.results[0].text.toLowerCase().includes('cas12a') || res.results[0].documentTitle.toLowerCase().includes('cas12a'));
  });

  // 12. Search returns no-result state correctly
  await asyncTest('12. Search handles zero-match query correctly', async () => {
    const res = await searchKnowledge('nonexistent_xyz_term_987654321', 'mem-user-default');
    assert.strictEqual(res.count, 0, 'Count should be 0');
    assert.deepStrictEqual(res.results, [], 'Results array should be empty');
  });

  // 13. Invalid document ID is handled
  await asyncTest('13. Indexing invalid document ID returns 404', async () => {
    try {
      await indexDocument('nonexistent-doc-id-99999', 'mem-user-default');
      assert.fail('Should throw 404 for invalid document ID');
    } catch (err) {
      assert.strictEqual(err.statusCode, 404, 'Should be 404 error');
    }
  });

  // 14. Embedding failure is handled safely
  await asyncTest('14. Cosine similarity and fallback lexical scoring perform robustly', async () => {
    const vecA = [0.1, 0.5, 0.8];
    const vecB = [0.1, 0.5, 0.8];
    const similarity = cosineSimilarity(vecA, vecB);
    assert(Math.abs(similarity - 1.0) < 0.001, 'Identical vectors should have cosine similarity of ~1.0');

    const score = computeLexicalScore('CRISPR Cas12a protocol', 'Step 1: Reconstitute Cas12a protein for high efficiency double-strand break induction.');
    assert(score > 0, 'Lexical score for matching terms should be > 0');
  });

  console.log('\n==================================================');
  console.log(`📊 Test Results: ${passed} / ${total} tests PASSED`);
  console.log('==================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test runner exception:', err);
  process.exit(1);
});
