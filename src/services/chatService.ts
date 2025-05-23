import { io, Socket } from 'socket.io-client';
import api from './api';
import { MessageType } from '../types/chat';

const SOCKET_URL = 'http://localhost:5000';
let socket: Socket | null = null;

// Initialize socket connection
const initializeSocket = () => {
  const token = localStorage.getItem('fixitlocal-token');
  const newSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  newSocket.on('connect', () => {
    console.log('Connected to chat server');
  });

  newSocket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  newSocket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return newSocket;
};

// Join a specific chat room
export const joinChat = (jobId: string) => {
  if (!socket) {
    socket = initializeSocket();
  }
  socket.emit('join_chat', jobId);
};

// Send a message
export const sendMessage = async (messageData: MessageType): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      socket = initializeSocket();
    }

    // Set a timeout for message sending
    const timeout = setTimeout(() => {
      reject(new Error('Message send timeout'));
    }, 10000); // Increased timeout to 10 seconds

    socket.emit('send_message', {
      jobId: messageData.jobId,
      content: messageData.content
    });

    // Listen for the message to be received back from the server
    const messageHandler = (receivedMessage: MessageType) => {
      if (receivedMessage.jobId === messageData.jobId && 
          receivedMessage.content === messageData.content) {
        clearTimeout(timeout);
        socket?.off('receive_message', messageHandler);
        resolve();
      }
    };

    socket.on('receive_message', messageHandler);

    // Handle errors
    const errorHandler = (error: string) => {
      clearTimeout(timeout);
      socket?.off('error', errorHandler);
      socket?.off('receive_message', messageHandler);
      reject(new Error(error));
    };

    socket.on('error', errorHandler);
  });
};

// Fetch chat history
export const fetchMessages = async (jobId: string): Promise<MessageType[]> => {
  try {
    const response = await api.get(`/chat/${jobId}`);
    return response.data;
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
    if (socket) {
      socket.off('receive_message', callback);
    }
  };
};

// Cleanup socket connection
export const cleanup = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};