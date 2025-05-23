import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Jobs API calls
export const jobsAPI = {
  // For fixers
  getAllJobs: () => api.get('/jobs'),
  // For homeowners
  getHomeownerJobs: () => api.get('/jobs/homeowner'),
  // For fixers
  getFixerJobs: () => api.get('/jobs/fixer'),
  // Create new job
  createJob: (jobData) => api.post('/jobs', jobData),
  // Apply for a job
  applyForJob: (jobId, applicationData) => 
    api.post(`/jobs/${jobId}/apply`, applicationData),
  // Accept an application
  acceptApplication: (jobId, applicationId) => 
    api.post(`/jobs/${jobId}/accept/${applicationId}`),
  // Complete a job
  completeJob: (jobId) => api.post(`/jobs/${jobId}/complete`),
};

export default api; 