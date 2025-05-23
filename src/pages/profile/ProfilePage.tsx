import { useState } from 'react';
import { Star, Edit2, CheckCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import useUserRole from '../../hooks/useUserRole';

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const { role } = useUserRole();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would be an API call to update the user profile
    setTimeout(() => {
      if (user) {
        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-lg text-gray-600">Please select a role to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            {success && (
              <div className="mb-4 flex items-center bg-green-50 text-green-800 p-3 rounded-lg">
                <CheckCircle size={18} className="mr-2 text-green-600" />
                {success}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setEmail(user.email);
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <button
                    className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p className="font-medium capitalize">{role}</p>
                  </div>
                  
                  {user.location && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium">
                        Latitude: {user.location.lat.toFixed(4)}, Longitude: {user.location.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats and ratings */}
        <div>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Stats</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Total Jobs</p>
                <p className="font-medium">0</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Completed Jobs</p>
                <p className="font-medium">0</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Average Rating</p>
                <div className="flex items-center">
                  <Star size={16} className="text-secondary-500 mr-1" />
                  <p className="font-medium">
                    {user?.ratings?.average ? user.ratings.average.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Member Since</p>
                <p className="font-medium">2023</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
            
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Star size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-600">No reviews yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;