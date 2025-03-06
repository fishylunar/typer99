const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const socketHandler = require('./socket');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://typer99.example.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Basic routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://typer99.example.com' 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
socketHandler(io);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Typer-99 server running on port ${PORT}`);
});
