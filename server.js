const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing - send all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// HTTP server (redirect to HTTPS in production)
app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
  console.log(`Redirecting to HTTPS...`);
});

// HTTPS server
if (fs.existsSync('./certs/server.crt') && fs.existsSync('./certs/server.key')) {
  const httpsOptions = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
    console.log(`Visit: https://localhost:${HTTPS_PORT}`);
  });
} else {
  console.log('SSL certificates not found. Run certs/generate-cert.bat first.');
}

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
