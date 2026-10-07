const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename and prevent path traversal
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ext = path.extname(safeBaseName).toLowerCase();
    const nameWithoutExt = path.basename(safeBaseName, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// File Filter for allowed document types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream', // Some systems report docx as octet-stream
  ];

  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file type. Allowed formats: PDF, TXT, DOC, DOCX');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    cb(error, false);
  }
};

// Multer Upload Instance with 10MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

/**
 * Middleware wrapper to handle Multer upload errors gracefully
 */
const handleUpload = (req, res, next) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 10 MB limit' });
      }
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'Invalid file upload request' });
    }

    next();
  });
};

module.exports = handleUpload;
