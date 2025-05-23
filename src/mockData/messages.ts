import { MessageType } from '../types/chat';

// Mock messages data to use while developing the frontend
export const mockMessages: MessageType[] = [
  // Conversation for job-002
  {
    jobId: 'job-002',
    senderId: 'other-user',
    senderName: 'Sarah Johnson',
    senderRole: 'homeowner',
    recipientId: 'mock-user-id',
    message: 'Hi Jane, I accepted your application for the ceiling fan installation. When would you be available to come by?',
    createdAt: '2025-03-30T09:15:00Z'
  },
  {
    jobId: 'job-002',
    senderId: 'mock-user-id',
    senderName: 'Jane Smith',
    senderRole: 'fixer',
    recipientId: 'other-user',
    message: 'Hi Sarah, thanks for accepting! I could come by tomorrow afternoon around 2 PM if that works for you?',
    createdAt: '2025-03-30T10:30:00Z'
  },
  {
    jobId: 'job-002',
    senderId: 'other-user',
    senderName: 'Sarah Johnson',
    senderRole: 'homeowner',
    recipientId: 'mock-user-id',
    message: '2 PM tomorrow works perfectly. My address is 123 Washington St. I will have the fan box unpacked and ready.',
    createdAt: '2025-03-30T11:05:00Z'
  },
  {
    jobId: 'job-002',
    senderId: 'mock-user-id',
    senderName: 'Jane Smith',
    senderRole: 'fixer',
    recipientId: 'other-user',
    message: 'Great, I will see you then! Do you have a ladder or should I bring mine?',
    createdAt: '2025-03-30T11:20:00Z'
  },
  {
    jobId: 'job-002',
    senderId: 'other-user',
    senderName: 'Sarah Johnson',
    senderRole: 'homeowner',
    recipientId: 'mock-user-id',
    message: 'I have a 6-foot ladder, but the ceiling is 9 feet. If you have a taller one, that would be helpful.',
    createdAt: '2025-03-30T11:25:00Z'
  },
  {
    jobId: 'job-002',
    senderId: 'mock-user-id',
    senderName: 'Jane Smith',
    senderRole: 'fixer',
    recipientId: 'other-user',
    message: 'No problem, I will bring my 8-foot ladder. See you tomorrow!',
    createdAt: '2025-03-30T11:30:00Z'
  },
  
  // Conversation for job-003 (completed)
  {
    jobId: 'job-003',
    senderId: 'mock-user-id',
    senderName: 'John Doe',
    senderRole: 'homeowner',
    recipientId: 'fixer-002',
    message: 'Hi Robert, thanks for accepting the bathroom tile job. When can you start?',
    createdAt: '2025-03-16T08:20:00Z'
  },
  {
    jobId: 'job-003',
    senderId: 'fixer-002',
    senderName: 'Robert Chen',
    senderRole: 'fixer',
    recipientId: 'mock-user-id',
    message: 'Good morning John. I can start tomorrow morning around 9 AM if that works for you?',
    createdAt: '2025-03-16T08:45:00Z'
  },
  {
    jobId: 'job-003',
    senderId: 'mock-user-id',
    senderName: 'John Doe',
    senderRole: 'homeowner',
    recipientId: 'fixer-002',
    message: '9 AM tomorrow is perfect. My address is 456 Grove St. Should I purchase any additional materials?',
    createdAt: '2025-03-16T09:10:00Z'
  },
  {
    jobId: 'job-003',
    senderId: 'fixer-002',
    senderName: 'Robert Chen',
    senderRole: 'fixer',
    recipientId: 'mock-user-id',
    message: 'I will bring all the necessary materials. Do you have the extra tiles ready? Also, could you send me a photo of the damaged area so I can better prepare?',
    createdAt: '2025-03-16T09:30:00Z'
  },
  {
    jobId: 'job-003',
    senderId: 'mock-user-id',
    senderName: 'John Doe',
    senderRole: 'homeowner',
    recipientId: 'fixer-002',
    message: 'Yes, I have about 10 extra tiles. I will send you a photo shortly. The bathroom will be free all day tomorrow.',
    createdAt: '2025-03-16T09:45:00Z'
  }
];