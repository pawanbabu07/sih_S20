const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure that the temp_uploads directory exists locally
const uploadDir = path.join(__dirname, '../temp_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage settings for temporary files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Explicit filter for audio mimetypes to comply with security requirements
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/wav',
    'audio/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'application/octet-stream' // Recorded blobs in browser often fallback to this
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio recordings are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Maximum 10 MB file size limit
  },
  fileFilter
});

module.exports = upload;
