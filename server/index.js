// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const chatRoutes = require('./routes/chat');
const ratingRoutes = require('./routes/ratings');
const llmRoutes = require('./routes/llmRoutes');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

// Verify environment variables
if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is not defined in environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_chat', (jobId) => {
    socket.join(jobId);
    console.log(`Client ${socket.id} joined chat room: ${jobId}`);
  });

  socket.on('send_message', async (messageData) => {
    try {
      console.log('Received message data:', messageData);
      
      if (!messageData.jobId || !messageData.content) {
        throw new Error('Missing required message data');
      }

      // Create message with proper structure
      const message = new Message({
        jobId: messageData.jobId,
        content: messageData.content,
        senderId: socket.user.userId,
        createdAt: new Date()
      });

      // Save the message
      await message.save();
      
      // Populate sender information
      await message.populate('senderId', 'name');
      
      const messageToSend = {
        _id: message._id,
        jobId: message.jobId,
        content: message.content,
        senderId: message.senderId._id,
        senderName: message.senderId.name,
        createdAt: message.createdAt
      };

      console.log('Broadcasting message:', messageToSend);
      
      // Broadcast to all clients in the chat room
      io.to(messageData.jobId).emit('receive_message', messageToSend);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ollama', llmRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  // Only show a generic error message to the client
  res.status(500).json({
    message: 'Something went wrong!'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    };

    console.log('MongoDB connection options:', options);

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Connected to MongoDB successfully');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Full error:', err);
  // Don't crash the server, just log the error
});

connectDB();