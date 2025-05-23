export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

export type JobApplication = {
  fixerId: string;
  fixerName: string;
  message: string;
  price?: string;
  estimatedTime?: string;
  createdAt: string;
};

export type JobType = {
  _id: string;
  homeownerId: string;
  homeownerName: string;
  title: string;
  description: string;
  image: string | null;
  location: {
    lat: number;
    lng: number;
  };
  locationName?: string;
  category?: string;
  estimatedBudget?: string;
  tags: string[];
  status: JobStatus;
  applications?: JobApplication[];
  assignedFixer?: {
    fixerId: string;
    fixerName: string;
  };
  createdAt: string;
  completedAt?: string;
};