import { useState } from 'react';
import { Star, Edit2, CheckCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import useUserRole from '../../hooks/useUserRole';

const ProfilePage = () => {
  const { user } = useUser();
  const { role } = useUserRole();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-lg text-gray-600">Please select a role to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-6 max-w-4xl animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile */}
        <div className="lg:col-span-2 animate-fade-in-up [animation-delay:100ms]">
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            {success && (
              <div className="mb-4 flex items-center bg-green-50 text-green-800 p-3 rounded-lg animate-fade-in">
                <CheckCircle size={18} className="mr-2 text-green-600" />
                {success}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="animate-fade-in">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input transition-all duration-200 hover:border-primary-400 focus:border-primary-500"
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
                    className="input transition-all duration-200 hover:border-primary-400 focus:border-primary-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-outline transform transition hover:scale-105"
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
                    className="btn btn-primary transform transition hover:scale-105"
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
              <div className="animate-fade-in">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline flex items-center transform transition hover:scale-105"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Edit Profile
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Role: {role}</p>
                    <p>Account Status: Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats and ratings */}
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
            
            {role === 'fixer' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="text-primary-600 font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="text-primary-600 font-medium">4.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="text-primary-600 font-medium">98%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posted Jobs</span>
                  <span className="text-primary-600 font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="text-primary-600 font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Jobs</span>
                  <span className="text-primary-600 font-medium">2</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;