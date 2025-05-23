import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, CheckCircle, MapPin } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import RatingDisplay from '../../components/RatingDisplay';
import { getFixerRatings } from '../../services/ratingService';

interface FixerProfileProps {
  isOwnProfile?: boolean;
}

const FixerProfile = ({ isOwnProfile = false }: FixerProfileProps) => {
  const { user, updateUser } = useUser();
  const { fixerId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const targetId = fixerId || user?.id;
        if (!targetId) return;

        const summary = await getFixerRatings(targetId);
        setRatingSummary(summary);
      } catch (err) {
        setError('Failed to load ratings');
        console.error('Error loading ratings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRatings();
  }, [fixerId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateUser({ name, bio });
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user && !fixerId) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-lg text-gray-600">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 input w-full h-32"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                    {user?.location && (
                      <p className="text-gray-500 flex items-center mt-1">
                        <MapPin size={16} className="mr-1" />
                        Location available
                      </p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
                {bio && <p className="mt-4 text-gray-600">{bio}</p>}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
                <CheckCircle size={16} className="mr-2" />
                {success}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Ratings Section */}
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : ratingSummary ? (
            <RatingDisplay summary={ratingSummary} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No ratings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixerProfile; 