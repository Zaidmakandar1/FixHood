const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  fixerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  homeownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxLength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Create compound index for one rating per homeowner per job
RatingSchema.index({ fixerId: 1, homeownerId: 1, jobId: 1 }, { unique: true });

// Static method to calculate average rating for a fixer
RatingSchema.statics.getFixerRatingSummary = async function(fixerId) {
  const result = await this.aggregate([
    { $match: { fixerId: new mongoose.Types.ObjectId(fixerId) } },
    {
      $group: {
        _id: '$fixerId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  const recentRatings = await this.find({ fixerId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('homeownerId', 'name')
    .populate('jobId', 'title');

  return {
    averageRating: result[0]?.averageRating || 0,
    totalRatings: result[0]?.totalRatings || 0,
    recentRatings
  };
};

module.exports = mongoose.model('Rating', RatingSchema);