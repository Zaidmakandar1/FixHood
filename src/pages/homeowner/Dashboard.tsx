import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { fetchHomeownerJobs, acceptApplication, rejectApplication } from '../../services/jobService';
import { JobType } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';

const HomeOwnerDashboard = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

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
      // Reload jobs to show updated status
      await loadJobs();
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const handleRejectApplication = async (jobId: string, fixerId: string) => {
    try {
      await rejectApplication(jobId, fixerId);
      // Reload jobs to show updated status
      await loadJobs();
    } catch (error) {
      console.error('Error rejecting application:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Homeowner Dashboard</h1>
          <p className="text-gray-600">Manage your repair requests and fixers</p>
        </div>
        <Link 
          to="/create-job" 
          className="btn btn-primary mt-4 md:mt-0 flex items-center justify-center md:justify-start"
        >
          <Plus size={18} className="mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
        <StatCard 
          title="Average Rating" 
          value={user?.ratings?.average ? user.ratings.average.toFixed(1) : 'N/A'} 
          icon={<Star className="text-secondary-500" />} 
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
                  job.status === 'assigned' ? (
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
              
              {/* Show applications for open jobs */}
              {job.status === 'open' && job.applications && job.applications.length > 0 && (
                <div className="ml-8 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Applications ({job.applications.length})</h3>
                  {job.applications.map((application, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.fixerName}</h4>
                          <p className="text-sm text-gray-500">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${application.price}</p>
                          <p className="text-sm text-gray-500">Est. {application.estimatedTime}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{application.message}</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAcceptApplication(job._id, application.fixerId)}
                          className="btn btn-success btn-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectApplication(job._id, application.fixerId)}
                          className="btn btn-error btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No jobs found in this category</p>
            {activeTab === 'active' && (
              <Link to="/create-job" className="btn btn-primary">
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>
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