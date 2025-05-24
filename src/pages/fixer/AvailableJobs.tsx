import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { fetchJobs } from '../../services/jobService';
import { JobType } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';

const AvailableJobs = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
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

      {/* Job listings */}
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