const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');

// Get ratings summary for a fixer
router.get('/fixer/:fixerId', async (req, res) => {
  try {
    const summary = await Rating.getFixerRatingSummary(req.params.fixerId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching fixer ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// Create a new rating
router.post('/', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const { fixerId, jobId, rating, comment } = req.body;

    // Validate input
    if (!fixerId || !jobId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create the rating
    const newRating = new Rating({
      fixerId,
      homeownerId: req.user.userId,
      jobId,
      rating,
      comment
    });

    await newRating.save();

    // Get updated summary
    const summary = await Rating.getFixerRatingSummary(fixerId);
    res.status(201).json(summary);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already rated this job' });
    } else {
      console.error('Error creating rating:', error);
      res.status(500).json({ message: 'Error creating rating' });
    }
  }
});

module.exports = router; 