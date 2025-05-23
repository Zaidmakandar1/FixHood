const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get messages for a specific job
router.get('/:jobId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      ...req.body,
      senderId: req.user.id
    });
    await message.save();
    await message.populate('senderId', 'name');
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router; 