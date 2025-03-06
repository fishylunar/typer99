# Typer-99 Game Mechanics

This document provides an in-depth explanation of the mechanics behind Typer-99, including how the typing system works, scoring is calculated, and special features function.

## Table of Contents
- [Typing System](#typing-system)
- [Word Generation](#word-generation)
- [Performance Metrics](#performance-metrics)
- [Scoring System](#scoring-system)
- [Battle Royale Mechanics](#battle-royale-mechanics)
- [AI Opponents](#ai-opponents)
- [End Game Conditions](#end-game-conditions)

## Typing System

### Input Processing

The typing system works by:

1. Capturing keystrokes in real-time
2. Comparing each keystroke against the expected character
3. Tracking correct and incorrect keystrokes
4. Calculating performance metrics based on this data

### Character Validation

When a character is typed:
- If correct: The character is highlighted in green and the cursor moves forward
- If incorrect: The character is highlighted in red with a background indicator
- Backspace: Deletes the previous character and adjusts statistics accordingly

### Word Tracking

The system tracks words individually to:
- Count mistyped words (words with at least one error)
- Provide accurate WPM calculations
- Enable word-level features like word attacks

### Code Implementation

The core typing logic is implemented in the `useTyping` hook:

```typescript
// Simplified example from src/hooks/useTyping.ts
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (state.completed) return;
  
  // Start timer on first keypress
  if (!state.startTime && e.key.length === 1) {
    setState(prev => ({ ...prev, startTime: Date.now() }));
  }
  
  // Process typed character
  if (e.key.length === 1) {
    setState(prev => {
      // Compare with expected character
      const currentPosition = prev.correctChars + prev.incorrectChars;
      const expectedChar = text[currentPosition];
      
      if (currentPosition >= text.length) {
        return prev; // Already at the end of text
      }
      
      const isCorrect = e.key === expectedChar;
      
      // Create the new state
      const newInput = prev.currentInput + e.key;
      const newState = {
        ...prev,
        currentInput: newInput,
        correctChars: prev.correctChars + (isCorrect ? 1 : 0),
        incorrectChars: prev.incorrectChars + (isCorrect ? 0 : 1),
        totalKeystrokes: prev.totalKeystrokes + 1,
      };

      // Update mistyped words tracking
      updateMistypedWordsTracking(newInput);
      
      // Check for completion
      const reachedEnd = newState.correctChars + newState.incorrectChars >= text.length;
      
      if (reachedEnd && !prev.completed) {
        return { ...newState, completed: true };
      }
      
      return newState;
    });
  }
}, [state.completed, state.startTime, text, updateMistypedWordsTracking]);
```

## Word Generation

### Difficulty Levels

Words are categorized into three difficulty levels:
- **Easy**: Short words (1-4 characters)
- **Medium**: Average words (5-7 characters)
- **Hard**: Long or complex words (8+ characters)

### Generation by Game Mode

Each game mode uses a different word generation strategy:

#### 1v1 Mode
- ~30 words
- Medium difficulty words
- Consistent challenge for both players

#### Free-for-All
- ~25 words
- Medium difficulty words
- Balanced for multiple players

#### Battle Royale
- Scales with player count: 20 + min(playerCount * 2, 40) words
- Mixed difficulty:
  - 30% easy words
  - 50% medium words
  - 20% hard words
- Words are shuffled to create an unpredictable challenge

#### Practice Mode
- Similar to the selected game mode
- Difficulty adjusted based on AI opponent level

### Word Lists

Word lists are stored in `/server/wordlists/wordlist.js` and include:
- 71 easy words
- 101 medium words
- 101 hard words

Here's a snippet of how words are generated:

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

## Performance Metrics

### Words Per Minute (WPM)

WPM is calculated using the standard measure of 5 characters = 1 word:

```javascript
function calculateWPM(characterCount, timeInSeconds) {
  const averageWordLength = 5;
  const minutes = timeInSeconds / 60;
  return Math.round((characterCount / averageWordLength) / minutes);
}
```

Real-time WPM updates during typing:

```typescript
// In useTyping hook
const calculateMetrics = useCallback(() => {
  if (!state.startTime) return { wpm: 0, accuracy: 100 };
  
  const timeElapsed = (Date.now() - state.startTime) / 1000; // in seconds
  const minutes = timeElapsed / 60;
  
  // Standard calculation: 5 characters = 1 word
  const wpm = Math.round((state.correctChars / 5) / minutes);
  
  // Calculate accuracy based on total keystrokes
  const accuracy = state.totalKeystrokes === 0 
    ? 100 
    : Math.round((state.correctChars / state.totalKeystrokes) * 100);
  
  return { wpm, accuracy };
}, [state.startTime, state.correctChars, state.totalKeystrokes]);
```

### Accuracy

Accuracy is calculated as the percentage of correct keystrokes:

```
accuracy = (correctKeystrokes / totalKeystrokes) * 100
```

### Progress

Progress is calculated as the percentage of text completed:

```
progress = (charactersTyped / totalCharacters) * 100
```

### Mistyped Words

A word is considered "mistyped" if at any point during typing the user made an error in that word, even if they corrected it later with backspace.

## Scoring System

### Base Score Components

The final score for each player is calculated based on:

1. **Word Difficulty**: 
   - Easy text: 25 points
   - Medium text: 50 points
   - Hard text: 100 points

2. **First Place Bonus**: +500 points for finishing first

3. **Accuracy Bonus**: Up to 200 points based on typing accuracy
   ```
   accuracyBonus = min(200, accuracy * 2)
   ```

4. **WPM Bonus**: 2 points per WPM
   ```
   wpmBonus = wpm * 2
   ```

### Score Calculation

```javascript
function calculatePlayerScore(game, player, isFirst) {
  let score = 0;
  
  // Word difficulty scores
  const wordDifficulty = getDifficultyLevel(game.text);
  if (wordDifficulty === 'easy') score += 25;
  else if (wordDifficulty === 'medium') score += 50;
  else if (wordDifficulty === 'hard') score += 100;
  
  // First place bonus
  if (isFirst) score += 500;
  
  // Accuracy bonus (max 200 for 100% accuracy)
  const accuracyBonus = Math.min(200, player.accuracy * 2);
  score += accuracyBonus;
  
  // WPM bonus (2 points per WPM)
  score += player.wpm * 2;
  
  return Math.round(score);
}
```

## Battle Royale Mechanics

### Word Attacks

In Battle Royale mode, players can send "word attacks" to opponents:

1. **Trigger Conditions**:
   - Player must have WPM > 70
   - Player must have accuracy > 95%
   - There must be at least 2 active players

2. **Attack Frequency**:
   - System checks for possible attacks every 5 seconds
   - Attacks are random but target players who are performing well

3. **Attack Impact**:
   - Adds 5 additional words to the target's text
   - Target receives notification showing attacker's name

4. **Implementation**:

```javascript
function setupBattleRoyaleAttacks(gameId, io) {
  const attackInterval = setInterval(() => {
    try {
      if (!games.has(gameId)) {
        clearInterval(attackInterval);
        return;
      }
      
      const game = games.get(gameId);
      
      // Every 5 seconds, check for potential attackers
      const now = Date.now();
      if (now - game.lastAttackCheck < 5000) return;
      game.lastAttackCheck = now;
      
      // Find players doing well
      const activePlayers = game.players.filter(p => p.connected && p.progress < 100);
      const possibleAttackers = activePlayers.filter(p => p.wpm > 70 && p.accuracy > 95);
      
      if (possibleAttackers.length === 0 || activePlayers.length < 2) return;
      
      // Select random attacker and target
      const attacker = possibleAttackers[Math.floor(Math.random() * possibleAttackers.length)];
      
      let targets = activePlayers.filter(p => p.id !== attacker.id);
      if (targets.length === 0) return;
      
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      // Send attack
      io.to(target.id).emit('word_attack', {
        attackerId: attacker.id,
        attackerName: attacker.nickname,
        wordCount: 5 // Add 5 words to the target's text
      });
      
      // Send notification to attacker
      io.to(attacker.id).emit('attack_sent', {
        targetId: target.id,
        targetName: target.nickname
      });
    } catch (error) {
      console.error('Error in battle royale attacks:', error);
    }
  }, 1000);
}
```

## AI Opponents

### AI Difficulty Levels

Practice mode features AI opponents with four difficulty levels:

| Difficulty | Base WPM | Accuracy Range | Variability |
|------------|----------|----------------|------------|
| Easy       | 30 WPM   | 90-95%         | ±5% |
| Medium     | 60 WPM   | 93-97%         | ±10% |
| Hard       | 90 WPM   | 95-99%         | ±15% |
| Expert     | 120 WPM  | 97-100%        | ±20% |

### AI Behavior

AI opponents simulate realistic typing behavior:

1. **Variable Speed**: WPM fluctuates during typing within the variability range
2. **Mistakes**: AI makes occasional mistakes based on its accuracy setting
3. **Consistent Progress**: AI makes steady progress throughout the game

### AI Simulation

The AI's typing progress is simulated with this algorithm:

```javascript
function simulateAIProgress(game, io) {
  const aiPlayer = game.players.find(p => p.isAI);
  if (!aiPlayer) return;
  
  const aiSettings = game.aiSettings || AI_SETTINGS.medium;
  const textLength = game.text.length;
  
  // Calculate how long it will take the AI to complete the text
  const baseWPM = aiSettings.baseWPM;
  const charsPerMinute = baseWPM * 5; // 5 chars per word on average
  const charsPerSecond = charsPerMinute / 60;
  
  // Add some randomness
  const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
  const totalSeconds = (textLength / (charsPerSecond * randomFactor));
  
  // Set intervals to update AI progress
  const updateInterval = Math.max(500, Math.min(1000, totalSeconds * 10));
  const progressPerUpdate = 100 / (totalSeconds * 1000 / updateInterval);
  
  let currentProgress = 0;
  
  const aiInterval = setInterval(() => {
    // Add variability to the AI's typing speed
    const variabilityFactor = 1 + ((Math.random() * aiSettings.variability / 100) - (aiSettings.variability / 200));
    currentProgress += progressPerUpdate * variabilityFactor;
    
    // Update AI player stats and broadcast progress
    // ...
  }, updateInterval);
}
```

## End Game Conditions

### Standard Endings

A game can end in several ways:

1. **All Players Complete**: All players finish typing the text
2. **First Player Completes**: In some modes, the game ends shortly after the first player finishes
3. **Player Disconnections**: If only one player remains active, the game ends

### Rankings Determination

Final rankings are calculated as follows:

```javascript
// Calculate final rankings
const rankings = [...game.players]
  .sort((a, b) => {
    // Completed players first, sorted by completion time
    if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt;
    if (a.completedAt) return -1;
    if (b.completedAt) return 1;
    // Then by progress
    return b.progress - a.progress;
  })
  .map((player, index) => ({
    ...player,
    rank: index + 1
  }));
```

### Game Reset

After a game ends:
1. Results are displayed for 10 seconds
2. The lobby is reset to allow for a new game
3. Player progress, WPM, and accuracy are reset
4. Game data is removed from the server
