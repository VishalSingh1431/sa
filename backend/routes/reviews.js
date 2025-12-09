import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import Review from '../models/Review.js';
import { deleteFile } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all reviews (public - only active)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      status: 'active',
    });

    res.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (Admin - includes drafts)
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const reviews = await Review.findAll({
      status,
      includeDraft: true,
    });

    res.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.status !== 'active') {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Create review (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      error: 'Failed to create review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update review (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updateData = { ...req.body };
    
    // If new avatar uploaded, delete old one
    if (updateData.avatar && existingReview.avatarPublicId && updateData.avatar !== existingReview.avatar) {
      try {
        await deleteFile(existingReview.avatarPublicId, 'image');
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    const review = await Review.update(id, updateData);

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      error: 'Failed to update review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete review (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete associated avatar from Cloudinary
    if (review.avatarPublicId) {
      try {
        await deleteFile(review.avatarPublicId, 'image');
      } catch (err) {
        console.error('Error deleting avatar:', err);
      }
    }

    // Delete review from database
    await Review.delete(id);

    res.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      error: 'Failed to delete review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
