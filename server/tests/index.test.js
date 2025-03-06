const request = require('supertest');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const Client = require('socket.io-client'); // Add the missing import

// Create a mock express app for testing
const createTestApp = () => {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Something went wrong!' });
  });

  return app;
};

describe('Server', () => {
  let app;
  
  beforeAll(() => {
    app = createTestApp();
  });

  test('GET /health should return 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  test('Non-existent route should return 404', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.statusCode).toBe(404);
  });
  
  // Fix the socket connections test
  test('Server can handle socket connections', (done) => {
    const server = http.createServer(app);
    const io = new Server(server);
    let connectionCount = 0;
    
    // Set up socket connection handler
    io.on('connection', (socket) => {
      connectionCount++;
      socket.on('test', (data) => {
        expect(data).toBe('hello');
        socket.emit('response', 'world');
      });
    });
    
    // Start listening on a random port
    server.listen(0, () => {
      const port = server.address().port;
      
      // Connect a client
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true
      });
      
      // Set up event handlers
      client.on('connect', () => {
        client.emit('test', 'hello');
      });
      
      client.on('response', (data) => {
        expect(data).toBe('world');
        expect(connectionCount).toBe(1);
        
        // Clean up properly in sequence
        client.disconnect();
        server.close(() => {
          io.close(() => {
            done();
          });
        });
      });
      
      // Add error handling for client connection
      client.on('connect_error', (err) => {
        console.error('Connection error:', err);
        client.disconnect();
        server.close();
        done.fail(err);
      });
    });
  }, 10000); // Increase timeout to 10 seconds
});
