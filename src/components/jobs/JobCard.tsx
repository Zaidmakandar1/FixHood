import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, User, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JobType } from '../../types/job';
import { markJobAsCompleted } from '../../services/jobService';

type JobCardProps = {
  job: JobType;
  view: 'homeowner' | 'fixer';
  actionButton?: React.ReactNode;
  onMarkCompleted?: () => void;
};

const JobCard = ({ job, view, actionButton, onMarkCompleted }: JobCardProps) => {
  // Determine status badge color
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

  // Handle marking job as completed
  const handleMarkCompleted = async () => {
    try {
      await markJobAsCompleted(job._id);
      if (onMarkCompleted) {
        onMarkCompleted();
      }
    } catch (error) {
      console.error('Error marking job as completed:', error);
      // You might want to show an error toast here
    }
  };

  // Determine action button based on job status and view
  const renderActionButton = () => {
    if (actionButton) {
      return actionButton;
    }

    if (view === 'homeowner') {
      if (job.status === 'assigned') {
        return (
          <div className="flex space-x-2">
            <button
              onClick={handleMarkCompleted}
              className="btn btn-success flex items-center"
            >
              <CheckCircle size={16} className="mr-2" />
              Mark Completed
            </button>
            <Link to={`/chat/${job._id}`} className="btn btn-accent flex items-center">
              <MessageSquare size={16} className="mr-2" />
              Message
            </Link>
          </div>
        );
      } else if (job.status === 'completed' && !job.rating) {
        return (
          <button
            onClick={() => {
              // This will be handled by the parent component's actionButton
              return;
            }}
            className="btn btn-accent flex items-center"
          >
            <Star size={16} className="mr-2" />
            Rate Fixer
          </button>
        );
      }
    } else if (view === 'fixer' && job.status === 'assigned') {
      return (
        <Link to={`/chat/${job._id}`} className="btn btn-accent flex items-center">
          <MessageSquare size={16} className="mr-2" />
          Message Homeowner
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="card animate-fade-in">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
          <div className="mb-2 md:mb-0">
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-semibold">
                <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors">
                  {job.title}
                </Link>
              </h3>
              <span className={`badge ml-3 ${getStatusBadgeClass()}`}>
                {getStatusLabel()}
              </span>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                <span>{job.locationName || 'Local Area'}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
              {job.category && (
                <div className="flex items-center">
                  <Tag size={14} className="mr-1" />
                  <span className="capitalize">{job.category}</span>
                </div>
              )}
              
              {job.status === 'assigned' && (
                <div className="flex items-center">
                  <User size={14} className="mr-1" />
                  <span>
                    {view === 'homeowner' && job.assignedFixer
                      ? `Assigned to ${job.assignedFixer.fixerName}`
                      : view === 'fixer' && job.homeownerName
                      ? `Posted by ${job.homeownerName}`
                      : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action button */}
          <div className="flex-shrink-0">
            {renderActionButton()}
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-2 mb-3">{job.description}</p>
        
        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge badge-primary">{tag}</span>
            ))}
            {job.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{job.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;