@echo off
echo Installing backend dependencies...
npm install express socket.io cors jsonwebtoken multer nodemon

echo Starting backend server...
node backend-server.js

pause

