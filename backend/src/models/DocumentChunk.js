const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: [true, 'Chunk index is required'],
    },
    text: {
      type: String,
      required: [true, 'Chunk text is required'],
    },
    startPosition: {
      type: Number,
      default: 0,
    },
    endPosition: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying & security scoping
documentChunkSchema.index({ document: 1, chunkIndex: 1 });
documentChunkSchema.index({ user: 1, document: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

module.exports = DocumentChunk;
