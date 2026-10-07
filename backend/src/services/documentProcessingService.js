const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mongoose = require('mongoose');
const Document = require('../models/Document');

/**
 * Clean and normalize extracted text without stripping scientific notation/symbols
 */
function cleanExtractedText(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Normalize line endings (\r\n -> \n, \r -> \n)
  let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove non-printable ASCII control chars (preserving newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Collapse multiple horizontal spaces within lines
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // 4. Reduce 3+ consecutive newlines to 2 (preserve paragraph separation)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 5. Trim leading/trailing whitespace on each line and overall document
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();

  return cleaned;
}

/**
 * Extract raw text from file path based on file extension / MIME type
 */
async function extractTextFromFile(filePath, originalName = '', mimeType = '') {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('File not found on server');
  }

  const ext = path.extname(originalName || filePath).toLowerCase();

  if (ext === '.txt' || mimeType === 'text/plain') {
    const rawText = fs.readFileSync(filePath, 'utf8');
    return cleanExtractedText(rawText);
  } else if (ext === '.pdf' || mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    let extracted = '';
    try {
      const pdfData = await pdfParse(dataBuffer);
      extracted = pdfData.text || '';
    } catch (pdfErr) {
      console.warn('pdf-parse primary error:', pdfErr.message);
    }

    // Fallback text stream extraction if pdf-parse returns empty text
    if (!extracted || extracted.trim().length === 0) {
      const rawString = dataBuffer.toString('latin1');
      const textMatches = [];
      const tjRegex = /\(([^()]+)\)\s*Tj/g;
      let match;
      while ((match = tjRegex.exec(rawString)) !== null) {
        if (match[1] && match[1].trim()) {
          textMatches.push(match[1]);
        }
      }
      if (textMatches.length > 0) {
        extracted = textMatches.join('\n');
      }
    }

    if (!extracted || extracted.trim().length === 0) {
      throw new Error('PDF file contains no readable text layer or text extraction failed');
    }

    return cleanExtractedText(extracted);
  } else if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: filePath });
    return cleanExtractedText(result.value);
  } else if (ext === '.doc' || mimeType === 'application/msword') {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      if (result && result.value && result.value.trim().length > 0) {
        return cleanExtractedText(result.value);
      }
    } catch (err) {
      // Ignore mammoth error for binary .doc and throw clear message
    }
    throw new Error('Legacy .doc binary format is not supported for text extraction. Please convert to .docx or .pdf.');
  } else {
    throw new Error(`Unsupported document file format: ${ext || 'unknown'}`);
  }
}

/**
 * Process a document record by ID or document object
 */
async function processDocument(docIdOrObject) {
  let doc = null;
  let isMongo = false;

  // Determine if input is doc object or ID
  if (typeof docIdOrObject === 'string' || docIdOrObject instanceof mongoose.Types.ObjectId) {
    const docId = String(docIdOrObject);
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      doc = await Document.findById(docId);
      isMongo = true;
    } else {
      const { inMemoryDocuments } = require('../controllers/documentController');
      doc = inMemoryDocuments.find(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );
    }
  } else {
    doc = docIdOrObject;
    isMongo = doc && typeof doc.save === 'function';
  }

  if (!doc) {
    throw new Error('Document not found');
  }

  // Update status to processing
  doc.processingStatus = 'processing';
  doc.status = 'processing';
  if (isMongo) await doc.save();

  try {
    if (!doc.filePath) {
      throw new Error('No physical file associated with this document');
    }

    const absolutePath = path.resolve(doc.filePath);
    const extracted = await extractTextFromFile(absolutePath, doc.fileName, doc.mimeType);

    if (!extracted || extracted.trim().length === 0) {
      throw new Error('Extracted text is empty or unreadable');
    }

    doc.extractedText = extracted;
    doc.processingStatus = 'completed';
    doc.status = 'processed';
    doc.processedAt = new Date();
    doc.processingError = '';

    if (isMongo) {
      await doc.save();
    }
    return doc;
  } catch (error) {
    doc.processingStatus = 'failed';
    doc.status = 'failed';
    doc.processingError = error.message || 'Text extraction failed';

    if (isMongo) {
      await doc.save();
    }
    return doc;
  }
}

module.exports = {
  cleanExtractedText,
  extractTextFromFile,
  processDocument,
};
