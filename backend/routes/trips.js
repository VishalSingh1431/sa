import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import Trip from '../models/Trip.js';
import { deleteFile, deleteFiles } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all trips (public - only active trips)
router.get('/', async (req, res) => {
  try {
    const { location, limit, offset } = req.query;
    
    const trips = await Trip.findAll({
      status: 'active',
      location,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({
      trips,
      count: trips.length,
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get all trips (Admin - includes drafts)
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, location, limit, offset } = req.query;
    
    const trips = await Trip.findAll({
      status,
      location,
      includeDraft: true,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({
      trips,
      count: trips.length,
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get trip by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Only return active trips to public
    if (trip.status !== 'active') {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Get trip by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const trip = await Trip.findBySlug(slug);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create trip (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const trip = await Trip.create(tripData);

    res.status(201).json({
      message: 'Trip created successfully',
      trip,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Trip with this slug already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to create trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update trip (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTrip = await Trip.findById(id);
    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Handle file deletions if new files are uploaded
    const updateData = { ...req.body };
    
    // If new image uploaded, delete old one
    if (updateData.imageUrl && existingTrip.imagePublicId && updateData.imageUrl !== existingTrip.imageUrl) {
      try {
        await deleteFile(existingTrip.imagePublicId, 'image');
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    // If new video uploaded, delete old one
    if (updateData.videoUrl && existingTrip.videoPublicId && updateData.videoUrl !== existingTrip.videoUrl) {
      try {
        await deleteFile(existingTrip.videoPublicId, 'video');
      } catch (err) {
        console.error('Error deleting old video:', err);
      }
    }

    // Handle gallery deletions
    if (updateData.gallery && Array.isArray(updateData.gallery)) {
      const oldGalleryIds = existingTrip.galleryPublicIds || [];
      const newGalleryIds = updateData.galleryPublicIds || [];
      const idsToDelete = oldGalleryIds.filter(id => !newGalleryIds.includes(id));
      
      if (idsToDelete.length > 0) {
        try {
          await deleteFiles(idsToDelete, 'image');
        } catch (err) {
          console.error('Error deleting old gallery images:', err);
        }
      }
    }

    const trip = await Trip.update(id, updateData);

    res.json({
      message: 'Trip updated successfully',
      trip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Trip with this slug already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to update trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete trip (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Delete associated files from Cloudinary
    const filesToDelete = [];
    
    if (trip.imagePublicId) {
      filesToDelete.push({ publicId: trip.imagePublicId, type: 'image' });
    }
    
    if (trip.videoPublicId) {
      filesToDelete.push({ publicId: trip.videoPublicId, type: 'video' });
    }
    
    if (trip.galleryPublicIds && trip.galleryPublicIds.length > 0) {
      try {
        await deleteFiles(trip.galleryPublicIds, 'image');
      } catch (err) {
        console.error('Error deleting gallery images:', err);
      }
    }

    // Delete individual files
    for (const file of filesToDelete) {
      try {
        await deleteFile(file.publicId, file.type);
      } catch (err) {
        console.error(`Error deleting ${file.type}:`, err);
      }
    }

    // Delete trip from database
    await Trip.delete(id);

    res.json({
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      error: 'Failed to delete trip',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
