const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'appliance', 'landscaping', 'general']
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'cancelled'],
    default: 'open'
  },
  homeownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeownerName: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  budget: {
    type: Number,
    required: true
  },
  assignedFixer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applications: [{
    fixerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    price: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add index for fixer applications
jobSchema.index({ 'applications.fixerId': 1 });

module.exports = mongoose.model('Job', jobSchema);