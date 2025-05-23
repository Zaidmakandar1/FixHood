import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { fetchHomeownerJobs, acceptApplication, rejectApplication } from '../../services/jobService';
import { createRating } from '../../services/ratingService';
import { JobType } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';

const HomeOwnerDashboard = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [ratingJob, setRatingJob] = useState<{ jobId: string; fixerId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchHomeownerJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAcceptApplication = async (jobId: string, fixerId: string) => {
    try {
      await acceptApplication(jobId, fixerId);
      await loadJobs();
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const handleRejectApplication = async (jobId: string, fixerId: string) => {
    try {
      await rejectApplication(jobId, fixerId);
      await loadJobs();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingJob) return;

    setIsSubmittingRating(true);
    setError(null);

    try {
      await createRating({
        fixerId: ratingJob.fixerId,
        jobId: ratingJob.jobId,
        rating,
        comment
      });

      // Reset form and close modal
      setRatingJob(null);
      setRating(5);
      setComment('');
      await loadJobs(); // Refresh jobs to update UI
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') {
      return ['open', 'assigned'].includes(job.status);
    } else if (activeTab === 'completed') {
      return job.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return job.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="container-custom py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600">Manage your home improvement projects</p>
        </div>
        <Link 
          to="/jobs/create" 
          className="btn btn-primary mt-4 md:mt-0 flex items-center justify-center"
        >
          <Plus size={18} className="mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard 
          title="Active Jobs" 
          value={jobs.filter(j => ['open', 'assigned'].includes(j.status)).length.toString()} 
          icon={<Clock className="text-primary-500" />} 
        />
        <StatCard 
          title="Completed Jobs" 
          value={jobs.filter(j => j.status === 'completed').length.toString()} 
          icon={<CheckCircle className="text-success-500" />} 
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <TabButton 
            onClick={() => setActiveTab('active')}
            isActive={activeTab === 'active'}
            label="Active Jobs"
          />
          <TabButton 
            onClick={() => setActiveTab('completed')}
            isActive={activeTab === 'completed'}
            label="Completed"
          />
          <TabButton 
            onClick={() => setActiveTab('cancelled')}
            isActive={activeTab === 'cancelled'}
            label="Cancelled"
          />
        </nav>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job._id} className="space-y-4">
              <JobCard 
                job={job} 
                view="homeowner" 
                actionButton={
                  job.status === 'completed' && !job.rating ? (
                    <button
                      onClick={() => setRatingJob({ 
                        jobId: job._id, 
                        fixerId: job.assignedFixer.fixerId 
                      })}
                      className="btn btn-accent flex items-center"
                    >
                      <Star size={16} className="mr-2" />
                      Rate Fixer
                    </button>
                  ) : job.status === 'assigned' ? (
                    <Link to={`/chat/${job._id}`} className="btn btn-accent flex items-center">
                      <MessageSquare size={16} className="mr-2" />
                      Message Fixer
                    </Link>
                  ) : job.status === 'open' ? (
                    <span className="badge bg-primary-100 text-primary-800 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Waiting for applications
                    </span>
                  ) : null
                }
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No jobs found in this category</p>
            <Link to="/jobs/create" className="btn btn-primary">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Rate Your Fixer</h3>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={`${
                          value <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input w-full h-32"
                  placeholder="Share your experience with the fixer..."
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRatingJob(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingRating}
                >
                  {isSubmittingRating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Submit Rating'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center">
      <div className="rounded-full p-2 bg-gray-50 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ 
  onClick, 
  isActive, 
  label 
}: { 
  onClick: () => void; 
  isActive: boolean; 
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`py-4 px-1 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
  </button>
);

export default HomeOwnerDashboard;