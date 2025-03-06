const socketHandler = require('../socket');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');

describe('Socket Handler', () => {
  let io, clientSocket, httpServer;
  const port = process.env.TEST_PORT || Math.floor(3003 + Math.random() * 1000);
  
  // Set up a simple test server
  beforeAll((done) => {
    // Create HTTP server
    httpServer = http.createServer();
    
    // Set up Socket.IO server
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    // Apply socket handlers
    socketHandler(io);
    
    // Start server on specific port
    httpServer.listen(port, () => {
      // Connect test client
      clientSocket = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true,
        reconnectionAttempts: 0
      });
      
      clientSocket.on('connect', () => {
        console.log('Test client connected');
        done();
      });
      
      clientSocket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        done(err);
      });
    });
  }, 10000);

  // Proper cleanup after all tests
  afterAll((done) => {
    // Cleanup the socketHandler resources first
    socketHandler.cleanup();
    
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    
    if (httpServer.listening) {
      io.close();
      httpServer.close(() => {
        console.log('Test server closed');
        done();
      });
    } else {
      done();
    }
  });

  // Simplified test that just verifies connectivity
  test('should connect successfully', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });
  
  // Keep one simple lobby test to verify functionality
  test('should create a lobby', (done) => {
    clientSocket.once('lobby_joined', (data) => {
      expect(data).toHaveProperty('lobby');
      expect(data.lobby.gameMode).toBe('free-for-all');
      done();
    });
    
    clientSocket.emit('join_lobby', {
      nickname: 'TestPlayer',
      gameMode: 'free-for-all'
    });
  });
});
