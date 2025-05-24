export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

export type JobApplication = {
  fixerId: string;
  fixerName: string;
  message: string;
  price?: number;
  estimatedTime?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export type Rating = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  homeownerId: {
    _id: string;
    name: string;
  };
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
  tags?: string[];
  status: JobStatus;
  applications?: JobApplication[];
  assignedFixer?: {
    fixerId: string;
    fixerName: string;
  };
  rating?: Rating;
  createdAt: string;
  completedAt?: string;
};