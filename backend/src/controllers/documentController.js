const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

// In-memory fallback documents store when MongoDB is offline
const inMemoryDocuments = [
  {
    _id: 'doc-1',
    title: 'Optimizing Lipid Nanoparticle Formulations for mRNA Delivery to Primary Hepatocytes',
    description: 'Ionizable cationic lipids synthesized to evaluate liver-targeted transfection efficiency.',
    type: 'literature',
    fileName: 'lnp_formulation_2026.pdf',
    filePath: '',
    fileSize: 4404019,
    mimeType: 'application/pdf',
    status: 'processed',
    processingStatus: 'completed',
    extractedText: `Abstract: mRNA therapeutics rely heavily on lipid nanoparticle (LNP) vectors for systemic cellular delivery. Here, we systematically screened a library of novel ionizable amino lipids to determine optimal molar ratios for hepatic cell uptake.

Methods & Materials:
1. Lipid Mix: Cationic lipid / DSPC / Cholesterol / PEG-lipid at molar ratio 50:10:38.5:1.5.
2. Microfluidic Formulation: Formulated using NanoAssemblr at a total flow rate of 12 mL/min.
3. In vitro Transfection: Primary mouse hepatocytes were incubated for 24h prior to luminescence readout.

Results & Discussion:
Optimal formulation LNP-89 produced >94% encapsulation efficiency with average hydrodynamic diameter of 78.4 nm (PDI < 0.08). Systemic administration demonstrated 88% liver tropism.`,
    processingError: '',
    processedAt: new Date('2026-02-14'),
    uploadedBy: 'mem-user-default',
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-14'),
  },
  {
    _id: 'doc-2',
    title: 'High-Fidelity CRISPR-Cas12a Cleavage Protocol for Targeted Plant Genome Editing',
    description: 'Standardized operating procedure for temperature-optimized Cas12a RNP electroporation.',
    type: 'protocol',
    fileName: 'cas12a_protocol_sop.pdf',
    filePath: '',
    fileSize: 1887436,
    mimeType: 'application/pdf',
    status: 'processed',
    processingStatus: 'completed',
    extractedText: `Purpose: This protocol describes steps to reconstitute AsCas12a protein with synthetic crRNA guides for high-efficiency double-strand break induction.

Reagents Required:
- Recombinant AsCas12a Ultra (10 µg/µL)
- Custom crRNA (100 µM in TE buffer)
- Electroporation Buffer B (BioWeave formulation)

Step-by-step Procedure:
1. Incubate 2 µM Cas12a with 2.5 µM crRNA at 25°C for 15 minutes to form RNPs.
2. Prepare protoplast suspension (2x10^5 cells per 100 µL).
3. Mix RNPs with cell suspension and deliver single pulse at 160V, 15ms.
4. Incubate cells in dark at 23°C for 48 hours prior to genomic DNA extraction.`,
    processingError: '',
    processedAt: new Date('2026-03-01'),
    uploadedBy: 'mem-user-default',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  },
  {
    _id: 'doc-3',
    title: 'Lab Notebook Entry: Thermal Shift Assay of Engineered PETase Enzyme Variants',
    description: 'Assayed double mutant S238F/W159H against wild-type PETase thermostability.',
    type: 'lab_note',
    fileName: 'petase_thermal_shift_notes.docx',
    filePath: '',
    fileSize: 870400,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'processed',
    processingStatus: 'completed',
    extractedText: `Date: March 4, 2026
Objective: Evaluate thermostability of computationally designed PETase variants (BioWeave Fold v3.2 predictions).

Experimental Setup:
- Dye: SYPRO Orange (5x final concentration)
- Protein concentration: 0.5 mg/mL
- Temperature gradient: 25°C to 95°C at 1.0°C/min on qPCR instrument.

Observations:
- Wild-type PETase Tm: 48.2°C
- Variant EV-04 (S238F/W159H): 57.6°C
- Variant EV-09 (S238F/W159H/N241K): 62.1°C

Conclusion: EV-09 demonstrates exceptional thermostability compatible with industrial 60°C bioreactor conditions.`,
    processingError: '',
    processedAt: new Date('2026-03-04'),
    uploadedBy: 'mem-user-default',
    createdAt: new Date('2026-03-04'),
    updatedAt: new Date('2026-03-04'),
  },
];

/**
 * Normalize type filtering string
 */
const normalizeType = (typeStr) => {
  if (!typeStr || typeStr === 'All') return null;
  const lower = typeStr.toLowerCase().trim();
  if (lower.includes('proto')) return 'protocol';
  if (lower.includes('lab') || lower.includes('note')) return 'lab_note';
  if (lower.includes('lit') || lower.includes('paper') || lower.includes('research')) return 'literature';
  return lower;
};

/**
 * Get all documents for authenticated user
 * @route GET /api/documents
 * @access Private
 */
const getDocuments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { type, search, q } = req.query;
    const searchQuery = search || q || '';
    const typeFilter = normalizeType(type);

    if (mongoose.connection.readyState === 1 && typeof userId === 'object') {
      // MongoDB query
      const queryObj = { uploadedBy: userId };

      if (typeFilter) {
        queryObj.$or = [
          { type: typeFilter },
          { type: new RegExp(typeFilter, 'i') },
        ];
      }

      if (searchQuery.trim()) {
        queryObj.title = { $regex: searchQuery.trim(), $options: 'i' };
      }

      const docs = await Document.find(queryObj).sort({ createdAt: -1 });
      return res.status(200).json(docs);
    } else {
      // In-Memory Fallback query
      let docs = inMemoryDocuments.filter(
        (d) => String(d.uploadedBy) === String(userId) || String(userId).startsWith('mem-user')
      );

      if (typeFilter) {
        docs = docs.filter((d) => normalizeType(d.type) === typeFilter || d.type.toLowerCase().includes(typeFilter));
      }

      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        docs = docs.filter((d) => d.title.toLowerCase().includes(queryLower));
      }

      docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(docs);
    }
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ message: 'Error retrieving documents', error: error.message });
  }
};

/**
 * Get single document by ID
 * @route GET /api/documents/:id
 * @access Private
 */
const getDocumentById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      const doc = await Document.findById(docId);

      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check ownership
      if (String(doc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      return res.status(200).json(doc);
    } else {
      // In-memory fallback
      const doc = inMemoryDocuments.find(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );

      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check ownership for registered user in-memory documents
      if (doc.uploadedBy && String(doc.uploadedBy) !== 'mem-user-default' && String(doc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      return res.status(200).json(doc);
    }
  } catch (error) {
    console.error('Get Document By ID Error:', error);
    return res.status(500).json({ message: 'Error retrieving document', error: error.message });
  }
};

/**
 * Create a new document entry (metadata only)
 * @route POST /api/documents
 * @access Private
 */
const createDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, description, type, fileName, fileSize, mimeType } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'Please provide document title and type' });
    }

    const normType = normalizeType(type) || type.toLowerCase();

    if (mongoose.connection.readyState === 1 && typeof userId === 'object') {
      const doc = await Document.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        type: normType,
        fileName: fileName || '',
        filePath: '',
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/pdf',
        status: 'uploaded',
        processingStatus: 'pending',
        uploadedBy: userId,
      });

      return res.status(201).json(doc);
    } else {
      // In-memory fallback creation
      const newDoc = {
        _id: `doc-${Date.now()}`,
        title: title.trim(),
        description: description ? description.trim() : '',
        type: normType,
        fileName: fileName || 'document.pdf',
        filePath: '',
        fileSize: fileSize || 1024500,
        mimeType: mimeType || 'application/pdf',
        status: 'uploaded',
        processingStatus: 'pending',
        extractedText: '',
        processingError: '',
        uploadedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemoryDocuments.unshift(newDoc);
      return res.status(201).json(newDoc);
    }
  } catch (error) {
    console.error('Create Document Error:', error);
    return res.status(500).json({ message: 'Error creating document', error: error.message });
  }
};

/**
 * Upload a document with file attachment and trigger processing
 * @route POST /api/documents/upload
 * @access Private
 */
const uploadDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, type } = req.body;

    if (!title || !type) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({ message: 'Please provide document title and type' });
    }

    const normType = normalizeType(type) || type.toLowerCase();
    const fileName = req.file.originalname;
    const filePath = req.file.path;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    let createdDoc = null;

    if (mongoose.connection.readyState === 1 && typeof userId === 'object') {
      createdDoc = await Document.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        type: normType,
        fileName,
        filePath,
        fileSize,
        mimeType,
        status: 'uploaded',
        processingStatus: 'pending',
        uploadedBy: userId,
      });
    } else {
      // In-memory fallback upload
      createdDoc = {
        _id: `doc-${Date.now()}`,
        title: title.trim(),
        description: description ? description.trim() : '',
        type: normType,
        fileName,
        filePath,
        fileSize,
        mimeType,
        status: 'uploaded',
        processingStatus: 'pending',
        extractedText: '',
        processingError: '',
        uploadedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      inMemoryDocuments.unshift(createdDoc);
    }

    // Trigger document text extraction processing
    try {
      const { processDocument } = require('../services/documentProcessingService');
      await processDocument(createdDoc);
    } catch (procErr) {
      console.warn('Automatic extraction warning:', procErr.message);
    }

    return res.status(201).json(createdDoc);
  } catch (error) {
    console.error('Upload Document Error:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

/**
 * Process a document manually or re-trigger text extraction
 * @route POST /api/documents/:id/process
 * @access Private
 */
const processDocumentHandler = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;

    let doc = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      doc = await Document.findById(docId);
    } else {
      doc = inMemoryDocuments.find(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );
    }

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check ownership
    if (
      doc.uploadedBy &&
      String(doc.uploadedBy) !== 'mem-user-default' &&
      String(doc.uploadedBy) !== String(userId)
    ) {
      return res.status(403).json({ message: 'Not authorized to process this document' });
    }

    const { processDocument } = require('../services/documentProcessingService');
    const processedDoc = await processDocument(doc);

    return res.status(200).json({
      message: processedDoc.processingStatus === 'completed'
        ? 'Document processed successfully'
        : `Processing finished with status: ${processedDoc.processingStatus}`,
      document: {
        id: processedDoc._id || processedDoc.id,
        processingStatus: processedDoc.processingStatus,
        processedAt: processedDoc.processedAt || null,
        textLength: (processedDoc.extractedText || '').length,
        processingError: processedDoc.processingError || '',
      },
    });
  } catch (error) {
    console.error('Process Document Error:', error);
    return res.status(500).json({ message: 'Error processing document', error: error.message });
  }
};

/**
 * Get extracted text for a document
 * @route GET /api/documents/:id/text
 * @access Private
 */
const getExtractedTextHandler = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;

    let doc = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      doc = await Document.findById(docId);
    } else {
      doc = inMemoryDocuments.find(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );
    }

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check ownership
    if (
      doc.uploadedBy &&
      String(doc.uploadedBy) !== 'mem-user-default' &&
      String(doc.uploadedBy) !== String(userId)
    ) {
      return res.status(403).json({ message: 'Not authorized to access extracted text for this document' });
    }

    return res.status(200).json({
      documentId: doc._id || doc.id,
      processingStatus: doc.processingStatus || (doc.status === 'processed' || doc.status === 'Processed' ? 'completed' : 'pending'),
      extractedText: doc.extractedText || '',
      processingError: doc.processingError || '',
      processedAt: doc.processedAt || null,
    });
  } catch (error) {
    console.error('Get Extracted Text Error:', error);
    return res.status(500).json({ message: 'Error retrieving extracted text', error: error.message });
  }
};

/**
 * Download / View document file
 * @route GET /api/documents/:id/file
 * @access Private
 */
const getDocumentFile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;

    let targetDoc = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      targetDoc = await Document.findById(docId);
    } else {
      targetDoc = inMemoryDocuments.find(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );
    }

    if (!targetDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check ownership
    if (
      targetDoc.uploadedBy &&
      String(targetDoc.uploadedBy) !== 'mem-user-default' &&
      String(targetDoc.uploadedBy) !== String(userId)
    ) {
      return res.status(403).json({ message: 'Not authorized to access this document file' });
    }

    if (!targetDoc.filePath) {
      return res.status(404).json({ message: 'No file attached to this document' });
    }

    const absolutePath = path.resolve(targetDoc.filePath);

    // Prevent path traversal
    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (!absolutePath.startsWith(uploadDir) && !fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    return res.sendFile(absolutePath);
  } catch (error) {
    console.error('Get Document File Error:', error);
    return res.status(500).json({ message: 'Error fetching document file', error: error.message });
  }
};

/**
 * Update document details (metadata)
 * @route PUT /api/documents/:id
 * @access Private
 */
const updateDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;
    const { title, description, type } = req.body;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      const doc = await Document.findById(docId);

      if (!doc || String(doc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (title) doc.title = title.trim();
      if (description !== undefined) doc.description = description.trim();
      if (type) doc.type = normalizeType(type) || type.toLowerCase();

      const updatedDoc = await doc.save();
      return res.status(200).json(updatedDoc);
    } else {
      // In-memory fallback update
      const docIndex = inMemoryDocuments.findIndex(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );

      if (docIndex === -1) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const targetDoc = inMemoryDocuments[docIndex];
      if (targetDoc.uploadedBy && String(targetDoc.uploadedBy) !== 'mem-user-default' && String(targetDoc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (title) targetDoc.title = title.trim();
      if (description !== undefined) targetDoc.description = description.trim();
      if (type) targetDoc.type = normalizeType(type) || type.toLowerCase();
      targetDoc.updatedAt = new Date();

      return res.status(200).json(targetDoc);
    }
  } catch (error) {
    console.error('Update Document Error:', error);
    return res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

/**
 * Delete a document and its stored file
 * @route DELETE /api/documents/:id
 * @access Private
 */
const deleteDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const docId = req.params.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(docId)) {
      const doc = await Document.findById(docId);

      if (!doc || String(doc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (doc.filePath && fs.existsSync(doc.filePath)) {
        try { fs.unlinkSync(doc.filePath); } catch (err) {}
      }

      await doc.deleteOne();
      return res.status(200).json({ message: 'Document deleted successfully', id: docId });
    } else {
      // In-memory fallback delete
      const docIndex = inMemoryDocuments.findIndex(
        (d) => String(d._id) === String(docId) || String(d._id) === `doc-${docId}`
      );

      if (docIndex === -1) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const targetDoc = inMemoryDocuments[docIndex];
      if (targetDoc.uploadedBy && String(targetDoc.uploadedBy) !== 'mem-user-default' && String(targetDoc.uploadedBy) !== String(userId)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (targetDoc.filePath && fs.existsSync(targetDoc.filePath)) {
        try { fs.unlinkSync(targetDoc.filePath); } catch (err) {}
      }

      inMemoryDocuments.splice(docIndex, 1);
      return res.status(200).json({ message: 'Document deleted successfully', id: docId });
    }
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  processDocumentHandler,
  getExtractedTextHandler,
  getDocumentFile,
  updateDocument,
  deleteDocument,
  inMemoryDocuments,
};
