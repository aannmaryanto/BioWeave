const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: ['protocol', 'lab_note', 'literature', 'Research Paper', 'Protocol', 'Lab Note', 'Clinical Trial'],
        message: '{VALUE} is not a valid document type',
      },
    },
    fileName: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed', 'Processed', 'Pending', 'Error'],
      default: 'uploaded',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
