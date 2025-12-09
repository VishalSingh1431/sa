import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import Enquiry from '../models/Enquiry.js';
import { sendTripEnquiryEmail } from '../utils/emailService.js';

const router = express.Router();

// Create enquiry (Public - no auth required)
router.post('/', async (req, res) => {
  try {
    const { tripId, tripTitle, tripLocation, tripPrice, selectedMonth, numberOfTravelers, name, email, phone, message } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create enquiry
    const enquiry = await Enquiry.create({
      tripId,
      tripTitle,
      tripLocation,
      tripPrice,
      selectedMonth,
      numberOfTravelers: numberOfTravelers || 1,
      name,
      email,
      phone,
      message,
    });

    // Send email to admin
    try {
      await sendTripEnquiryEmail({
        tripTitle,
        tripLocation,
        tripPrice,
        selectedMonth,
        numberOfTravelers: numberOfTravelers || 1,
        name,
        email,
        phone,
        message,
      });
      console.log('Enquiry email sent successfully');
    } catch (emailError) {
      console.error('Failed to send enquiry email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      enquiry: {
        id: enquiry.id,
        tripTitle: enquiry.tripTitle,
        selectedMonth: enquiry.selectedMonth,
        numberOfTravelers: enquiry.numberOfTravelers,
      },
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ 
      error: 'Failed to submit enquiry',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all enquiries (Admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, tripId, limit, offset } = req.query;
    
    const enquiries = await Enquiry.findAll({
      status,
      tripId: tripId ? parseInt(tripId) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({
      enquiries,
      count: enquiries.length,
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// Get enquiry by ID (Admin only)
router.get('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ enquiry });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ error: 'Failed to fetch enquiry' });
  }
});

// Update enquiry status (Admin only)
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'contacted', 'booked', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const enquiry = await Enquiry.updateStatus(id, status);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({
      message: 'Enquiry status updated successfully',
      enquiry,
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ error: 'Failed to update enquiry status' });
  }
});

export default router;
