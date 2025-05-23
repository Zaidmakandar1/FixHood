import axios from 'axios';
import { JobType, JobApplication } from '../types/job';

const API_BASE_URL = 'http://localhost:5000/api';

// Function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('fixitlocal-token');
  console.log('Raw token from localStorage:', token); // Debug raw token

  if (!token) {
    console.error('No token found in localStorage');
    window.location.href = '/login';
    throw new Error('No authentication token found. Please log in.');
  }

  // Remove any quotes and whitespace that might be present in the token
  const cleanToken = token.replace(/['"\s]/g, '');
  console.log('Cleaned token:', cleanToken); // Debug cleaned token

  // Basic JWT validation
  try {
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: not a valid JWT');
      localStorage.removeItem('fixitlocal-token');
      window.location.href = '/login';
      throw new Error('Invalid token format');
    }

    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));
    console.log('Decoded token payload:', payload); // Debug decoded payload

    // Check if token is expired
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    if (Date.now() >= expirationTime) {
      console.error('Token has expired');
      localStorage.removeItem('fixitlocal-token');
      window.location.href = '/login';
      throw new Error('Token has expired. Please log in again.');
    }

    return cleanToken;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('fixitlocal-token');
    window.location.href = '/login';
    throw new Error('Invalid authentication token. Please log in again.');
  }
};

// Function to get auth headers
const getAuthHeaders = () => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };
    console.log('Request headers:', headers); // Debug headers
    return headers;
  } catch (error) {
    console.error('Authentication error:', error);
    window.location.href = '/login';
    throw error;
  }
};

// Fetch available jobs for fixers
export const fetchJobs = async (coordinates?: { lat: number; lng: number }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: getAuthHeaders(),
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
    const response = await axios.get(`${API_BASE_URL}/jobs/homeowner`, {
      headers: getAuthHeaders()
    });
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
    const response = await axios.get(`${API_BASE_URL}/jobs/my-applications`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fixer jobs:', error);
    throw error;
  }
};

// Fetch a specific job by ID
export const fetchJobById = async (jobId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

// Create a new job
export const createJob = async (jobData: Partial<JobType>) => {
  try {
    // Check authentication first
    const headers = getAuthHeaders();
    if (!headers) {
      throw new Error('Authentication failed. Please log in again.');
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('fixitlocal-user');
    if (!userData) {
      throw new Error('User data not found. Please log in again.');
    }

    const user = JSON.parse(userData);
    if (!user.id || !user.name) {
      throw new Error('Invalid user data. Please log in again.');
    }

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
    console.log('Using endpoint:', `${API_BASE_URL}/jobs`);

    const response = await axios.post(`${API_BASE_URL}/jobs`, formattedJobData, {
      headers,
      validateStatus: (status) => {
        return status < 500; // Don't reject if status is less than 500
      }
    });

    if (response.status === 403) {
      console.error('Authentication failed:', response.data);
      localStorage.removeItem('fixitlocal-token');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 500) {
      console.error('Server error details:', response.data);
      // Try to extract the error message from the response
      const errorMessage = response.data?.message || response.data?.error || 'Server error. Please try again.';
      throw new Error(errorMessage);
    }

    if (response.status !== 200 && response.status !== 201) {
      console.error('Request failed:', response.data);
      throw new Error(response.data?.message || 'Failed to create job');
    }

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
        // Try to extract the error message from the response
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
export const applyForJob = async (jobId: string, applicationData: Partial<JobApplication>) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, applicationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error applying for job ${jobId}:`, error);
    throw error;
  }
};

// Accept an application
export const acceptApplication = async (jobId: string, fixerId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/accept`, { fixerId }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error accepting application for job ${jobId}:`, error);
    throw error;
  }
};

// Reject an application
export const rejectApplication = async (jobId: string, fixerId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/reject`, { fixerId }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting application for job ${jobId}:`, error);
    throw error;
  }
};

// Complete a job
export const completeJob = async (jobId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/complete`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error completing job ${jobId}:`, error);
    throw error;
  }
};