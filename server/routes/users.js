const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, location } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (location) user.location = location;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get user ratings (for fixers)
router.get('/:id/ratings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('ratings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user ratings' });
  }
});

module.exports = router; 