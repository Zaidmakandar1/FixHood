export const jobsAPI: {
  getHomeownerJobs: () => Promise<{ data: any[] }>;
  getFixerJobs: () => Promise<{ data: any[] }>;
  getAllJobs: () => Promise<{ data: any[] }>;
  createJob: (jobData: any) => Promise<{ data: any }>;
  applyForJob: (jobId: string, applicationData: { message: string; price: number }) => Promise<{ data: any }>;
  acceptApplication: (jobId: string, applicationId: string) => Promise<{ data: any }>;
  completeJob: (jobId: string) => Promise<{ data: any }>;
}; 