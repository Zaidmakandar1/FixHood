import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, User, Star, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../../contexts/UserContext';
import useUserRole from '../../hooks/useUserRole';
import { fetchJobById, applyForJob, acceptApplication } from '../../services/jobService';
import { JobType, JobApplication } from '../../types/job';
import { useForm, SubmitHandler } from 'react-hook-form';

type ApplicationForm = {
  message: string;
  price?: string;
  estimatedTime?: string;
};

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
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
      if (!jobId) {
        setError('No job ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedJob = await fetchJobById(jobId);
        
        if (!fetchedJob || !fetchedJob._id) {
          setError('Job not found');
          setJob(null);
        } else {
          setJob(fetchedJob);
          setError(null);
        }
      } catch (error: any) {
        console.error('Error fetching job:', error);
        setError(error.message || 'Failed to load job details. Please try again later.');
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJob();
  }, [jobId]);
  
  const isOwner = job?.homeownerId === user?.id;
  const hasApplied = job?.applications?.some(app => app.fixerId === user?.id);
  
  const onApply: SubmitHandler<ApplicationForm> = async (data) => {
    if (!job?._id || !user) {
      setError('Unable to submit application. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await applyForJob(job._id, {
        fixerId: user.id,
        fixerName: user.name,
        message: data.message,
        price: data.price,
        estimatedTime: data.estimatedTime,
        status: 'pending'
      });
      
      setJob(prevJob => {
        if (!prevJob) return null;
        
        const newApplication: JobApplication = {
          fixerId: user.id,
          fixerName: user.name,
          message: data.message,
          price: data.price,
          estimatedTime: data.estimatedTime,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        return {
          ...prevJob,
          applications: [...(prevJob.applications || []), newApplication]
        };
      });
      
      setSuccess('Your application has been submitted successfully!');
      setShowApplyForm(false);
    } catch (error: any) {
      console.error('Error applying for job:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
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

  const getStatusBadgeClass = () => {
    if (!job) return '';
    
    if (job.status === 'open') return 'bg-accent-100 text-accent-800';
    if (job.status === 'assigned') return 'bg-primary-100 text-primary-800';
    if (job.status === 'completed') return 'bg-success-100 text-success-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusLabel = () => {
    if (!job) return '';
    
    if (job.status === 'open') return 'Open';
    if (job.status === 'assigned') return 'In Progress';
    if (job.status === 'completed') return 'Completed';
    return 'Cancelled';
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-fade-in">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/jobs" className="btn btn-primary animate-fade-in">
            Browse Available Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-fade-in">
          <h2 className="text-xl font-bold text-red-700 mb-2">Job Not Found</h2>
          <p className="text-red-600 mb-4">
            We couldn't find the job you're looking for. It may have been removed or you may have followed an invalid link.
          </p>
          <Link to="/jobs" className="btn btn-primary animate-fade-in">
            Browse Available Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      {/* Success message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 flex items-start animate-fade-in">
          <CheckCircle size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 flex items-start animate-fade-in">
          <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : job ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in-up">
              {/* Job header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center transform transition hover:scale-105">
                        <MapPin size={16} className="mr-1" />
                        <span>{job.locationName || `${job.location.lat.toFixed(2)}, ${job.location.lng.toFixed(2)}`}</span>
                      </div>
                      <div className="flex items-center transform transition hover:scale-105">
                        <Calendar size={16} className="mr-1" />
                        <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                      </div>
                      {job.estimatedBudget && (
                        <div className="flex items-center transform transition hover:scale-105">
                          <span className="font-medium text-primary-600">{job.estimatedBudget}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium animate-fade-in ${getStatusBadgeClass()}`}>
                    {getStatusLabel()}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(job.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 transform transition hover:scale-110"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <div className="prose max-w-none mb-6 animate-fade-in">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/profile/${job.homeownerId}`}
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors animate-fade-in"
                    >
                      <User size={16} />
                      <span>{job.homeownerName}</span>
                    </Link>
                  </div>
                  {job.status === 'open' && role === 'fixer' && !hasApplied && (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="btn btn-primary animate-fade-in transform transition hover:scale-105"
                    >
                      Apply for this Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in-up delay-150">
              {/* Application form or status */}
              {role === 'fixer' && (
                <>
                  {!showApplyForm ? (
                    <div className="text-center animate-fade-in">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Interested in this job?</h2>
                      <p className="text-gray-600 mb-4">Apply now to express your interest and introduce yourself to the homeowner.</p>
                      <button 
                        className="btn btn-primary w-full transform transition hover:scale-105"
                        onClick={() => setShowApplyForm(true)}
                      >
                        Apply for this Job
                      </button>
                    </div>
                  ) : (
                    <div className="animate-scale-in">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this Job</h2>
                      <form onSubmit={handleSubmit(onApply)} className="space-y-4">
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Introduction Message
                          </label>
                          <textarea
                            id="message"
                            rows={4}
                            className={`input w-full transition-all duration-200 ${errors.message ? 'border-red-300 focus:ring-red-500' : ''}`}
                            {...register('message', { 
                              required: 'Message is required',
                              minLength: { value: 10, message: 'Message should be at least 10 characters' }
                            })}
                          ></textarea>
                          {errors.message && (
                            <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.message.message}</p>
                          )}
                        </div>

                        {/* Price and time estimates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                              Price Estimate (Optional)
                            </label>
                            <input
                              type="text"
                              id="price"
                              className="input w-full"
                              placeholder="e.g., $50 - $100"
                              {...register('price')}
                            />
                          </div>
                          <div>
                            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                              Time Estimate (Optional)
                            </label>
                            <input
                              type="text"
                              id="estimatedTime"
                              className="input w-full"
                              placeholder="e.g., 2-3 hours"
                              {...register('estimatedTime')}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowApplyForm(false)}
                            className="btn btn-outline transform transition hover:scale-105"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary transform transition hover:scale-105"
                          >
                            {isSubmitting ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              'Submit Application'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-lg text-gray-600">Job not found</p>
        </div>
      )}
    </div>
  );
};

export default JobDetails;