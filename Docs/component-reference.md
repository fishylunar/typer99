# Typer-99 Component Reference

This document provides detailed information about all the React components in the Typer-99 frontend, including their props, state, and usage examples.

## Table of Contents
- [Core Components](#core-components)
- [UI Components](#ui-components)
- [Layout Components](#layout-components)
- [Game Page Components](#game-page-components)
- [Lobby Components](#lobby-components)
- [Theme Components](#theme-components)

## Core Components

### GameResults

The component that displays the final results at the end of a game.

**Props:**
```typescript
interface GameResultsProps {
  rankings: Player[];                 // Sorted player rankings with scores
  gameStats?: GameStats | null;       // Statistics about the game
  currentPlayerId: string | null;     // Current player's ID
}
```

**Usage:**
```tsx
<GameResults 
  rankings={rankings} 
  gameStats={gameStats} 
  currentPlayerId={userId} 
/>
```

**Key Features:**
- Displays final rankings of all players
- Shows each player's WPM, accuracy, and score
- Highlights the winner and current player
- Provides navigation options after the game ends
- Includes special UI for practice mode with AI opponents

### PlayerProgress

Displays a player's progress during the game.

**Props:**
```typescript
interface PlayerProgressProps {
  player: Player;             // Player data
  isCurrentPlayer: boolean;   // Whether this is the current user
}
```

**Usage:**
```tsx
<PlayerProgress 
  player={playerData} 
  isCurrentPlayer={playerData.id === currentUserId} 
/>
```

**Key Features:**
- Shows player name and status (connected/disconnected)
- Displays real-time WPM and accuracy metrics
- Renders a progress bar indicating completion percentage
- Uses special styling for the current player

### NicknameDialog

Modal dialog that prompts the user to enter a nickname.

**Props:**
```typescript
interface NicknameDialogProps {
  isOpen: boolean;                     // Whether the dialog is visible
  onSubmit: (nickname: string) => void; // Callback when nickname is submitted
}
```

**Usage:**
```tsx
<NicknameDialog 
  isOpen={showNicknamePrompt} 
  onSubmit={handleNicknameSubmit} 
/>
```

**Key Features:**
- Validates nickname input
- Prevents submission of empty nicknames
- Focuses input field automatically
- Supports keyboard submission (Enter key)

## UI Components

### TypingText

Displays the text to be typed with visual feedback on correct/incorrect characters.

**Props:**
```typescript
interface TypingTextProps {
  text: string;              // The full text to be typed
  currentInput: string;      // What the user has typed so far
  className?: string;        // Optional CSS class
}
```

**Usage:**
```tsx
<TypingText 
  text="The text to type" 
  currentInput="The text" 
  className="text-lg" 
/>
```

**Key Features:**
- Highlights correctly typed characters in green
- Shows incorrectly typed characters in red with background
- Highlights the current character position
- Shows upcoming text in muted color

### Countdown

Shows a countdown animation before the game starts.

**Props:**
```typescript
interface CountdownProps {
  value: number;   // Current countdown value
}
```

**Usage:**
```tsx
<Countdown value={3} />
```

**Key Features:**
- Large, animated countdown numbers
- Automatic animation and pulsing effect
- Descriptive text showing game is about to start

### WordAttackNotification

Notification that appears when a player receives a word attack in Battle Royale mode.

**Props:**
```typescript
interface WordAttackNotificationProps {
  attackerName: string;          // Name of the attacking player
  wordCount: number;             // Number of words added
  onDismiss: () => void;         // Callback when notification is dismissed
}
```

**Usage:**
```tsx
<WordAttackNotification
  attackerName="Player1"
  wordCount={5}
  onDismiss={() => setShowAttack(false)}
/>
```

**Key Features:**
- Animated entrance and exit
- Auto-dismisses after a few seconds
- Shows attacker name and number of words added
- Visual indicator of attack impact

## Layout Components

### Header

The application header with navigation and theme controls.

**Props:** None

**Usage:**
```tsx
<Header />
```

**Key Features:**
- Site branding and logo
- Theme toggle button
- Opens theme customization menu

### Footer

The application footer with general site information.

**Props:** None

**Usage:**
```tsx
<Footer />
```

**Key Features:**
- Copyright information
- Brief description of the application
- Site branding

### ThemeProvider

Context provider for theme-related functionality.

**Props:**
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;  // Child elements
}
```

**Usage:**
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

**Key Features:**
- Provides theme context to all child components
- Applies current theme to the application
- Manages theme switching and persistence

## Game Page Components

### ThemeCustomizer

Component for customizing and creating themes.

**Props:** None (uses theme context)

**Usage:**
```tsx
<ThemeCustomizer />
```

**Key Features:**
- Lists available themes
- Allows creating custom themes
- Color pickers for all theme elements
- Preview of theme colors
- Options to save or delete custom themes

## Lobby Components

### PlayerItem

Displays a single player in the lobby list.

**Props:**
```typescript
interface PlayerItemProps {
  player: Player;             // Player data
  isCurrentPlayer: boolean;   // Whether this is the current user
}
```

**Usage:**
```tsx
<PlayerItem 
  player={playerData} 
  isCurrentPlayer={playerData.id === currentUserId} 
/>
```

**Key Features:**
- Shows player name
- Indicates host status
- Highlights current player
- Shows connection status
