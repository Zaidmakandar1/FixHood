import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter } from 'lucide-react';
import { fetchJobs } from '../../services/jobService';
import { JobType } from '../../types/job';
import useGeolocation from '../../hooks/useGeolocation';
import JobCard from '../../components/jobs/JobCard';

const JobList = () => {
  const { coordinates } = useGeolocation();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [radius, setRadius] = useState(25); // Default 25 miles radius
  
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchJobs(coordinates || undefined);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobs();
  }, [coordinates]);
  
  // Filter jobs based on search term and category
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === '' || 
      job.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'appliance', label: 'Appliance Repair' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'general', label: 'General Maintenance' },
  ];
  
  return (
    <div className="container-custom py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Jobs</h1>
          <p className="text-gray-600">Discover repair jobs in your area</p>
        </div>
        
        {coordinates && (
          <div className="flex items-center mt-2 md:mt-0 text-gray-500 animate-fade-in">
            <MapPin size={18} className="mr-1" />
            <span className="text-sm">
              Showing jobs within {radius} miles
            </span>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 animate-fade-in-up [animation-delay:200ms] transition-all duration-300 hover:shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div className="relative animate-fade-in [animation-delay:300ms]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full transition-all duration-200 hover:border-primary-400 focus:border-primary-500"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category filter */}
          <div className="animate-fade-in [animation-delay:400ms]">
            <select
              className="input w-full transition-all duration-200 hover:border-primary-400 focus:border-primary-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Distance filter */}
          <div className="flex items-center space-x-2 animate-fade-in [animation-delay:500ms]">
            <span className="text-sm text-gray-500 min-w-16">Distance:</span>
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:bg-primary-100"
            />
            <span className="text-sm text-gray-700 min-w-16">{radius} miles</span>
          </div>
        </div>
      </div>
      
      {/* Job listings */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
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
                    className="btn btn-primary transform transition hover:scale-105"
                  >
                    View Details
                  </Link>
                }
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg animate-fade-in-up">
            <Filter size={32} className="text-gray-400 mx-auto mb-2 animate-bounce" />
            <p className="text-gray-600 mb-2">No matching jobs found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;