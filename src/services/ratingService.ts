import api from './api';

interface RatingData {
  fixerId: string;
  jobId: string;
  rating: number;
  comment: string;
}

interface Rating {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  homeownerId: {
    _id: string;
    name: string;
  };
  jobId: {
    _id: string;
    title: string;
  };
}

interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  recentRatings: Rating[];
}

// Get ratings for a fixer
export const getFixerRatings = async (fixerId: string): Promise<RatingSummary> => {
  try {
    const response = await api.get(`/ratings/fixer/${fixerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fixer ratings:', error);
    throw error;
  }
};

// Create a new rating
export const createRating = async (ratingData: RatingData): Promise<RatingSummary> => {
  try {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
}; 