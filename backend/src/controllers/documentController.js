const mongoose = require('mongoose');
const Document = require('../models/Document');

// In-memory fallback documents store when MongoDB is offline
const inMemoryDocuments = [
  {
    _id: 'doc-1',
    title: 'Optimizing Lipid Nanoparticle Formulations for mRNA Delivery to Primary Hepatocytes',
    description: 'Ionizable cationic lipids synthesized to evaluate liver-targeted transfection efficiency.',
    type: 'literature',
    fileName: 'lnp_formulation_2026.pdf',
    filePath: '/uploads/lnp_formulation_2026.pdf',
    fileSize: 4404019,
    mimeType: 'application/pdf',
    status: 'processed',
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
    filePath: '/uploads/cas12a_protocol_sop.pdf',
    fileSize: 1887436,
    mimeType: 'application/pdf',
    status: 'processed',
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
    filePath: '/uploads/petase_thermal_shift_notes.docx',
    fileSize: 870400,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'processed',
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
 * Create a new document entry (metadata)
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
        filePath: '/uploads/document.pdf',
        fileSize: fileSize || 1024500,
        mimeType: mimeType || 'application/pdf',
        status: 'uploaded',
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
 * Delete a document
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
  updateDocument,
  deleteDocument,
  inMemoryDocuments,
};
