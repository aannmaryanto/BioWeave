/**
 * Text Chunking Service for BioWeave
 * Splits extracted document text into overlapping, semantically coherent chunks
 * respecting paragraph and sentence boundaries while keeping scientific notation intact.
 */

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 150;

/**
 * Splits extracted text into chunks with index, text, startPosition, and endPosition.
 *
 * @param {string} text - The raw extracted text from a document.
 * @param {Object} [options] - Chunking options.
 * @param {number} [options.chunkSize=1000] - Max characters per chunk.
 * @param {number} [options.chunkOverlap=150] - Overlap character count between chunks.
 * @returns {Array<{chunkIndex: number, text: string, startPosition: number, endPosition: number}>}
 */
function chunkText(text, options = {}) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const chunkSize =
    typeof options.chunkSize === 'number' && options.chunkSize > 0
      ? options.chunkSize
      : DEFAULT_CHUNK_SIZE;

  const chunkOverlap =
    typeof options.chunkOverlap === 'number' && options.chunkOverlap >= 0
      ? Math.min(options.chunkOverlap, chunkSize - 1)
      : DEFAULT_CHUNK_OVERLAP;

  const chunks = [];
  let currentStart = 0;
  const textLength = text.length;
  let chunkIndex = 0;

  // Boundary delimiters ordered by preference for natural splitting
  const delimiters = ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '];

  while (currentStart < textLength) {
    let idealEnd = Math.min(currentStart + chunkSize, textLength);

    if (idealEnd < textLength) {
      let bestSplitPos = -1;
      const minSearchPos = currentStart + Math.floor(chunkSize * 0.4);

      for (const delimiter of delimiters) {
        const lastOccur = text.lastIndexOf(delimiter, idealEnd);
        if (lastOccur >= minSearchPos) {
          bestSplitPos = lastOccur + delimiter.length;
          break;
        }
      }

      if (bestSplitPos > currentStart && bestSplitPos <= textLength) {
        idealEnd = bestSplitPos;
      }
    }

    const chunkContent = text.substring(currentStart, idealEnd);

    if (chunkContent.trim().length > 0) {
      chunks.push({
        chunkIndex,
        text: chunkContent,
        startPosition: currentStart,
        endPosition: idealEnd,
      });
      chunkIndex++;
    }

    if (idealEnd >= textLength) {
      break;
    }

    // Step back by overlap amount, ensuring forward movement
    let nextStart = Math.max(currentStart + 1, idealEnd - chunkOverlap);

    // Try not to cut inside a word for the overlap start
    if (nextStart < textLength && text[nextStart] !== ' ' && text[nextStart - 1] !== ' ') {
      const spaceIdx = text.indexOf(' ', nextStart);
      if (spaceIdx !== -1 && spaceIdx < idealEnd) {
        nextStart = spaceIdx + 1;
      }
    }

    if (nextStart <= currentStart) {
      nextStart = currentStart + 1;
    }

    currentStart = nextStart;
  }

  return chunks;
}

module.exports = {
  chunkText,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
};
