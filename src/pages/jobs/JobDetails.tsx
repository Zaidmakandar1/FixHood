import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  Clock, MapPin, Calendar, DollarSign, Tag, 
  MessageSquare, Send, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import useUserRole from '../../hooks/useUserRole';
import { fetchJobById, applyForJob, acceptApplication } from '../../services/jobService';
import { formatDistanceToNow } from 'date-fns';
import { JobType } from '../../types/job';

type ApplicationForm = {
  message: string;
  price?: string;
  estimatedTime?: string;
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { role } = useUserRole();
  
  const [job, setJob] = useState<JobType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationForm>();
  
  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      
      try {
        const fetchedJob = await fetchJobById(id);
        setJob(fetchedJob);
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJob();
  }, [id]);
  
  // Check if the current user has already applied
  const hasApplied = job?.applications?.some(app => app.fixerId === user?.id);
  
  // Check if the job is created by the current user
  const isOwner = job?.homeownerId === user?.id;
  
  const onApply: SubmitHandler<ApplicationForm> = async (data) => {
    if (!job || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await applyForJob(job._id, {
        fixerId: user.id,
        fixerName: user.name,
        message: data.message,
        price: data.price || undefined,
        estimatedTime: data.estimatedTime || undefined,
      });
      
      // Update the local job data with the new application
      setJob(prevJob => {
        if (!prevJob) return null;
        
        const newApplication = {
          fixerId: user.id,
          fixerName: user.name,
          message: data.message,
          price: data.price || undefined,
          estimatedTime: data.estimatedTime || undefined,
          createdAt: new Date().toISOString(),
        };
        
        return {
          ...prevJob,
          applications: [...(prevJob.applications || []), newApplication]
        };
      });
      
      setSuccess('Your application has been submitted successfully!');
      setShowApplyForm(false);
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAcceptApplication = async (fixerId: string) => {
    if (!job) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await acceptApplication(job._id, fixerId);
      
      // Update the local job data
      setJob(prevJob => {
        if (!prevJob) return null;
        
        return {
          ...prevJob,
          status: 'assigned',
          assignedFixer: {
            fixerId,
            fixerName: prevJob.applications?.find(app => app.fixerId === fixerId)?.fixerName || ''
          }
        };
      });
      
      setSuccess('You have accepted the application. You can now chat with the fixer.');
      
      // Redirect to chat after a short delay
      setTimeout(() => {
        navigate(`/chat/${job._id}`);
      }, 2000);
    } catch (error) {
      console.error('Error accepting application:', error);
      setError('Failed to accept application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h2 className="text-xl font-bold text-red-700 mb-2">Job Not Found</h2>
          <p className="text-red-600 mb-4">
            We couldn't find the job you're looking for. It may have been removed or you may have followed an invalid link.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Browse Available Jobs
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-6">
      {/* Back button */}
      <Link 
        to={role === 'homeowner' ? '/homeowner' : '/jobs'}
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <span className="mr-1">←</span> Back to {role === 'homeowner' ? 'Dashboard' : 'Jobs'}
      </Link>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 flex items-start">
          <CheckCircle size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 flex items-start">
          <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Job header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>
                        {job.status === 'open' ? 'Open' : 
                         job.status === 'assigned' ? 'Assigned' :
                         job.status === 'completed' ? 'Completed' : 
                         'Cancelled'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      <span>
                        {job.locationName || 'Local Area'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {job.estimatedBudget && (
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        <span>
                          {job.estimatedBudget === 'under-100' ? 'Under $100' :
                           job.estimatedBudget === '100-250' ? '$100 - $250' :
                           job.estimatedBudget === '250-500' ? '$250 - $500' :
                           job.estimatedBudget === '500-1000' ? '$500 - $1,000' :
                           job.estimatedBudget === 'over-1000' ? 'Over $1,000' :
                           'Budget not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status badge */}
                <div className={`
                  badge px-3 py-1 
                  ${job.status === 'open' ? 'bg-accent-100 text-accent-800' : 
                    job.status === 'assigned' ? 'bg-primary-100 text-primary-800' :
                    job.status === 'completed' ? 'bg-success-100 text-success-800' : 
                    'bg-red-100 text-red-800'}
                `}>
                  {job.status === 'open' ? 'Open' : 
                   job.status === 'assigned' ? 'In Progress' :
                   job.status === 'completed' ? 'Completed' : 
                   'Cancelled'}
                </div>
              </div>
            </div>
            
            {/* Job image (if available) */}
            {job.image && (
              <div className="h-64 bg-gray-100">
                <img 
                  src={job.image} 
                  alt={job.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Job description */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{job.description}</p>
              
              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Tag size={16} className="mr-1" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span key={index} className="badge badge-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Application Form (for fixers only) */}
          {role === 'fixer' && job.status === 'open' && !isOwner && (
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              {!hasApplied ? (
                <>
                  {!showApplyForm ? (
                    <div className="text-center">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Interested in this job?</h2>
                      <p className="text-gray-600 mb-4">Apply now to express your interest and introduce yourself to the homeowner.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowApplyForm(true)}
                      >
                        Apply for this Job
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this Job</h2>
                      <form onSubmit={handleSubmit(onApply)}>
                        <div className="mb-4">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Introduction Message
                          </label>
                          <textarea
                            id="message"
                            rows={4}
                            className={`input ${errors.message ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="Introduce yourself and explain why you're a good fit for this job..."
                            {...register('message', { 
                              required: 'Message is required',
                              minLength: { value: 10, message: 'Message should be at least 10 characters' }
                            })}
                          ></textarea>
                          {errors.message && (
                            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                              Price Estimate (Optional)
                            </label>
                            <input
                              id="price"
                              type="text"
                              className="input"
                              placeholder="e.g., $50 - $100"
                              {...register('price')}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                              Time Estimate (Optional)
                            </label>
                            <input
                              id="estimatedTime"
                              type="text"
                              className="input"
                              placeholder="e.g., 2-3 hours"
                              {...register('estimatedTime')}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowApplyForm(false)}
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            className="btn btn-primary flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send size={16} className="mr-2" />
                                Send Application
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">Application Submitted</h3>
                    <p className="text-sm text-green-700 mt-1">
                      You've already applied for this job. The homeowner will contact you if they're interested.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Homeowner info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posted by</h2>
            <div className="flex items-center mb-3">
              <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center font-medium text-gray-700 mr-3">
                {job.homeownerName ? job.homeownerName.charAt(0).toUpperCase() : 'H'}
              </div>
              <div>
                <p className="font-medium">{job.homeownerName || 'Homeowner'}</p>
                <p className="text-sm text-gray-500">Member since 2023</p>
              </div>
            </div>
            
            {/* Only show contact button if the job is assigned to this fixer */}
            {role === 'fixer' && job.status === 'assigned' && job.assignedFixer?.fixerId === user?.id && (
              <Link 
                to={`/chat/${job._id}`}
                className="btn btn-accent w-full flex items-center justify-center"
              >
                <MessageSquare size={16} className="mr-2" />
                Message Homeowner
              </Link>
            )}
          </div>
          
          {/* Applications section (for homeowner only) */}
          {role === 'homeowner' && isOwner && job.applications && job.applications.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Applications ({job.applications.length})
              </h2>
              
              <div className="space-y-4">
                {job.applications.map((application, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-medium text-gray-700 mr-2">
                          {application.fixerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium">{application.fixerName}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{application.message}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      {application.price && (
                        <div className="flex items-center text-gray-700">
                          <DollarSign size={14} className="mr-1" />
                          <span>{application.price}</span>
                        </div>
                      )}
                      {application.estimatedTime && (
                        <div className="flex items-center text-gray-700">
                          <Clock size={14} className="mr-1" />
                          <span>{application.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                    
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleAcceptApplication(application.fixerId)}
                        disabled={isSubmitting}
                        className="btn btn-primary w-full text-sm"
                      >
                        {isSubmitting ? 'Processing...' : 'Accept Application'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;