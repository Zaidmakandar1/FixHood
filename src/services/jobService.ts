import api from './api';
import { JobType, JobApplication } from '../types/job';

// Function to get user data
const getUserData = () => {
  const userData = localStorage.getItem('fixitlocal-user');
  if (!userData) {
    throw new Error('User data not found. Please log in again.');
  }

  const user = JSON.parse(userData);
  if (!user.id || !user.name) {
    throw new Error('Invalid user data. Please log in again.');
  }

  return user;
};

// Fetch available jobs for fixers
export const fetchJobs = async (coordinates?: { lat: number; lng: number }) => {
  try {
    const response = await api.get('/jobs', {
      params: coordinates ? { near: `${coordinates.lat},${coordinates.lng}` } : undefined
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response.status === 404) {
        throw new Error('Available jobs endpoint not found. Please check the API configuration.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch available jobs.');
      }
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

// Fetch homeowner's jobs
export const fetchHomeownerJobs = async () => {
  try {
    const response = await api.get('/jobs/homeowner');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response.status === 404) {
        throw new Error('Homeowner jobs endpoint not found. Please check the API configuration.');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch homeowner jobs.');
      }
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

// Fetch fixer's jobs
export const fetchFixerJobs = async () => {
  try {
    const response = await api.get('/jobs/my-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching fixer jobs:', error);
    throw error;
  }
};

// Fetch a specific job by ID
export const fetchJobById = async (jobId: string) => {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await api.get(`/jobs/${jobId}`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Error fetching job ${jobId}:`, error);
    
    if (error.response) {
      // Handle specific HTTP error responses
      if (error.response.status === 404) {
        throw new Error('Job not found');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to view this job');
      } else if (error.response.status === 401) {
        throw new Error('Please log in to view job details');
      } else {
        throw new Error(error.response.data?.message || 'Failed to fetch job details');
      }
    } else if (error.request) {
      // Handle network errors
      throw new Error('Could not connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Create a new job
export const createJob = async (jobData: Partial<JobType>) => {
  try {
    // Get user data
    const user = getUserData();

    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.location) {
      throw new Error('Missing required fields: title, description, and location are required');
    }

    // Format the job data to match the backend expectations
    const formattedJobData = {
      title: jobData.title.trim(),
      description: jobData.description.trim(),
      category: jobData.category || 'general',
      budget: parseFloat(jobData.estimatedBudget?.replace(/[^0-9]/g, '') || '0'),
      location: {
        lat: parseFloat(jobData.location.lat.toString()),
        lng: parseFloat(jobData.location.lng.toString())
      },
      status: 'open',
      image: jobData.image || null,
      createdAt: new Date().toISOString(),
      homeownerId: user.id,
      homeownerName: user.name
    };

    // Validate coordinates
    if (isNaN(formattedJobData.location.lat) || isNaN(formattedJobData.location.lng)) {
      throw new Error('Invalid location coordinates');
    }

    console.log('Creating job with data:', formattedJobData);

    const response = await api.post('/jobs', formattedJobData);
    console.log('Job creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Full error object:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        console.error('Authentication failed:', error.response.data);
        localStorage.removeItem('fixitlocal-token');
        window.location.href = '/login';
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response.status === 404) {
        throw new Error('Job creation endpoint not found. Please check the API configuration.');
      } else if (error.response.status === 500) {
        console.error('Server error details:', error.response.data);
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error. Please try again.';
        throw new Error(errorMessage);
      } else {
        throw new Error(error.response.data?.message || 'Failed to create job. Please try again.');
      }
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

// Apply for a job
export const applyForJob = async (jobId: string, applicationData: any) => {
  try {
    console.log('Sending application:', { jobId, applicationData });
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    
    console.log('Application successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error applying for job ${jobId}:`, error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to apply for job');
    }
    throw new Error(error.message || 'Failed to apply for job');
  }
};

// Accept an application
export const acceptApplication = async (jobId: string, fixerId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/accept`, { fixerId });
    return response.data;
  } catch (error) {
    console.error(`Error accepting application for job ${jobId}:`, error);
    throw error;
  }
};

// Reject an application
export const rejectApplication = async (jobId: string, fixerId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/reject`, { fixerId });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting application for job ${jobId}:`, error);
    throw error;
  }
};

// Complete a job
export const completeJob = async (jobId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/complete`);
    return response.data;
  } catch (error) {
    console.error(`Error completing job ${jobId}:`, error);
    throw error;
  }
};

// Mark job as completed by homeowner
export const markJobAsCompleted = async (jobId: string) => {
  try {
    const response = await api.post(`/jobs/${jobId}/mark-completed`);
    return response.data;
  } catch (error) {
    console.error(`Error marking job ${jobId} as completed:`, error);
    throw error;
  }
};