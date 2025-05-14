import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the uploads directory in /tmp for Render's ephemeral file system
const uploadDir = path.join('/tmp', 'Uploads');

// Ensure the uploads directory exists before saving files
const ensureUploadDir = () => {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created or already exists:', uploadDir);
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    throw new Error('Failed to create uploads directory');
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir();
      cb(null, uploadDir);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    console.log('Saving file:', { filename, destination: uploadDir });
    cb(null, filename);
  },
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;