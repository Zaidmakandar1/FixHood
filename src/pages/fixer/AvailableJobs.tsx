import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { fetchJobs } from '../../services/jobService';
import { JobType } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedJobs = await fetchJobs();
        
        // Filter out any invalid job data
        const validJobs = fetchedJobs.filter(job => job && job._id && job.status === 'open');
        setJobs(validJobs);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        setError(error.message || 'Failed to load available jobs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <div className="container-custom py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600">Find and apply for repair jobs in your area</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 animate-fade-in">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-700 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job, index) => (
            <div 
              key={job._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <JobCard 
                job={job} 
                view="fixer" 
                actionButton={
                  <Link 
                    to={`/jobs/${job._id}`} 
                    className="btn btn-primary flex items-center transform transition hover:scale-105"
                  >
                    <Briefcase size={16} className="mr-2" />
                    Apply Now
                  </Link>
                }
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg animate-fade-in-up">
            <p className="text-gray-600 mb-4">No available jobs found in your area</p>
            <p className="text-sm text-gray-500 animate-fade-in [animation-delay:200ms]">
              Check back later for new opportunities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableJobs;