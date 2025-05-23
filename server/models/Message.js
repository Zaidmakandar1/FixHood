const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
messageSchema.index({ jobId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);