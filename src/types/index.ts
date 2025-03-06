// Game state related types
export type GameMode = '1v1' | 'free-for-all' | 'battle-royale' | 'practice';

export type GameState = 'waiting' | 'countdown' | 'playing' | 'finished' | 'error';

export interface Player {
  id: string;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  completedAt: number | null;
  connected: boolean;
  score?: number; // Add score field
  rank?: number;
  mistypedWords?: number; // Add mistyped words count
}

export interface Lobby {
  id: string;
  gameMode: GameMode;
  wordlist?: string; // Add wordlist property
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  hostId: string;
  gameId?: string;
  aiSettings?: AISettings; // Add aiSettings property
}

export interface Game {
  id: string;
  lobbyId: string;
  players: Player[];
  gameMode: GameMode;
  wordlist?: string; // Add wordlist property
  text: string;
  startTime: number;
  endTime: number | null;
  state: GameState;
  finishedPlayers: number;
}

export interface GameStats {
  duration: number;
  mode: GameMode;
  textLength: number;
  wordlist?: string; // Add wordlist to game stats
}

export interface LobbyJoinParams {
  nickname: string;
  lobbyId?: string;
  gameMode?: GameMode;
  aiDifficulty?: AIDifficulty; // Add AI difficulty for practice mode
}

// Socket event types
export interface SocketEvent {
  // Basic events
  connect: () => void;
  disconnect: () => void;
  error: (data: { message: string }) => void;

  // Lobby events
  join_lobby: (params: LobbyJoinParams) => void;
  lobby_joined: (data: { lobby: Lobby }) => void;
  player_joined: (data: { player: Player, lobbyState: Lobby }) => void;
  player_left: (data: { playerId: string, lobbyState: Lobby }) => void;
  lobby_reset: (data: { lobby: Lobby }) => void;

  // Game events
  start_game: (data: { lobbyId: string }) => void;
  game_starting: (data: { countdown: number }) => void;
  game_started: (data: { gameId: string, text: string, gameState: Game }) => void;
  update_progress: (data: { gameId: string, progress: number, wpm: number, accuracy: number }) => void;
  player_progress: (data: { playerId: string, progress: number, wpm: number, accuracy: number, completed?: boolean }) => void;
  game_completed: (data: { gameId: string, wpm: number, accuracy: number, time: number, mistypedWords?: number }) => void;
  game_ended: (data: { rankings: Player[], gameStats: GameStats }) => void;

  // Battle Royale events
  word_attack: (data: { attackerId: string, attackerName: string, wordCount: number }) => void;
  attack_sent: (data: { targetId: string, targetName: string }) => void;

  // Wordlist events
  get_wordlists: () => void;
  wordlists: (wordlists: AvailableWordlists) => void;
}

// AI difficulty levels
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface AISettings {
  difficulty: AIDifficulty;
  baseWPM: number;
  accuracyRange: [number, number]; // [min, max]
  variability: number; // How much WPM can vary during the game
}

// Theme types
export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  neutral: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

// Keyboard input types
export interface TypingState {
  currentInput: string;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  startTime: number | null;
  wpm: number;
  accuracy: number;
  completed: boolean;
  totalKeystrokes: number;  // Add this property
  mistypedWords: number; // Add mistyped words counter
}

// Wordlist types
export interface WordlistMetadata {
  name: string;
  description: string;
  nsfw: boolean;
  eligibleForXP: boolean;
}

export interface AvailableWordlists {
  [key: string]: WordlistMetadata;
}
