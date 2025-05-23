import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import { useUser } from './UserContext';

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  homeownerId: string;
  homeownerName: string;
  location: {
    lat: number;
    lng: number;
  };
  budget: number;
  assignedFixer?: string;
  applications: Array<{
    _id: string;
    fixerId: string;
    message: string;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<void>;
  applyForJob: (jobId: string, applicationData: { message: string; price: number }) => Promise<void>;
  acceptApplication: (jobId: string, applicationId: string) => Promise<void>;
  completeJob: (jobId: string) => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch jobs when user changes
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (user?.role === 'homeowner') {
        response = await jobsAPI.getHomeownerJobs();
      } else if (user?.role === 'fixer') {
        response = await jobsAPI.getFixerJobs();
      } else {
        response = await jobsAPI.getAllJobs();
      }
      
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Partial<Job>) => {
    try {
      setError(null);
      const response = await jobsAPI.createJob(jobData);
      setJobs(prev => [response.data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating job');
      throw err;
    }
  };

  const applyForJob = async (jobId: string, applicationData: { message: string; price: number }) => {
    try {
      setError(null);
      const response = await jobsAPI.applyForJob(jobId, applicationData);
      setJobs(prev => prev.map(job => 
        job._id === jobId ? response.data : job
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error applying for job');
      throw err;
    }
  };

  const acceptApplication = async (jobId: string, applicationId: string) => {
    try {
      setError(null);
      const response = await jobsAPI.acceptApplication(jobId, applicationId);
      setJobs(prev => prev.map(job => 
        job._id === jobId ? response.data : job
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error accepting application');
      throw err;
    }
  };

  const completeJob = async (jobId: string) => {
    try {
      setError(null);
      const response = await jobsAPI.completeJob(jobId);
      setJobs(prev => prev.map(job => 
        job._id === jobId ? response.data : job
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error completing job');
      throw err;
    }
  };

  return (
    <JobsContext.Provider value={{
      jobs,
      loading,
      error,
      fetchJobs,
      createJob,
      applyForJob,
      acceptApplication,
      completeJob
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}; 