# Typer-99 API Reference

This document provides a comprehensive reference for all Socket.IO events used in Typer-99, including their payloads and expected responses.

## Table of Contents
- [Connection Events](#connection-events)
- [Lobby Events](#lobby-events)
- [Game Events](#game-events)
- [Battle Royale Events](#battle-royale-events)
- [Error Handling](#error-handling)

## Connection Events

### `connect`

Emitted automatically when a client connects to the Socket.IO server.

**Client Implementation:**
```typescript
const socket = getSocket();
socket.on('connect', () => {
  console.log('Connected to server with socket id:', socket.id);
});
```

### `disconnect`

Emitted automatically when a client disconnects from the server.

**Client Implementation:**
```typescript
socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
});
```

**Server Implementation:**
```javascript
socket.on('disconnect', () => {
  console.log(`Player disconnected: ${socket.id}`);
  
  // Handle player disconnection logic
  // Mark player as disconnected in active games
  // Start grace period countdown
  // Reassign host if needed
});
```

## Lobby Events

### `join_lobby` (Client → Server)

Sent by a client to join an existing lobby or create a new one.

**Parameters:**
```typescript
{
  nickname: string;       // Player's display name
  lobbyId?: string;       // Optional ID of an existing lobby to join
  gameMode?: GameMode;    // Game mode for new lobbies ('1v1', 'free-for-all', 'battle-royale', 'practice')
  aiDifficulty?: string;  // AI difficulty for practice mode ('easy', 'medium', 'hard', 'expert')
}
```

**Client Implementation:**
```typescript
function joinLobby(params) {
  emitEvent('join_lobby', params);
}

// Example: Create a new lobby
joinLobby({
  nickname: 'PlayerOne',
  gameMode: 'free-for-all'
});

// Example: Join an existing lobby
joinLobby({
  nickname: 'PlayerTwo',
  lobbyId: 'existing-lobby-id'
});
```

### `lobby_joined` (Server → Client)

Sent by the server when a player successfully joins a lobby.

**Parameters:**
```typescript
{
  lobby: {
    id: string;              // Unique lobby ID
    gameMode: string;        // Game mode
    players: Player[];       // Array of players in the lobby
    maxPlayers: number;      // Maximum number of players
    gameStarted: boolean;    // Whether the game has started
    hostId: string;          // ID of the host player
    aiSettings?: AISettings; // AI settings for practice mode
  }
}
```

**Client Implementation:**
```typescript
socket.on('lobby_joined', ({ lobby }) => {
  console.log('Joined lobby:', lobby.id);
  // Update UI with lobby information
});
```

### `player_joined` (Server → Client)

Sent to all clients in a lobby when a new player joins.

**Parameters:**
```typescript
{
  player: Player;        // The player who joined
  lobbyState: Lobby;     // Updated lobby state
}
```

**Client Implementation:**
```typescript
socket.on('player_joined', ({ player, lobbyState }) => {
  console.log(`Player ${player.nickname} joined the lobby`);
  // Update lobby state in UI
});
```

### `player_left` (Server → Client)

Sent to all clients in a lobby when a player leaves or disconnects.

**Parameters:**
```typescript
{
  playerId: string;      // ID of the player who left
  lobbyState: Lobby;     // Updated lobby state
}
```

**Client Implementation:**
```typescript
socket.on('player_left', ({ playerId, lobbyState }) => {
  console.log(`Player ${playerId} left the lobby`);
  // Update lobby state in UI
});
```

### `lobby_reset` (Server → Client)

Sent by the server when a game ends and the lobby is reset for a new game.

**Parameters:**
```typescript
{
  lobby: Lobby;          // Reset lobby state
}
```

**Client Implementation:**
```typescript
socket.on('lobby_reset', ({ lobby }) => {
  console.log('Lobby has been reset');
  // Update UI to show the lobby is ready for a new game
});
```

### `start_game` (Client → Server)

Sent by the host client to start a game.

**Parameters:**
```typescript
{
  lobbyId: string;       // ID of the lobby to start the game for
}
```

**Client Implementation:**
```typescript
function startGame(lobbyId) {
  emitEvent('start_game', { lobbyId });
}
```

## Game Events

### `game_starting` (Server → Client)

Sent by the server when a game is about to start, initiating the countdown.

**Parameters:**
```typescript
{
  countdown: number;     // Countdown in seconds
}
```

**Client Implementation:**
```typescript
socket.on('game_starting', ({ countdown }) => {
  console.log(`Game starting in ${countdown} seconds`);
  // Show countdown UI
});
```

### `game_started` (Server → Client)

Sent by the server when a game has started and is ready for players to begin typing.

**Parameters:**
```typescript
{
  gameId: string;        // ID of the started game
  text: string;          // Text for players to type
  gameState: Game;       // Initial game state
}
```

**Client Implementation:**
```typescript
socket.on('game_started', ({ gameId, text, gameState }) => {
  console.log('Game started with ID:', gameId);
  // Initialize typing interface with text
  // Store game state
});
```

### `update_progress` (Client → Server)

Sent by a client to update their typing progress.

**Parameters:**
```typescript
{
  gameId: string;        // Game ID
  progress: number;      // Progress percentage (0-100)
  wpm: number;           // Words per minute
  accuracy: number;      // Accuracy percentage
}
```

**Client Implementation:**
```typescript
function updateProgress(gameId, progress, wpm, accuracy) {
  emitEvent('update_progress', {
    gameId,
    progress,
    wpm,
    accuracy
  });
}
```

### `player_progress` (Server → Client)

Sent by the server to all clients when a player's progress is updated.

**Parameters:**
```typescript
{
  playerId: string;      // Player ID
  progress: number;      // Progress percentage
  wpm: number;           // Words per minute
  accuracy: number;      // Accuracy percentage
  completed?: boolean;   // Whether the player completed the text
  score?: number;        // Player's score (if completed)
  mistypedWords?: number; // Number of mistyped words (if completed)
}
```

**Client Implementation:**
```typescript
socket.on('player_progress', ({ playerId, progress, wpm, accuracy, completed }) => {
  // Update the UI to reflect the player's progress
  if (completed) {
    console.log(`Player ${playerId} completed with ${wpm} WPM and ${accuracy}% accuracy`);
  }
});
```

### `game_completed` (Client → Server)

Sent by a client when they finish typing the entire text.

**Parameters:**
```typescript
{
  gameId: string;        // Game ID
  wpm: number;           // Final words per minute
  accuracy: number;      // Final accuracy percentage
  time: number;          // Time taken in seconds
  mistypedWords?: number; // Number of mistyped words
}
```

**Client Implementation:**
```typescript
function completeGame(gameId, wpm, accuracy, timeInSeconds, mistypedWords) {
  emitEvent('game_completed', {
    gameId,
    wpm,
    accuracy,
    time: timeInSeconds,
    mistypedWords
  });
}
```

### `game_ended` (Server → Client)

Sent by the server when a game has ended.

**Parameters:**
```typescript
{
  rankings: Player[];    // Final player rankings
  gameStats: {
    duration: number;    // Game duration in ms
    mode: string;        // Game mode
    textLength: number;  // Length of the typed text
  }
}
```

**Client Implementation:**
```typescript
socket.on('game_ended', ({ rankings, gameStats }) => {
  console.log('Game ended with rankings:', rankings);
  // Show final results UI
});
```

## Battle Royale Events

### `word_attack` (Server → Client)

Sent by the server to a specific client when they receive a word attack in Battle Royale mode.

**Parameters:**
```typescript
{
  attackerId: string;    // ID of the attacker
  attackerName: string;  // Name of the attacker
  wordCount: number;     // Number of words added
}
```

**Client Implementation:**
```typescript
socket.on('word_attack', ({ attackerId, attackerName, wordCount }) => {
  console.log(`Attacked by ${attackerName} with ${wordCount} words`);
  // Show attack notification
  // Add additional words to the typing text
});
```

### `attack_sent` (Server → Client)

Sent by the server to the attacker to confirm their attack was sent.

**Parameters:**
```typescript
{
  targetId: string;      // ID of the target
  targetName: string;    // Name of the target
}
```

**Client Implementation:**
```typescript
socket.on('attack_sent', ({ targetId, targetName }) => {
  console.log(`Attack sent to ${targetName}`);
  // Show confirmation of attack
});
```

## Error Handling

### `error` (Server → Client)

Sent by the server when an error occurs.

**Parameters:**
```typescript
{
  message: string;       // Error message
}
```

**Client Implementation:**
```typescript
socket.on('error', ({ message }) => {
  console.error('Server error:', message);
  // Display error message to user
});
```

## Type Definitions

### Core Types

These TypeScript types are used throughout the application:

```typescript
// Game modes
type GameMode = '1v1' | 'free-for-all' | 'battle-royale' | 'practice';

// Game states
type GameState = 'waiting' | 'countdown' | 'playing' | 'finished' | 'error';

// Player object
interface Player {
  id: string;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  completedAt: number | null;
  connected: boolean;
  score?: number;
  rank?: number;
  mistypedWords?: number;
}

// Lobby object
interface Lobby {
  id: string;
  gameMode: GameMode;
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  hostId: string;
  gameId?: string;
  aiSettings?: AISettings;
}

// Game object
interface Game {
  id: string;
  lobbyId: string;
  players: Player[];
  gameMode: GameMode;
  text: string;
  startTime: number;
  endTime: number | null;
  state: GameState;
  finishedPlayers: number;
}
```

## Implementation Tips

1. **Error Handling**: Always implement error handlers for Socket.IO events.
2. **Reconnection Logic**: Handle reconnections gracefully to allow players to rejoin games.
3. **Event Typing**: Use TypeScript interfaces to ensure event payloads match expected types.
4. **Debouncing**: Debounce frequent events like `update_progress` to reduce server load.
