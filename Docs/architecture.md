# Typer-99 Architecture Overview

This document provides a comprehensive overview of Typer-99's architecture, explaining how the frontend and backend components interact to create a real-time typing game.

## System Architecture

Typer-99 follows a client-server architecture with real-time communication:

```
┌─────────────────┐                 ┌─────────────────┐
│                 │                 │                 │
│   Next.js App   │◄───Socket.IO────►    Express     │
│    (Client)     │     Events      │    Server       │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
        │                                    │
        │                                    │
┌─────────────────┐                 ┌─────────────────┐
│    Browser      │                 │    In-Memory    │
│   Local Storage │                 │    Data Store   │
└─────────────────┘                 └─────────────────┘
```

### Key Components

1. **Frontend (Next.js Application)**
   - User interface components (React)
   - Client-side state management (React hooks)
   - Socket.IO client for real-time communication
   - Local storage for theme preferences

2. **Backend (Node.js Express Server)**
   - Socket.IO server for managing connections
   - Game logic and mechanics
   - In-memory data storage for lobbies, games, and players
   - Word list management

3. **Communication Layer**
   - Socket.IO for bidirectional real-time communication
   - Event-based messaging system
   - Server-push updates for game state

## Directory Structure

The project follows this high-level structure:

```
typer99/
├── src/                        # Frontend source code
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   └── types/                  # TypeScript type definitions
├── server/                     # Backend source code
│   ├── wordlists/              # Word lists for game text
│   ├── utils/                  # Server utilities
│   ├── tests/                  # Server tests
│   ├── index.js                # Server entry point
│   └── socket.js               # Socket.IO event handlers
├── public/                     # Static assets
├── Docs/                       # Documentation
└── (config files)              # Various configuration files
```

## Data Flow

### Game Creation Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│         │      │         │      │         │      │         │
│   UI    │──►│  Hooks   │──►│ Socket  │──►│ Server  │
│         │      │         │      │ Client  │      │         │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
   │                                                    │
   │                                                    │
   ▼                                                    ▼
Player chooses         useLobby hook emits           Server creates
  game mode           'join_lobby' event              lobby & game
```

### Typing Event Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│         │      │         │      │         │      │         │
│ Typing  │──►│useTyping │──►│useGame   │──►│ Server  │
│ Input   │      │  Hook   │      │  Hook   │      │         │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
                      │                                 │
                      │                                 │
                      ▼                                 ▼
                Calculate local metrics           Broadcast updates
                  (WPM, accuracy)                 to other players
```

### Game State Synchronization

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│         │      │         │      │         │      │         │
│ Server  │──►│ Socket  │──►│  Hooks  │──►│   UI    │
│         │      │ Client  │      │         │      │         │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
   │                                                    │
   │                                                    │
   ▼                                                    ▼
Server broadcasts      Socket.IO client             Components
  state updates       receives events              re-render
```

## Core Components

### Frontend Components

1. **Game Page**: The main interface where players type and see progress
2. **Lobby Page**: Where players gather before a game starts
3. **TypingText**: Real-time display of text with current position
4. **PlayerProgress**: Shows all players' progress bars and stats
5. **GameResults**: Displays the game results and final rankings

### Backend Systems

1. **Socket Handler**: Manages all the Socket.IO events and game state
2. **Game Utils**: Utilities for word generation and scoring
3. **In-Memory Data Stores**: Track lobbies, games, and players
4. **Word Lists**: Collections of words at different difficulty levels

## Socket.IO Events

### Client to Server Events
- `join_lobby`: Player creates or joins a lobby
- `start_game`: Host starts the game
- `update_progress`: Player sends their current typing progress
- `game_completed`: Player notifies server they finished typing

### Server to Client Events
- `lobby_joined`: Server confirms player joined lobby
- `player_joined`: Notifies when a new player joins the lobby
- `game_starting`: Countdown to game start
- `game_started`: Game begins with text to type
- `player_progress`: Updates on each player's progress
- `word_attack`: Notification of attack in battle royale mode
- `game_ended`: Game over with final rankings and stats

## State Management

### Client State
Managed through React hooks:
- `useLobby`: Manages lobby state and operations
- `useGame`: Handles game state and server communication
- `useTyping`: Processes typing input and calculates metrics
- `useTheme`: Handles theme preferences and customization

### Server State
Stored in in-memory Maps:
- `lobbies`: Map of all active game lobbies
- `games`: Map of ongoing games
- `players`: Map of connected players
- `disconnectTimeouts`: Handles temporary disconnections

## Error Handling

1. **Socket Connection Errors**: Automatic reconnection attempts
2. **Game State Inconsistencies**: Server as single source of truth
3. **Player Disconnections**: Grace period before removing from game
4. **Input Validation**: Server-side validation of all client events

## Performance Considerations

1. **Real-time Updates**: Throttled to avoid excessive updates
2. **Server Memory**: In-memory data with cleanup for completed games
3. **Rendering Optimization**: React component memoization
4. **Network Efficiency**: Minimized payload size in Socket.IO events
