import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import WrittenReview from '../models/WrittenReview.js';
import { deleteFile } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all written reviews (public - only active)
router.get('/', async (req, res) => {
  try {
    const writtenReviews = await WrittenReview.findAll({
      status: 'active',
    });

    res.json({
      writtenReviews,
      count: writtenReviews.length,
    });
  } catch (error) {
    console.error('Error fetching written reviews:', error);
    res.status(500).json({ error: 'Failed to fetch written reviews' });
  }
});

// Get all written reviews (Admin - includes drafts)
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const writtenReviews = await WrittenReview.findAll({
      status,
      includeDraft: true,
    });

    res.json({
      writtenReviews,
      count: writtenReviews.length,
    });
  } catch (error) {
    console.error('Error fetching written reviews:', error);
    res.status(500).json({ error: 'Failed to fetch written reviews' });
  }
});

// Get written review by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const writtenReview = await WrittenReview.findById(id);

    if (!writtenReview) {
      return res.status(404).json({ error: 'Written review not found' });
    }

    if (writtenReview.status !== 'active') {
      return res.status(404).json({ error: 'Written review not found' });
    }

    res.json({ writtenReview });
  } catch (error) {
    console.error('Error fetching written review:', error);
    res.status(500).json({ error: 'Failed to fetch written review' });
  }
});

// Create written review (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const writtenReviewData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const writtenReview = await WrittenReview.create(writtenReviewData);

    res.status(201).json({
      message: 'Written review created successfully',
      writtenReview,
    });
  } catch (error) {
    console.error('Error creating written review:', error);
    res.status(500).json({ 
      error: 'Failed to create written review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update written review (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingWrittenReview = await WrittenReview.findById(id);
    if (!existingWrittenReview) {
      return res.status(404).json({ error: 'Written review not found' });
    }

    const updateData = { ...req.body };
    
    // If new avatar uploaded, delete old one
    if (updateData.avatar && existingWrittenReview.avatarPublicId && updateData.avatar !== existingWrittenReview.avatar) {
      try {
        await deleteFile(existingWrittenReview.avatarPublicId, 'image');
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    const writtenReview = await WrittenReview.update(id, updateData);

    res.json({
      message: 'Written review updated successfully',
      writtenReview,
    });
  } catch (error) {
    console.error('Error updating written review:', error);
    res.status(500).json({ 
      error: 'Failed to update written review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete written review (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const writtenReview = await WrittenReview.findById(id);
    if (!writtenReview) {
      return res.status(404).json({ error: 'Written review not found' });
    }

    // Delete associated avatar from Cloudinary
    if (writtenReview.avatarPublicId) {
      try {
        await deleteFile(writtenReview.avatarPublicId, 'image');
      } catch (err) {
        console.error('Error deleting avatar:', err);
      }
    }

    // Delete written review from database
    await WrittenReview.delete(id);

    res.json({
      message: 'Written review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting written review:', error);
    res.status(500).json({ 
      error: 'Failed to delete written review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
