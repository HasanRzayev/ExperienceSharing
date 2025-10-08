# Chat System Setup Instructions

## Problem Fixed
The chat functionality was not working because:
1. The frontend was expecting a .NET backend with SignalR
2. Only a simple Node.js static file server was available
3. No API endpoints for chat functionality existed

## Solution Implemented
I've created a complete backend server with:
- Socket.IO for real-time messaging (replacing SignalR)
- REST API endpoints for user management and messages
- Mock authentication system for testing
- File upload support

## Files Created/Modified

### New Files:
- `backend-server.js` - Main backend server with Socket.IO and API endpoints
- `backend-package.json` - Backend dependencies
- `start-backend.bat` - Script to start backend server
- `start-chat-system.bat` - Script to start both frontend and backend
- `CHAT_SETUP_INSTRUCTIONS.md` - This instruction file

### Modified Files:
- `src/pages/ChatPage.js` - Updated to use Socket.IO instead of SignalR
- `package.json` - Added socket.io-client dependency and backend scripts

## How to Run the Chat System

### Option 1: Automated Setup (Recommended)
1. Double-click `start-chat-system.bat`
2. Wait for both servers to start
3. Open browser to `http://localhost:3000`

### Option 2: Manual Setup
1. Install frontend dependencies:
   ```bash
   npm install socket.io-client
   ```

2. Install backend dependencies:
   ```bash
   npm install express socket.io cors jsonwebtoken multer nodemon
   ```

3. Start backend server (in one terminal):
   ```bash
   node backend-server.js
   ```

4. Start frontend server (in another terminal):
   ```bash
   npm start
   ```

## Backend Server Details
- **Port**: 5029
- **API Base URL**: http://localhost:5029/api
- **Socket.IO URL**: http://localhost:5029

### API Endpoints:
- `GET /api/users/me` - Get current user profile
- `GET /api/Followers/followers` - Get user's followers
- `GET /api/Followers/senders` - Get users who follow current user
- `GET /api/messages/:userId` - Get messages between users
- `POST /api/upload` - Upload files

### Socket.IO Events:
- `SendMessage` - Send a message
- `ReceiveMessage` - Receive a message
- `join` - Join user room
- `messageSent` - Message sent confirmation

## Testing the Chat
1. Open the application in two different browser tabs/windows
2. Go to the chat page in both
3. Select different users to chat with
4. Send messages - they should appear in real-time

## Mock Data
The backend includes mock users and followers for testing:
- User 1: john_doe
- User 2: jane_smith  
- User 3: mike_wilson

## Troubleshooting
- If chat doesn't work, check browser console for errors
- Make sure both servers are running (frontend on 3000, backend on 5029)
- Check that socket.io-client is installed in frontend
- Verify backend dependencies are installed

## Production Notes
For production deployment:
1. Replace mock authentication with real JWT implementation
2. Use a real database instead of in-memory storage
3. Add proper error handling and validation
4. Configure environment variables properly
5. Add HTTPS support

