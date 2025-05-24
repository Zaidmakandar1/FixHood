import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, User, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JobType } from '../../types/job';

type JobCardProps = {
  job: JobType;
  view: 'homeowner' | 'fixer';
  actionButton?: React.ReactNode;
  onMarkCompleted?: () => void;
};

const JobCard = ({ job, view, actionButton, onMarkCompleted }: JobCardProps) => {
  const getStatusBadgeClass = () => {
    switch (job.status) {
      case 'open':
        return 'bg-accent-100 text-accent-800';
      case 'assigned':
        return 'bg-primary-100 text-primary-800';
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the status label
  const getStatusLabel = () => {
    switch (job.status) {
      case 'open':
        return 'Open';
      case 'assigned':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] animate-fade-in-up">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 animate-fade-in">
            <Link 
              to={`/jobs/${job._id}`}
              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              {job.title}
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center transform transition hover:scale-105">
                <MapPin size={16} className="mr-1" />
                <span>{job.locationName || `${job.location.lat.toFixed(2)}, ${job.location.lng.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center transform transition hover:scale-105">
                <Calendar size={16} className="mr-1" />
                <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass()} animate-fade-in`}>
            {getStatusLabel()}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 animate-slide-in">
          {job.description}
        </p>        <div className="flex flex-wrap gap-2 mb-4 animate-slide-in">
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="flex items-center transform transition hover:scale-105">
              <User size={16} className="mr-1 text-gray-400" />
              <span className="text-sm text-gray-600">{job.homeownerName}</span>
            </div>
            {job.rating && (
              <div className="flex items-center transform transition hover:scale-105">
                <Star size={16} className="mr-1 text-yellow-400" />
                <span className="text-sm text-gray-600">{job.rating.rating}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 animate-fade-in">
            {actionButton}
            {job.status === 'assigned' && view === 'homeowner' && (
              <button
                onClick={onMarkCompleted}
                className="btn btn-success flex items-center transform transition hover:scale-105"
              >
                <CheckCircle size={16} className="mr-2" />
                Complete
              </button>
            )}
            <Link
              to={`/chat/${job._id}`}
              className="btn btn-outline flex items-center transform transition hover:scale-105"
            >
              <MessageSquare size={16} className="mr-2" />
              Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;