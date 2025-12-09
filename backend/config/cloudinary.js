import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Multer config for images (200MB max)
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Multer config for videos (1GB max)
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
});

// Default export for backward compatibility
const upload = uploadImage;
export default upload;

