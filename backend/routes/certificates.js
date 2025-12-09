import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';
import { deleteFiles } from '../utils/cloudinaryService.js';

const router = express.Router();

// Get all certificates (public - only active)
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      status: 'active',
    });

    res.json({
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get all certificates (Admin - includes drafts)
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const certificates = await Certificate.findAll({
      status,
      includeDraft: true,
    });

    res.json({
      certificates,
      count: certificates.length,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get certificate by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificate.status !== 'active') {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Create certificate (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const certificateData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const certificate = await Certificate.create(certificateData);

    res.status(201).json({
      message: 'Certificate created successfully',
      certificate,
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ 
      error: 'Failed to create certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update certificate (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingCertificate = await Certificate.findById(id);
    if (!existingCertificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const updateData = { ...req.body };
    
    // Handle image deletions if new images are uploaded
    if (updateData.images && Array.isArray(updateData.images)) {
      const oldImageIds = existingCertificate.imagesPublicIds || [];
      const newImageIds = updateData.imagesPublicIds || [];
      const idsToDelete = oldImageIds.filter(id => !newImageIds.includes(id));
      
      if (idsToDelete.length > 0) {
        try {
          await deleteFiles(idsToDelete, 'image');
        } catch (err) {
          console.error('Error deleting old images:', err);
        }
      }
    }

    const certificate = await Certificate.update(id, updateData);

    res.json({
      message: 'Certificate updated successfully',
      certificate,
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ 
      error: 'Failed to update certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete certificate (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Delete associated images from Cloudinary
    if (certificate.imagesPublicIds && certificate.imagesPublicIds.length > 0) {
      try {
        await deleteFiles(certificate.imagesPublicIds, 'image');
      } catch (err) {
        console.error('Error deleting images:', err);
      }
    }

    // Delete certificate from database
    await Certificate.delete(id);

    res.json({
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ 
      error: 'Failed to delete certificate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
