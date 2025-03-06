# Typer-99 Frontend Documentation

This document provides detailed information about the frontend implementation of Typer-99, including the component structure, state management, and user interface design.

## Frontend Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Real-time Communication**: Socket.IO Client
- **Build Tool**: Built-in Next.js tooling

## Directory Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── game/                # Game page
│   │   └── page.tsx         # Game UI
│   └── lobby/               # Lobby page
│       └── page.tsx         # Lobby UI
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── providers/           # Context providers
│   ├── Header.tsx           # Site header
│   ├── Footer.tsx           # Site footer
│   ├── GameResults.tsx      # Game results display
│   ├── PlayerProgress.tsx   # Player progress bars
│   └── ...                  # Other components
├── hooks/                   # Custom React hooks
│   ├── useGame.ts           # Game state management
│   ├── useLobby.ts          # Lobby management
│   ├── useTyping.ts         # Typing logic
│   └── useTheme.ts          # Theme management
├── lib/                     # Utility libraries
│   └── socket.ts            # Socket.IO client setup
└── types/                   # TypeScript type definitions
    └── index.ts             # Type definitions
```

## Key Pages

### Home Page (`/src/app/page.tsx`)

The landing page where users:
1. Enter their nickname
2. Create a new game or join an existing one
3. Select a game mode
4. Choose AI difficulty for practice mode

```tsx
export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [lobbyId, setLobbyId] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>('free-for-all');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  
  // Functions for creating or joining games
  const handleCreateGame = () => {
    // Navigate to lobby page with selected parameters
  };
  
  const handleJoinGame = () => {
    // Navigate to lobby page with existing lobby ID
  };
  
  // UI rendering with nickname input, game mode selection, etc.
}
```

### Lobby Page (`/src/app/lobby/page.tsx`)

Where players gather before a game starts:
1. Shows current players in the lobby
2. Displays the lobby code for inviting others
3. Host controls for starting the game
4. AI opponent details (for practice mode)

```tsx
export default function LobbyPage() {
  // Access lobby data via the useLobby hook
  const {
    lobby,
    isHost,
    startGame,
    // Other lobby-related state and functions
  } = useLobby();
  
  // Navigate to game when it starts
  useEffect(() => {
    if (lobby?.gameStarted) {
      router.push(`/game?lobbyId=${lobby.id}`);
    }
  }, [lobby?.gameStarted, lobby?.id, router]);
  
  // UI rendering with player list, invite code, start button for host
}
```

### Game Page (`/src/app/game/page.tsx`)

The main game interface where:
1. Players type the provided text
2. See real-time progress of all participants
3. View their WPM and accuracy stats
4. Receive word attack notifications (in Battle Royale mode)
5. See results when the game ends

```tsx
export default function GamePage() {
  // Access game data via the useGame hook
  const {
    gameState,
    gameText,
    isGameActive,
    isGameFinished,
    rankings,
    // Other game-related state and functions
  } = useGame();
  
  // Typing functionality via the useTyping hook
  const typing = useTyping({
    text: gameText || '',
    onProgress: (progress, wpm, accuracy) => {
      updateProgress(progress, wpm, accuracy);
    },
    onComplete: (wpm, accuracy, timeInSeconds) => {
      completeGame(wpm, accuracy, timeInSeconds);
    }
  });
  
  // Show game results if finished
  if (isGameFinished && rankings) {
    return <GameResults rankings={rankings} ... />;
  }
  
  // Render typing interface with text and stats
}
```

## Core Components

### TypingText (`/src/components/ui/TypingText.tsx`)

Displays the text being typed with visual feedback:
- Green for correctly typed characters
- Red for incorrectly typed characters
- Highlighted cursor position

```tsx
export const TypingText: React.FC<TypingTextProps> = ({ text, currentInput }) => {
  // Calculate which parts of the text have been typed correctly or incorrectly
  const { typed, current, upcoming } = useMemo(() => {
    // Split the text into characters that have been typed vs. upcoming
    const typedChars = currentInput.split('');
    const textChars = text.split('');
    
    // Each character in typed section with correct/incorrect marking
    const typedSection = typedChars.map((char, i) => {
      const expected = textChars[i] || '';
      const isCorrect = char === expected;
      
      return {
        char: expected,
        className: isCorrect ? 'text-green-500' : 'text-red-500 bg-red-100'
      };
    });
    
    // Current character to type (highlighted)
    const currentChar = textChars[typedChars.length] || '';
    
    // Remaining characters
    const upcomingChars = textChars.slice(typedChars.length + 1);
    
    return {
      typed: typedSection,
      current: currentChar,
      upcoming: upcomingChars.join('')
    };
  }, [text, currentInput]);

  // Render the text with appropriate styling for each section
};
```

### PlayerProgress (`/src/components/PlayerProgress.tsx`)

Shows real-time progress bars and statistics for each player:
- Username and connection status
- Visual progress bar
- WPM and accuracy stats
- Special styling for the current player

```tsx
export const PlayerProgress: React.FC<PlayerProgressProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div className={`mb-2 p-3 rounded-lg border ${
      isCurrentPlayer ? 'border-primary bg-primary/10' : 'border-border bg-card'
    }`}>
      {/* Player name and status */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className="font-semibold">
            {player.nickname}
          </span>
          {/* Status indicators for completion or disconnection */}
        </div>
        
        {/* Stats display */}
        <div className="text-sm text-muted-foreground">
          <span>{player.wpm} WPM</span>
          <span>{player.accuracy}% Acc</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-neutral rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary"
          style={{ width: `${player.progress}%` }}
        />
      </div>
    </div>
  );
};
```

### GameResults (`/src/components/GameResults.tsx`)

Displays the final game results:
- Leaderboard with rankings
- Detailed statistics for each player
- Visual indication of the winner and current player
- Navigation options for the next action

```tsx
export const GameResults: React.FC<GameResultsProps> = ({ 
  rankings, 
  gameStats, 
  currentPlayerId 
}) => {
  // Find current player's rank and determine if they won
  const currentPlayer = rankings.find(p => p.id === currentPlayerId);
  const isWinner = currentPlayer?.rank === 1;
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Main heading based on game outcome */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {isWinner ? "You Won!" : "Game Over"}
        </h1>
        {/* Game mode and duration */}
      </div>
      
      {/* Rankings list with detailed player stats */}
      <div className="space-y-3">
        {rankings.map((player) => (
          <div key={player.id} className="player-result-card">
            {/* Player rank, name, and stats */}
            <div className="flex-grow">
              <div className="font-mono font-bold">
                {player.wpm} <span>WPM</span>
              </div>
              <div>
                {player.accuracy}% accuracy
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation buttons */}
      <div className="mt-6 flex gap-4">
        <Link href="/">
          Return to Home
        </Link>
        {/* Other action buttons */}
      </div>
    </main>
  );
};
```

## Custom Hooks

### useTyping (`/src/hooks/useTyping.ts`)

Core typing logic that:
1. Captures and processes keyboard input
2. Tracks accuracy and speed
3. Calculates WPM and progress
4. Detects mistyped words
5. Handles completion events

```typescript
export function useTyping({ text, onProgress, onComplete }: UseTypingProps) {
  const [state, setState] = useState<TypingState>({
    currentInput: '',
    correctChars: 0,
    incorrectChars: 0,
    totalChars: text.length,
    // Additional state properties
  });
  
  // Keystroke handler with character validation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Process keystrokes and update typing state
  }, [state.completed, state.startTime, text]);
  
  // Calculate metrics (WPM, accuracy)
  const calculateMetrics = useCallback(() => {
    // Calculate real-time WPM and accuracy
  }, [state.startTime, state.correctChars, state.totalKeystrokes]);
  
  // Attach event listeners and manage typing state
  useEffect(() => {
    // Setup keyboard event listeners
  }, [handleKeyDown]);
  
  // Report progress at regular intervals
  useEffect(() => {
    // Update metrics and call onProgress callback
  }, [state.completed, state.startTime, calculateMetrics]);
  
  // Handle completion
  useEffect(() => {
    // Call onComplete when typing is finished
  }, [state.completed, state.startTime, onComplete]);
  
  // Return typing state and interface
  return {
    wpm: state.wpm,
    accuracy: state.accuracy,
    progress: calculateProgress(),
    currentInput: state.currentInput,
    completed: state.completed,
    inputRef
  };
}
```

### useGame (`/src/hooks/useGame.ts`)

Manages game state and server communication:
1. Connects to the Socket.IO server
2. Handles game events (starting, updates, ending)
3. Manages player progress and statistics
4. Reports local player's progress to the server

```typescript
export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [gameText, setGameText] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  // Additional state variables
  
  useEffect(() => {
    const socket = getSocket();
    
    // Setup socket event handlers
    socket.on('game_starting', handleGameStarting);
    socket.on('game_started', handleGameStarted);
    socket.on('player_progress', handlePlayerProgress);
    socket.on('game_ended', handleGameEnded);
    // Additional event handlers
    
    // Clean up on unmount
    return () => {
      socket.off('game_starting', handleGameStarting);
      // Remove other event listeners
    };
  }, []);
  
  // Function to send progress updates to server
  const updateProgress = useCallback((progress, wpm, accuracy) => {
    if (!gameId) return;
    emitEvent('update_progress', { gameId, progress, wpm, accuracy });
  }, [gameId]);
  
  // Function to report game completion
  const completeGame = useCallback((wpm, accuracy, timeInSeconds) => {
    if (!gameId) return;
    emitEvent('game_completed', { 
      gameId, wpm, accuracy, time: timeInSeconds 
    });
  }, [gameId]);
  
  return {
    gameState,
    gameText,
    countdown,
    isGameStarting,
    isGameActive,
    isGameFinished,
    rankings,
    gameStats,
    updateProgress,
    completeGame,
    currentPlayerId
  };
}
```

### useLobby (`/src/hooks/useLobby.ts`)

Manages lobby interactions:
1. Creates or joins game lobbies
2. Tracks players in the current lobby
3. Handles host status and game starting
4. Manages player joining and leaving events

```typescript
export function useLobby() {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  // Additional state variables
  
  useEffect(() => {
    const socket = getSocket();
    
    // Setup socket event handlers for lobby events
    socket.on('lobby_joined', handleLobbyJoined);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('error', handleError);
    socket.on('lobby_reset', handleLobbyReset);
    socket.on('game_starting', handleGameStarting);
    
    // Clean up on unmount
    return () => {
      // Remove event listeners
    };
  }, [currentPlayerId]);
  
  // Function to join or create a lobby
  const joinLobby = useCallback((params: LobbyJoinParams) => {
    setIsConnecting(true);
    setError(null);
    emitEvent('join_lobby', params);
  }, []);
  
  // Function for host to start the game
  const startGame = useCallback(() => {
    if (!lobby) return;
    emitEvent('start_game', { lobbyId: lobby.id });
  }, [lobby, isHost]);
  
  // Other functions and return interface
};
```

## Theme System

### useTheme (`/src/hooks/useTheme.ts`)

Manages theme customization:
1. Stores and loads theme preferences
2. Provides built-in themes
3. Allows creating custom themes
4. Applies theme colors to the UI

```typescript
export function useTheme() {
  // Load theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Load from localStorage or use default
  });
  
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => {
    // Load custom themes from localStorage
  });
  
  // Save theme changes to localStorage
  useEffect(() => {
    // Save current theme to localStorage
  }, [currentTheme]);
  
  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [currentTheme]);
  
  // Theme management functions
  const setTheme = useCallback((themeId: string) => {
    // Switch to selected theme
  }, [allThemes]);
  
  const createTheme = useCallback((name: string, colors: ThemeColors) => {
    // Create and apply a new custom theme
  }, []);
  
  const deleteTheme = useCallback((themeId: string) => {
    // Delete a custom theme
  }, [currentTheme.id]);
  
  // Return theme interface
  return {
    currentTheme,
    setTheme,
    createTheme,
    deleteTheme,
    availableThemes: allThemes
  };
}
```

## Socket Communication

### socket.ts (`/src/lib/socket.ts`)

Sets up the Socket.IO client:
1. Creates and maintains the socket connection
2. Handles reconnection logic
3. Provides type-safe event emission
4. Debug logging in development

```typescript
let socket: MySocket | null = null;

// Get the socket instance, creating it if it doesn't exist
export function getSocket(): MySocket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3004';

    socket = socketIOClient(socketUrl, {
      autoConnect: true,
      reconnection: true,
      // Additional options
    });

    // Socket event logging for development
    if (process.env.NODE_ENV !== 'production') {
      (socket as any).onAny((event: string, ...args: unknown[]) => {
        console.log(`[Socket Received] ${event}`, args);
      });
    }
  }

  return socket;
}

// Helper function to emit events with proper typing
export function emitEvent<T extends keyof SocketEvent>(
  event: T,
  ...args: Parameters<SocketEvent[T]>
): void {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.emit(event, ...args);
  } else {
    console.error(`Failed to emit ${String(event)}: Socket not initialized`);
  }
}

// Additional socket utility functions
```

## Responsive Design

Typer-99 is designed to work on multiple screen sizes:

1. **Desktop**: Full-featured experience with optimal layout
2. **Tablet**: Responsive grid layout that adapts to medium screens
3. **Mobile**: Vertical stacking of game elements for smaller screens

Key responsive design principles:
- Fluid layouts with Tailwind's responsive prefixes (`md:`, `lg:`, etc.)
- Dynamic component sizing based on viewport
- Touch-friendly controls for mobile devices
- Appropriate font sizes for readability across devices

## Accessibility Features

- Semantic HTML structure
- Proper contrast ratios in UI elements
- Keyboard focus management
- Screen reader friendly interface elements
- ARIA attributes where appropriate

## Performance Optimizations

- Code splitting with Next.js
- React component memoization
- Throttled Socket.IO event handling
- Efficient DOM updates in typing components
- Optimized theme switching without page reloads
