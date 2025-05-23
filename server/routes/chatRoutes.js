import express from 'express';
import Message from '../models/Message.js';
import Job from '../models/Job.js';

const router = express.Router();

// Get all messages for a job
// GET /api/chat/:jobId
router.get('/:jobId', async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error(`Error fetching messages for job ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { jobId, senderId, senderName, senderRole, recipientId, message } = req.body;
    
    // Validate input
    if (!jobId || !senderId || !senderName || !senderRole || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if the job exists and is not completed or cancelled
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'open' && job.status !== 'assigned') {
      return res.status(400).json({ error: 'Cannot send messages for completed or cancelled jobs' });
    }
    
    // Create new message
    const newMessage = new Message({
      jobId,
      senderId,
      senderName,
      senderRole,
      recipientId,
      message
    });
    
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({ error: 'Failed to send message' });
  }
});

export default router;