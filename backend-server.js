const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const PORT = process.env.PORT || 5029;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mock data storage (in real app, use database)
const users = new Map();
const messages = new Map();
const followers = new Map();

// Mock JWT secret (in real app, use proper secret)
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, create a mock user for testing
    console.log('Invalid token, using mock user for testing');
    req.user = { id: '1', userName: 'test_user', email: 'test@example.com' };
    
    // Ensure mock user exists in users map
    if (!users.has('1')) {
      users.set('1', {
        id: '1',
        userName: 'test_user',
        email: 'test@example.com',
        profileImage: 'https://via.placeholder.com/150'
      });
    }
    
    next();
  }
};

// Initialize mock data
const initializeMockData = () => {
  // Mock users
  const mockUsers = [
    { id: '1', userName: 'john_doe', email: 'john@example.com', profileImage: 'https://via.placeholder.com/150' },
    { id: '2', userName: 'jane_smith', email: 'jane@example.com', profileImage: 'https://via.placeholder.com/150' },
    { id: '3', userName: 'mike_wilson', email: 'mike@example.com', profileImage: 'https://via.placeholder.com/150' }
  ];
  
  mockUsers.forEach(user => {
    users.set(user.id, user);
  });
  
  // Mock followers
  followers.set('1', ['2', '3']); // User 1 follows users 2 and 3
  followers.set('2', ['1']); // User 2 follows user 1
  
  console.log('Mock data initialized');
};

// API Routes

// Auth endpoints
app.post('/api/Auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock login - in real app, verify against database
  const mockUsers = [
    { id: '1', userName: 'john_doe', email: 'john@example.com', password: 'password123' },
    { id: '2', userName: 'jane_smith', email: 'jane@example.com', password: 'password123' },
    { id: '3', userName: 'mike_wilson', email: 'mike@example.com', password: 'password123' }
  ];
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign(
      { id: user.id, userName: user.userName, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        profileImage: 'https://via.placeholder.com/150'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/Auth/register', (req, res) => {
  const { firstName, lastName, email, password, userName } = req.body;
  
  // Mock registration - in real app, save to database
  const newUser = {
    id: Date.now().toString(),
    firstName,
    lastName,
    userName,
    email,
    password,
    profileImage: 'https://via.placeholder.com/150'
  };
  
  const token = jwt.sign(
    { id: newUser.id, userName: newUser.userName, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: newUser.id,
      userName: newUser.userName,
      email: newUser.email,
      profileImage: newUser.profileImage
    }
  });
});

// Get current user profile
app.get('/api/users/me', verifyToken, (req, res) => {
  console.log('Request user:', req.user);
  console.log('Users map contents:', Array.from(users.entries()));
  const user = users.get(req.user.id);
  console.log('Found user in map:', user);
  
  if (user) {
    // User objesine id alanını ekle
    const userWithId = {
      ...user,
      id: req.user.id,
      userId: req.user.id,
      profileImage: user.profileImage || 'https://via.placeholder.com/150'
    };
    console.log('Sending user with ID:', userWithId);
    res.json(userWithId);
  } else {
    console.log('User not found in map, creating default user');
    // Create a default user if not found
    const defaultUser = {
      id: req.user.id,
      userId: req.user.id,
      userName: req.user.userName || 'test_user',
      email: req.user.email || 'test@example.com',
      profileImage: 'https://via.placeholder.com/150'
    };
    console.log('Sending default user:', defaultUser);
    res.json(defaultUser);
  }
});

// Get followers
app.get('/api/Followers/followers', verifyToken, (req, res) => {
  const userFollowers = followers.get(req.user.id) || [];
  const followerUsers = userFollowers.map(id => users.get(id)).filter(Boolean);
  res.json(followerUsers);
});

// Get users who follow me (senders)
app.get('/api/Followers/senders', verifyToken, (req, res) => {
  const senders = [];
  for (const [userId, userFollowers] of followers.entries()) {
    if (userFollowers.includes(req.user.id)) {
      senders.push(users.get(userId));
    }
  }
  res.json(senders);
});

// Get messages between users
app.get('/api/messages/:userId', verifyToken, (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  
  // Create conversation key
  const conversationKey = [currentUserId, userId].sort().join('-');
  const conversationMessages = messages.get(conversationKey) || [];
  
  res.json(conversationMessages);
});

// File upload endpoint
app.post('/api/upload', verifyToken, (req, res) => {
  // Mock file upload response
  res.json({
    url: 'https://via.placeholder.com/300',
    type: 'image',
    name: 'uploaded-file.jpg'
  });
});


// Experiences endpoints
app.get('/api/Experiences', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 8;
  
  // Mock experiences data
  const mockExperiences = [
    {
      id: '1',
      title: 'Amazing Trip to Paris',
      description: 'Had an incredible time exploring the City of Light...',
      location: 'Paris, France',
      date: '2024-01-15',
      rating: 5,
      imageUrls: [{ url: 'https://via.placeholder.com/400x300' }],
      user: {
        id: '1',
        userName: 'john_doe',
        profileImage: 'https://via.placeholder.com/150'
      }
    },
    {
      id: '2',
      title: 'Mountain Adventure',
      description: 'Climbed the highest peak and enjoyed breathtaking views...',
      location: 'Swiss Alps',
      date: '2024-01-10',
      rating: 4,
      imageUrls: [{ url: 'https://via.placeholder.com/400x300' }],
      user: {
        id: '2',
        userName: 'jane_smith',
        profileImage: 'https://via.placeholder.com/150'
      }
    },
    {
      id: '3',
      title: 'Beach Paradise',
      description: 'Relaxed on pristine beaches and enjoyed crystal clear waters...',
      location: 'Maldives',
      date: '2024-01-05',
      rating: 5,
      imageUrls: [{ url: 'https://via.placeholder.com/400x300' }],
      user: {
        id: '3',
        userName: 'mike_wilson',
        profileImage: 'https://via.placeholder.com/150'
      }
    }
  ];
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExperiences = mockExperiences.slice(startIndex, endIndex);
  
  res.json(paginatedExperiences);
});

app.get('/api/Experiences/search', (req, res) => {
  const query = req.query.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 8;
  
  // Mock search - in real app, search in database
  const mockExperiences = [
    {
      id: '1',
      title: 'Amazing Trip to Paris',
      description: 'Had an incredible time exploring the City of Light...',
      location: 'Paris, France',
      date: '2024-01-15',
      rating: 5,
      imageUrls: [{ url: 'https://via.placeholder.com/400x300' }],
      user: {
        id: '1',
        userName: 'john_doe',
        profileImage: 'https://via.placeholder.com/150'
      }
    }
  ];
  
  // Simple search filter
  const filteredExperiences = mockExperiences.filter(exp => 
    exp.title.toLowerCase().includes(query.toLowerCase()) ||
    exp.description.toLowerCase().includes(query.toLowerCase()) ||
    exp.location.toLowerCase().includes(query.toLowerCase())
  );
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExperiences = filteredExperiences.slice(startIndex, endIndex);
  
  res.json(paginatedExperiences);
});

// Socket.IO connection handling
io.use((socket, next) => {
  // Authenticate socket connection
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('Socket connection rejected: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.userName = decoded.userName;
    console.log('Socket authenticated for user:', decoded.userName);
    next();
  } catch (error) {
    console.log('Socket connection rejected: Invalid token');
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);
  
  // Join user to their personal room
  socket.on('join', (userId) => {
    // Verify that the user is trying to join their own room
    if (userId !== socket.userId) {
      console.log('Unauthorized join attempt:', userId, 'by user:', socket.userId);
      return;
    }
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });
  
  // Handle message sending
  socket.on('SendMessage', (messageData) => {
    console.log('Received message:', messageData);
    console.log('Sender ID from data:', messageData.senderId);
    console.log('Receiver ID:', messageData.receiverId);
    
    // Validate message data and ensure sender is authenticated user
    if (!messageData.receiverId) {
      socket.emit('error', { message: 'Invalid message data: receiver ID required' });
      return;
    }
    
    // Use authenticated user ID as sender
    messageData.senderId = socket.userId;
    console.log('Using authenticated sender ID:', messageData.senderId);
    
    // Store message
    const conversationKey = [messageData.senderId, messageData.receiverId].sort().join('-');
    if (!messages.has(conversationKey)) {
      messages.set(conversationKey, []);
    }
    
    const messageWithId = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    messages.get(conversationKey).push(messageWithId);
    
    // Send message to receiver (receiver will see it as coming from sender)
    console.log(`Sending message to receiver ${messageData.receiverId}`);
    console.log('Message being sent:', messageWithId);
    io.to(`user_${messageData.receiverId}`).emit('ReceiveMessage', messageWithId);
    
    // Also send the message back to sender so they can see their own message
    socket.emit('ReceiveMessage', messageWithId);
    
    // Send confirmation to sender
    socket.emit('messageSent', messageWithId);
    
    console.log(`Message sent from ${messageData.senderId} to ${messageData.receiverId}`);
  });
  
  // Handle authentication (optional for testing)
  socket.on('authenticate', (token) => {
    console.log('Authentication attempt with token:', token ? 'provided' : 'none');
    // For testing, we'll accept any connection
    socket.emit('authenticated', { success: true });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize mock data on startup
initializeMockData();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 API endpoints available at http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
