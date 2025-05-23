import { Star, StarHalf } from 'lucide-react';
import { format } from 'date-fns';

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

interface RatingDisplayProps {
  summary: RatingSummary;
}

const RatingDisplay = ({ summary }: RatingDisplayProps) => {
  const { averageRating, totalRatings, recentRatings } = summary;

  // Function to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="fill-yellow-400 text-yellow-400"
          size={20}
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="fill-yellow-400 text-yellow-400"
          size={20}
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="text-gray-300"
          size={20}
        />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Average Rating */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {renderStars(averageRating)}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {averageRating.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500">
          Based on {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Reviews
        </h3>
        {recentRatings.length > 0 ? (
          recentRatings.map((rating) => (
            <div
              key={rating._id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  {renderStars(rating.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{rating.comment}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  By {rating.homeownerId.name}
                </span>
                <span className="text-gray-500">
                  For: {rating.jobId.title}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default RatingDisplay; 