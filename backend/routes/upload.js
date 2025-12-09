import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { uploadImage, uploadVideo } from '../config/cloudinary.js';
import { uploadImage as uploadImageToCloudinary, uploadVideo as uploadVideoToCloudinary, deleteFile } from '../utils/cloudinaryService.js';

const router = express.Router();

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: err.message || 'Maximum file size: Images 200MB, Videos 1GB'
      });
    }
    if (err.message.includes('Only image files') || err.message.includes('Only video files')) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        details: err.message 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error',
      details: err.message 
    });
  }
  next();
};

// Upload image (Admin only)
router.post('/image', verifyToken, verifyAdmin, uploadImage.single('image'), handleMulterError, async (req, res) => {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ 
        error: 'Cloudinary is not configured. Please check your environment variables.',
        details: 'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ error: 'File buffer is missing' });
    }

    console.log('Uploading image to Cloudinary...', {
      size: req.file.buffer.length,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });

    const result = await uploadImageToCloudinary(
      req.file.buffer,
      'varanasihub/trips/images'
    );

    console.log('Image uploaded successfully:', result.public_id);

    res.json({
      message: 'Image uploaded successfully',
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload video (Admin only)
router.post('/video', verifyToken, verifyAdmin, uploadVideo.single('video'), handleMulterError, async (req, res) => {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ 
        error: 'Cloudinary is not configured. Please check your environment variables.',
        details: 'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ error: 'File buffer is missing' });
    }

    console.log('Uploading video to Cloudinary...', {
      size: req.file.buffer.length,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    const result = await uploadVideoToCloudinary(
      req.file.buffer,
      'varanasihub/trips/videos'
    );

    console.log('Video uploaded successfully:', result.public_id);

    res.json({
      message: 'Video uploaded successfully',
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      duration: result.duration
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete file (Admin only)
router.delete('/:publicId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await deleteFile(publicId, resourceType);

    res.json({
      message: 'File deleted successfully',
      result
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
