import { io, Socket } from 'socket.io-client';
import { MessageType } from '../types/chat';

const SOCKET_URL = 'http://localhost:5000';
let socket: Socket | null = null;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('fixitlocal-token');
};

// Initialize socket connection
export const initializeSocket = () => {
  if (!socket) {
    const token = getAuthToken();
    socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });
    
    socket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

// Join a specific chat room
export const joinChat = (jobId: string) => {
  if (!socket) {
    socket = initializeSocket();
  }
  socket.emit('join_chat', jobId);
};

// Send a message
export const sendMessage = async (messageData: MessageType): Promise<MessageType> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      socket = initializeSocket();
    }
    
    socket.emit('send_message', messageData);
    
    // Wait for confirmation that the message was saved
    socket.once('receive_message', (message: MessageType) => {
      if (message.senderId === messageData.senderId) {
        resolve(message);
      }
    });
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      reject(new Error('Message send timeout'));
    }, 5000);
  });
};

// Fetch chat history
export const fetchMessages = async (jobId: string): Promise<MessageType[]> => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${SOCKET_URL}/api/chat/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching messages for job ${jobId}:`, error);
    throw error;
  }
};

// Subscribe to new messages
export const subscribeToMessages = (callback: (message: MessageType) => void) => {
  if (!socket) {
    socket = initializeSocket();
  }
  
  socket.on('receive_message', callback);
  
  // Return unsubscribe function
  return () => {
    socket.off('receive_message', callback);
  };
};

// Clean up socket connection
export const cleanup = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};