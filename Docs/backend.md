# Typer-99 Backend Documentation

This document provides detailed information about the Typer-99 backend implementation, including the server architecture, game logic, and Socket.IO communication.

## Backend Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Real-time Communication**: Socket.IO
- **Testing**: Jest
- **Utilities**: UUID for ID generation

## Directory Structure

```
server/
├── index.js                 # Server entry point
├── socket.js                # Socket.IO event handlers
├── wordlists/               # Word lists for game text
│   └── wordlist.js          # Word lists by difficulty
├── utils/                   # Utility functions
│   └── gameUtils.js         # Game-related helper functions
└── tests/                   # Server tests
    ├── gameUtils.test.js    # Tests for game utilities
    ├── socket.test.js       # Tests for socket handlers
    └── wordlist.test.js     # Tests for word lists
```

## Server Setup

The server is set up in `/server/index.js`:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const socketHandler = require('./socket');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://typer99.mewo.gay' 
    : ['http://localhost:3003', 'http://127.0.0.1:3003'],
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
      ? 'https://typer99.mewo.gay' 
      : ['http://localhost:3003', 'http://127.0.0.1:3003'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
socketHandler(io);

// Start server
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`Typer-99 server running on port ${PORT}`);
});
```

## Data Structures

The server uses in-memory data structures to manage game state:

```javascript
// Data stores
const lobbies = new Map(); // Store active lobbies
const games = new Map();   // Store active games
const players = new Map(); // Store player sessions
const disconnectTimeouts = new Map(); // Store timeout references for cleanup
```

### Lobby Structure

```javascript
{
  id: "lobby-uuid",
  gameMode: "free-for-all", // "1v1", "battle-royale", or "practice"
  players: [
    {
      id: "socket-id-1",
      nickname: "Player1",
      isReady: true,
      isHost: true,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      completedAt: null,
      connected: true
    },
    // More players...
  ],
  maxPlayers: 10,
  gameStarted: false,
  hostId: "socket-id-1",
  aiSettings: null // Only populated for "practice" mode
}
```

### Game Structure

```javascript
{
  id: "game-uuid",
  lobbyId: "lobby-uuid",
  players: [
    {
      id: "socket-id-1",
      nickname: "Player1",
      progress: 0,
      wpm: 0,
      accuracy: 100,
      completedAt: null,
      connected: true,
      score: 0,
      mistypedWords: 0
    },
    // More players...
  ],
  gameMode: "free-for-all",
  text: "The text players will type...",
  startTime: 1623456789000, // Timestamp
  endTime: null,
  state: "playing", // "countdown", "playing", "finished", "error"
  lastAttackCheck: 1623456789000, // For battle royale mode
  finishedPlayers: 0,
  aiSettings: null // Only populated for "practice" mode
}
```

## Core Game Logic

### Creating and Joining Lobbies

When a player creates or joins a lobby:

```javascript
socket.on('join_lobby', ({ nickname, lobbyId, gameMode, aiDifficulty }) => {
  try {
    // Create player object
    const player = {
      id: socket.id,
      nickname: nickname || `Player_${socket.id.substring(0, 4)}`,
      isReady: false,
      isHost: false,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      completedAt: null,
      connected: true
    };
    
    players.set(socket.id, player);
    let lobby;
    
    // Join existing lobby or create new one
    if (lobbyId && lobbies.has(lobbyId)) {
      lobby = lobbies.get(lobbyId);
      
      // Check if lobby is full or game already started
      if (lobby.players.length >= lobby.maxPlayers) {
        return socket.emit('error', { message: 'Lobby is full' });
      }
      
      if (lobby.gameStarted) {
        return socket.emit('error', { message: 'Game already in progress' });
      }
      
      // Add player to lobby
      lobby.players.push(player);
    } else {
      // Create new lobby
      const newLobbyId = lobbyId || uuidv4();
      player.isHost = true;
      
      lobby = {
        id: newLobbyId,
        gameMode: gameMode || 'free-for-all',
        players: [player],
        maxPlayers: getMaxPlayers(gameMode),
        gameStarted: false,
        hostId: socket.id,
        aiSettings: gameMode === 'practice' ? AI_SETTINGS[aiDifficulty || 'medium'] : null
      };
      
      lobbies.set(newLobbyId, lobby);
    }
    
    // Join socket room for the lobby
    socket.join(lobby.id);
    
    // Notify everyone in the lobby
    io.to(lobby.id).emit('player_joined', { 
      player,
      lobbyState: filterLobbyData(lobby)
    });
    
    // Send lobby data to the player
    socket.emit('lobby_joined', { lobby: filterLobbyData(lobby) });
  } catch (error) {
    console.error('Error in join_lobby:', error);
    socket.emit('error', { message: 'Failed to join lobby' });
  }
});
```

### Starting a Game

When the host starts the game:

```javascript
socket.on('start_game', ({ lobbyId }) => {
  try {
    if (!lobbies.has(lobbyId)) {
      return socket.emit('error', { message: 'Lobby not found' });
    }
    
    const lobby = lobbies.get(lobbyId);
    
    // Check if sender is host
    if (lobby.hostId !== socket.id) {
      return socket.emit('error', { message: 'Only host can start the game' });
    }
    
    // Generate game text and create game object
    const gameText = generateText(lobby.gameMode, lobby.players.length);
    const gameId = uuidv4();
    
    let players = [...lobby.players];
    
    // For practice mode, add an AI player
    if (lobby.gameMode === 'practice') {
      const aiSettings = lobby.aiSettings || AI_SETTINGS.medium;
      const aiPlayer = {
        id: `ai-${uuidv4()}`,
        nickname: `AI (${aiSettings.difficulty})`,
        isReady: true,
        isHost: false,
        progress: 0,
        wpm: aiSettings.baseWPM,
        accuracy: getRandomInRange(aiSettings.accuracyRange[0], aiSettings.accuracyRange[1]),
        completedAt: null,
        connected: true,
        isAI: true
      };
      
      players.push(aiPlayer);
    }
    
    const game = {
      id: gameId,
      lobbyId,
      players: players.map(p => ({ ...p })),
      gameMode: lobby.gameMode,
      text: gameText,
      startTime: Date.now() + 5000, // 5 second countdown
      endTime: null,
      state: 'countdown',
      lastAttackCheck: Date.now(),
      finishedPlayers: 0,
      aiSettings: lobby.aiSettings
    };
    
    games.set(gameId, game);
    lobby.gameStarted = true;
    lobby.gameId = gameId;
    
    // Notify players of countdown
    io.to(lobbyId).emit('game_starting', { countdown: 5 });
    
    // Start game after countdown
    setTimeout(() => {
      game.state = 'playing';
      io.to(lobbyId).emit('game_started', { 
        gameId,
        text: gameText,
        gameState: filterGameData(game)
      });
      
      // For Battle Royale mode, set up attack intervals
      if (game.gameMode === 'battle-royale') {
        setupBattleRoyaleAttacks(gameId, io);
      }
      
      // For practice mode, simulate AI typing
      if (game.gameMode === 'practice') {
        simulateAIProgress(game, io);
      }
    }, 5000);
  } catch (error) {
    console.error('Error in start_game:', error);
    socket.emit('error', { message: 'Failed to start game' });
  }
});
```

### Updating Player Progress

When a player's typing progress is updated:

```javascript
socket.on('update_progress', ({ gameId, progress, wpm, accuracy }) => {
  try {
    if (!games.has(gameId)) return;
    
    const game = games.get(gameId);
    const playerIndex = game.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex === -1) return;
    
    // Update player stats
    game.players[playerIndex].progress = progress;
    game.players[playerIndex].wpm = wpm;
    game.players[playerIndex].accuracy = accuracy;
    
    // Check for completion
    if (progress === 100 && !game.players[playerIndex].completedAt) {
      game.players[playerIndex].completedAt = Date.now();
      game.finishedPlayers++;
    }
    
    // Broadcast progress update
    io.to(game.lobbyId).emit('player_progress', {
      playerId: socket.id,
      progress,
      wpm,
      accuracy
    });
    
    // End game if all players have finished
    if (game.finishedPlayers === game.players.length) {
      endGame(game, io);
    }
  } catch (error) {
    console.error('Error in update_progress:', error);
  }
});
```

### Game Completion

When a player completes the game:

```javascript
socket.on('game_completed', ({ gameId, wpm, accuracy, time, mistypedWords = 0 }) => {
  try {
    if (!games.has(gameId)) return;
    
    const game = games.get(gameId);
    const playerIndex = game.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex === -1) return;
    
    // Mark player as completed
    game.players[playerIndex].completedAt = Date.now();
    game.players[playerIndex].wpm = wpm;
    game.players[playerIndex].accuracy = accuracy;
    game.players[playerIndex].progress = 100;
    game.players[playerIndex].mistypedWords = mistypedWords;
    game.finishedPlayers++;
    
    // Calculate score for this player
    game.players[playerIndex].score = calculatePlayerScore(game, game.players[playerIndex], 
      game.finishedPlayers === 1); // First to finish bonus
    
    // Broadcast completion
    io.to(game.lobbyId).emit('player_progress', {
      playerId: socket.id,
      progress: 100,
      wpm,
      accuracy,
      score: game.players[playerIndex].score,
      completed: true,
      mistypedWords
    });
    
    // End game when first player completes (after delay)
    setTimeout(() => {
      endGame(game, io);
    }, 3003);
    
  } catch (error) {
    console.error('Error in game_completed:', error);
  }
});
```

### Handling Disconnections

When a player disconnects:

```javascript
socket.on('disconnect', () => {
  try {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Find lobbies the player is in
    for (const [lobbyId, lobby] of lobbies.entries()) {
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        const player = lobby.players[playerIndex];
        
        // Handle active games
        if (lobby.gameStarted && games.has(lobby.gameId)) {
          const game = games.get(lobby.gameId);
          const gamePlayerIndex = game.players.findIndex(p => p.id === socket.id);
          
          if (gamePlayerIndex !== -1) {
            game.players[gamePlayerIndex].connected = false;
            
            // Check if we need to end the game
            const activePlayers = game.players.filter(p => p.connected).length;
            if (activePlayers <= 1 && game.state === 'playing') {
              endGame(game, io);
            }
          }
        }
        
        // Remove player after grace period
        const timeoutId = setTimeout(() => {
          // Check if player reconnected
          if (players.has(socket.id)) return;
          
          // Remove from lobby
          if (lobbies.has(lobbyId)) {
            const currentLobby = lobbies.get(lobbyId);
            currentLobby.players = currentLobby.players.filter(p => p.id !== socket.id);
            
            // Reassign host if needed
            if (currentLobby.hostId === socket.id && currentLobby.players.length > 0) {
              currentLobby.hostId = currentLobby.players[0].id;
              currentLobby.players[0].isHost = true;
            }
            
            // Delete empty lobbies
            if (currentLobby.players.length === 0) {
              lobbies.delete(lobbyId);
            } else {
              // Notify remaining players
              io.to(lobbyId).emit('player_left', { 
                playerId: socket.id,
                lobbyState: filterLobbyData(currentLobby)
              });
            }
          }
          
          // Clean up the timeout reference
          disconnectTimeouts.delete(socket.id);
        }, 20000); // 20 second grace period
        
        // Store the timeout reference
        disconnectTimeouts.set(socket.id, timeoutId);
      }
    }
    
    // Remove player from session map
    players.delete(socket.id);
  } catch (error) {
    console.error('Error handling disconnect:', error);
  }
});
```

## Game Utilities

The `/server/utils/gameUtils.js` file contains essential functions for the game mechanics:

### Text Generation

```javascript
function generateText(gameMode, playerCount) {
  const { easyWords, mediumWords, hardWords } = wordLists;
  let words = [];
  let wordCount;
  
  switch (gameMode) {
    case '1v1':
      // Medium difficulty, ~30 words
      wordCount = 30;
      words = getRandomWords(mediumWords, wordCount);
      break;
    
    case 'battle-royale':
      // Mixed difficulty, scales with player count
      wordCount = 20 + Math.min(playerCount * 2, 40);
      words = [
        ...getRandomWords(easyWords, Math.floor(wordCount * 0.3)),
        ...getRandomWords(mediumWords, Math.floor(wordCount * 0.5)),
        ...getRandomWords(hardWords, Math.floor(wordCount * 0.2))
      ];
      // Shuffle the words
      words = shuffleArray(words);
      break;
    
    case 'free-for-all':
    default:
      // Medium difficulty, ~25 words
      wordCount = 25;
      words = getRandomWords(mediumWords, wordCount);
      break;
  }
  
  return words.join(' ');
}
```

### WPM Calculation

```javascript
function calculateWPM(characterCount, timeInSeconds) {
  const averageWordLength = 5;
  const minutes = timeInSeconds / 60;
  return Math.round((characterCount / averageWordLength) / minutes);
}
```

## Server Testing

The server is tested using Jest. Here's a sample test for the word list functionality:

```javascript
// In /server/tests/wordlist.test.js
describe('Word Lists', () => {
  test('should export easy, medium and hard word lists', () => {
    expect(wordLists).toHaveProperty('easyWords');
    expect(wordLists).toHaveProperty('mediumWords');
    expect(wordLists).toHaveProperty('hardWords');
  });

  test('easyWords should be an array of strings', () => {
    expect(Array.isArray(wordLists.easyWords)).toBe(true);
    expect(wordLists.easyWords.length).toBeGreaterThan(0);
    wordLists.easyWords.forEach(word => {
      expect(typeof word).toBe('string');
    });
  });

  test('should have correctly categorized words by length', () => {
    const avgEasyLength = wordLists.easyWords.reduce((sum, word) => sum + word.length, 0) / wordLists.easyWords.length;
    const avgHardLength = wordLists.hardWords.reduce((sum, word) => sum + word.length, 0) / wordLists.hardWords.length;
    
    expect(avgEasyLength).toBeLessThan(avgHardLength);
  });
});
```

## Performance Considerations

1. **In-Memory Data Storage**: The server uses JavaScript Maps for efficient lookup, insertion, and deletion of lobbies, games, and player data.

2. **Throttled Updates**: Progress updates are throttled on both client and server to reduce network traffic.

3. **Cleanup Routines**: Completed games and empty lobbies are automatically cleaned up to prevent memory leaks.

4. **Connection Management**: Disconnected players are given a grace period to reconnect before being removed.

5. **Error Handling**: Comprehensive error handling prevents server crashes from individual client issues.

## Environment Configuration

The server can be configured using environment variables:

- `PORT`: The port the server listens on (default: 3004)
- `NODE_ENV`: "development" or "production" (affects CORS settings)

## Deployment Considerations

For production deployment, consider:

1. **Load Balancing**: Multiple server instances with sticky sessions for Socket.IO
2. **Persistence**: Adding a database for storing user accounts and game records
3. **Monitoring**: Adding metrics collection for tracking server performance
4. **Rate Limiting**: Adding protection against abuse
