import axios from 'axios';
import { JobType, JobApplication } from '../types/job';
import { mockJobs } from '../mockData/jobs';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock implementation for enhancing job description with local LLM
export const enhanceJobDescription = async (rawDescription: string) => {
  try {
    // In a real app, this would call your local LLM endpoint
    // const response = await axios.post(`${API_BASE_URL}/enhance-job`, { description: rawDescription });
    // return response.data;
    
    // Mock response
    console.log('Enhancing job description with local LLM:', rawDescription);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock enhanced description and tags
    const enhancedDescription = `${rawDescription}\n\nAdditional details based on the description:\n- The issue appears to require professional attention\n- Recommended tools: Phillips screwdriver, adjustable wrench\n- Estimated time to complete: 1-3 hours depending on complexity`;
    
    // Generate some relevant tags based on the description
    const words = rawDescription.toLowerCase().split(/\s+/);
    const possibleTags = ['plumbing', 'electrical', 'carpentry', 'appliance', 'painting', 'landscaping', 'general'];
    
    const tags = possibleTags.filter(tag => 
      words.some(word => word.includes(tag.toLowerCase()))
    );
    
    // If no matching tags, add some default ones
    if (tags.length === 0) {
      tags.push('general', 'home repair');
    }
    
    return { 
      enhancedDescription,
      tags
    };
  } catch (error) {
    console.error('Error enhancing job description:', error);
    throw error;
  }
};

// Mock implementation for fetching jobs
export const fetchJobs = async (coordinates?: { lat: number; lng: number }) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.get(`${API_BASE_URL}/jobs`);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    return mockJobs.filter(job => job.status === 'open');
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Mock implementation for fetching homeowner jobs
export const fetchHomeownerJobs = async () => {
  try {
    // In a real app, this would call your backend API with the homeowner ID
    // const response = await axios.get(`${API_BASE_URL}/homeowner/jobs`);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data
    return mockJobs.filter(job => job.homeownerId === 'mock-user-id');
  } catch (error) {
    console.error('Error fetching homeowner jobs:', error);
    throw error;
  }
};

// Mock implementation for fetching fixer jobs
export const fetchFixerJobs = async () => {
  try {
    // In a real app, this would call your backend API with the fixer ID
    // const response = await axios.get(`${API_BASE_URL}/fixer/jobs`);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data for jobs where the fixer is assigned or has applied
    return mockJobs.filter(job => 
      (job.assignedFixer?.fixerId === 'mock-user-id') || 
      job.applications?.some(app => app.fixerId === 'mock-user-id')
    );
  } catch (error) {
    console.error('Error fetching fixer jobs:', error);
    throw error;
  }
};

// Mock implementation for fetching a job by ID
export const fetchJobById = async (jobId: string) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the job in our mock data
    const job = mockJobs.find(job => job._id === jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return job;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

// Mock implementation for creating a job
export const createJob = async (jobData: Partial<JobType>) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new job with mock data
    const newJob: JobType = {
      _id: `job-${Date.now()}`,
      homeownerId: 'mock-user-id',
      homeownerName: 'John Doe',
      title: jobData.title || '',
      description: jobData.description || '',
      image: jobData.image || null,
      location: jobData.location || { lat: 0, lng: 0 },
      locationName: 'Local Area',
      category: jobData.category || 'general',
      estimatedBudget: jobData.estimatedBudget || undefined,
      tags: jobData.tags || [],
      status: 'open',
      applications: [],
      createdAt: new Date().toISOString(),
    };
    
    // Add to mock data (in a real app, this would be saved in the database)
    mockJobs.unshift(newJob);
    
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Mock implementation for applying to a job
export const applyForJob = async (jobId: string, applicationData: Partial<JobApplication>) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, applicationData);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the job in our mock data
    const jobIndex = mockJobs.findIndex(job => job._id === jobId);
    
    if (jobIndex === -1) {
      throw new Error('Job not found');
    }
    
    // Create the application
    const application: JobApplication = {
      fixerId: applicationData.fixerId || '',
      fixerName: applicationData.fixerName || '',
      message: applicationData.message || '',
      price: applicationData.price,
      estimatedTime: applicationData.estimatedTime,
      createdAt: new Date().toISOString()
    };
    
    // Add the application to the job
    mockJobs[jobIndex].applications = [
      ...(mockJobs[jobIndex].applications || []),
      application
    ];
    
    return application;
  } catch (error) {
    console.error(`Error applying for job ${jobId}:`, error);
    throw error;
  }
};

// Mock implementation for accepting an application
export const acceptApplication = async (jobId: string, fixerId: string) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/accept`, { fixerId });
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the job in our mock data
    const jobIndex = mockJobs.findIndex(job => job._id === jobId);
    
    if (jobIndex === -1) {
      throw new Error('Job not found');
    }
    
    // Find the fixer application
    const application = mockJobs[jobIndex].applications?.find(app => app.fixerId === fixerId);
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Update the job status and assigned fixer
    mockJobs[jobIndex].status = 'assigned';
    mockJobs[jobIndex].assignedFixer = {
      fixerId,
      fixerName: application.fixerName
    };
    
    return mockJobs[jobIndex];
  } catch (error) {
    console.error(`Error accepting application for job ${jobId}:`, error);
    throw error;
  }
};

// Mock implementation for completing a job
export const completeJob = async (jobId: string) => {
  try {
    // In a real app, this would call your backend API
    // const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/complete`);
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the job in our mock data
    const jobIndex = mockJobs.findIndex(job => job._id === jobId);
    
    if (jobIndex === -1) {
      throw new Error('Job not found');
    }
    
    // Update the job status
    mockJobs[jobIndex].status = 'completed';
    mockJobs[jobIndex].completedAt = new Date().toISOString();
    
    return mockJobs[jobIndex];
  } catch (error) {
    console.error(`Error completing job ${jobId}:`, error);
    throw error;
  }
};