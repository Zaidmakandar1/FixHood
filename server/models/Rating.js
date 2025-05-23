import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  reviewerId: {
    type: String,
    required: true
  },
  reviewerRole: {
    type: String,
    enum: ['homeowner', 'fixer'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    enum: ['homeowner', 'fixer'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  }
}, { 
  timestamps: true 
});

// Add index for targetId to quickly retrieve all ratings for a user
RatingSchema.index({ targetId: 1 });

// Add index for jobId to ensure one rating per user per job
RatingSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });

const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

export default Rating;