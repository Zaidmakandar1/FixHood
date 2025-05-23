import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ChevronLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import useUserRole from '../../hooks/useUserRole';
import { fetchJobById, completeJob } from '../../services/jobService';
import { 
  fetchMessages, 
  sendMessage, 
  joinChat, 
  subscribeToMessages, 
  cleanup 
} from '../../services/chatService';
import { JobType } from '../../types/job';
import { MessageType } from '../../types/chat';

const ChatPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useUser();
  const { role } = useUserRole();
  
  const [job, setJob] = useState<JobType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Determine other user based on role
  const otherUser = role === 'homeowner' && job?.assignedFixer
    ? { id: job.assignedFixer.fixerId, name: job.assignedFixer.fixerName }
    : role === 'fixer' && job?.homeownerId
    ? { id: job.homeownerId, name: job.homeownerName || 'Homeowner' }
    : null;
  
  // Load job and chat history
  useEffect(() => {
    const loadJobAndMessages = async () => {
      if (!jobId) return;
      
      try {
        const [fetchedJob, fetchedMessages] = await Promise.all([
          fetchJobById(jobId),
          fetchMessages(jobId)
        ]);
        
        setJob(fetchedJob);
        setMessages(fetchedMessages);
        
        // Join the chat room
        joinChat(jobId);
      } catch (error) {
        console.error('Error loading chat data:', error);
        setError('Failed to load conversation history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobAndMessages();
    
    // Subscribe to new messages
    const unsubscribe = subscribeToMessages((message) => {
      if (message.jobId === jobId) {
        setMessages(prev => [...prev, message]);
      }
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanup();
    };
  }, [jobId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !jobId) return;
    
    setIsSending(true);
    
    try {
      const messageData: MessageType = {
        jobId,
        content: newMessage.trim(),
        senderId: user.id,
        createdAt: new Date().toISOString()
      };
      
      await sendMessage(messageData);
      
      // Clear the input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCompleteJob = async () => {
    if (!job || !jobId) return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      await completeJob(jobId);
      
      // Update local job status
      setJob(prev => {
        if (!prev) return null;
        return { ...prev, status: 'completed' };
      });
      
      setSuccess('Job has been marked as complete! You can now leave a review for the fixer.');
    } catch (error) {
      console.error('Error completing job:', error);
      setError('Failed to complete the job. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!job || !otherUser) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h2 className="text-xl font-bold text-red-700 mb-2">Conversation Not Found</h2>
          <p className="text-red-600 mb-4">
            We couldn't find this conversation. It may have been removed or you may have followed an invalid link.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-6 max-w-4xl">
      {/* Job header */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <ChevronLeft size={16} />
              <span>Conversation with {otherUser.name}</span>
            </div>
          </div>
          
          {/* Complete job button (for homeowner only) */}
          {role === 'homeowner' && job.status === 'assigned' && (
            <button 
              onClick={handleCompleteJob}
              disabled={isCompleting}
              className="btn btn-success flex items-center"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Mark Complete
                </>
              )}
            </button>
          )}
          
          {/* Show badge if job is completed */}
          {job.status === 'completed' && (
            <span className="badge bg-success-100 text-success-800 flex items-center">
              <CheckCircle size={14} className="mr-1" />
              Completed
            </span>
          )}
        </div>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 flex items-start">
          <CheckCircle size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6 flex items-start">
          <XCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Chat container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-300px)] flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-medium text-gray-700 mb-1">No messages yet</h2>
              <p className="text-gray-500">Start the conversation with {otherUser.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble 
                  key={index}
                  message={message}
                  isSentByCurrentUser={message.senderId === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              className="input flex-1"
              placeholder={`Message ${otherUser.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={job.status === 'completed'}
            />
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={!newMessage.trim() || isSending || job.status === 'completed'}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          
          {job.status === 'completed' && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              This conversation is archived because the job is completed.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

type MessageBubbleProps = {
  message: MessageType;
  isSentByCurrentUser: boolean;
};

const MessageBubble = ({ message, isSentByCurrentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isSentByCurrentUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
          {message.senderName || 'Unknown'} • {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatPage;