import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import Destination from '../models/Destination.js';
import { deleteFile } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all destinations (public - only active)
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      status: 'active',
    });

    res.json({
      destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get all destinations (Admin - includes drafts)
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const destinations = await Destination.findAll({
      status,
      includeDraft: true,
    });

    res.json({
      destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get destination by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    if (destination.status !== 'active') {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ destination });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// Create destination (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const destinationData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const destination = await Destination.create(destinationData);

    res.status(201).json({
      message: 'Destination created successfully',
      destination,
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ 
      error: 'Failed to create destination',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update destination (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingDestination = await Destination.findById(id);
    if (!existingDestination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    const updateData = { ...req.body };
    
    // If new image uploaded, delete old one
    if (updateData.image && existingDestination.imagePublicId && updateData.image !== existingDestination.image) {
      try {
        await deleteFile(existingDestination.imagePublicId, 'image');
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    const destination = await Destination.update(id, updateData);

    res.json({
      message: 'Destination updated successfully',
      destination,
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({ 
      error: 'Failed to update destination',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete destination (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Delete associated image from Cloudinary
    if (destination.imagePublicId) {
      try {
        await deleteFile(destination.imagePublicId, 'image');
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Delete destination from database
    await Destination.delete(id);

    res.json({
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({ 
      error: 'Failed to delete destination',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
