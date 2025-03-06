const { v4: uuidv4 } = require('uuid');
const { generateText, calculateWPM } = require('./utils/gameUtils');

// Data stores
const lobbies = new Map(); // Store active lobbies
const games = new Map();   // Store active games
const players = new Map(); // Store player sessions
const disconnectTimeouts = new Map(); // Store timeout references for cleanup

// AI difficulty settings
const AI_SETTINGS = {
  easy: {
    difficulty: 'easy',
    baseWPM: 30,
    accuracyRange: [90, 95],
    variability: 5
  },
  medium: {
    difficulty: 'medium',
    baseWPM: 60,
    accuracyRange: [93, 97],
    variability: 10
  },
  hard: {
    difficulty: 'hard',
    baseWPM: 90,
    accuracyRange: [95, 99],
    variability: 15
  },
  expert: {
    difficulty: 'expert',
    baseWPM: 120,
    accuracyRange: [97, 100],
    variability: 20
  }
};

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Join or create lobby
    socket.on('join_lobby', ({ nickname, lobbyId, gameMode, aiDifficulty }) => {
      try {
        console.log(`Join lobby request from: ${socket.id}, nickname: ${nickname}, lobbyId: ${lobbyId || 'new'}, mode: ${gameMode}`);
        
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
        
        // Store player in session map
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
          
          console.log(`Creating new lobby with ID: ${newLobbyId}, host: ${socket.id}, mode: ${gameMode}`);
          
          lobbies.set(newLobbyId, lobby);
        }
        
        // Join socket room for the lobby
        socket.join(lobby.id);
        
        // Debug log the lobby state
        console.log(`Lobby state after join: ID=${lobby.id}, hostId=${lobby.hostId}, players=${lobby.players.length}`);
        
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
    
    // Start game
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
          players: players.map(p => ({
            ...p, 
            progress: 0, 
            wpm: p.isAI ? p.wpm : 0, 
            accuracy: p.isAI ? p.accuracy : 100, 
            completedAt: null,
            connected: true
          })),
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
    
    // Update player progress
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
          
          // In battle royale, check if we should end the game
          if (game.gameMode === 'battle-royale' && 
              game.finishedPlayers >= game.players.length - 1) {
            endGame(game, io);
          }
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
    
    // Player completed the game
    socket.on('game_completed', ({ gameId, wpm, accuracy, time, mistypedWords = 0 }) => {
      try {
        if (!games.has(gameId)) {
          console.log(`Game completion received but game ${gameId} not found`);
          return;
        }
        
        const game = games.get(gameId);
        const playerIndex = game.players.findIndex(p => p.id === socket.id);
        
        if (playerIndex === -1) {
          console.log(`Game completion received but player ${socket.id} not found in game`);
          return;
        }
        
        console.log(`Player ${socket.id} completed game ${gameId} with WPM: ${wpm}, accuracy: ${accuracy}, mistyped words: ${mistypedWords}`);
        
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
        
        console.log(`Game status: ${game.finishedPlayers}/${game.players.length} players finished`);
        
        // Always end the game when first player completes
        setTimeout(() => {
          console.log("Ending game now that a player has completed");
          endGame(game, io);
        }, 3000);
        
      } catch (error) {
        console.error('Error in game_completed:', error);
      }
    });
    
    // Handle disconnections
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
            
            // Remove player after grace period - store timeout reference
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
            
            // Store the timeout reference for later cleanup
            disconnectTimeouts.set(socket.id, timeoutId);
          }
        }
        
        // Remove player from session map
        players.delete(socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

// Helper functions
function getMaxPlayers(gameMode) {
  switch (gameMode) {
    case '1v1': return 2;
    case 'battle-royale': return 99;
    case 'free-for-all':
    default: return 10;
  }
}

function filterLobbyData(lobby) {
  // Return safe data for client
  return {
    id: lobby.id,
    gameMode: lobby.gameMode,
    players: lobby.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      isReady: p.isReady,
      isHost: p.isHost,
      isAI: p.isAI || false
    })),
    maxPlayers: lobby.maxPlayers,
    gameStarted: lobby.gameStarted,
    hostId: lobby.hostId,
    aiSettings: lobby.aiSettings
  };
}

function filterGameData(game) {
  return {
    id: game.id,
    lobbyId: game.lobbyId,
    players: game.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      progress: p.progress,
      wpm: p.wpm,
      accuracy: p.accuracy,
      completedAt: p.completedAt,
      connected: p.connected,
      score: p.score || 0,
      mistypedWords: p.mistypedWords || 0 // Include mistyped words
    })),
    gameMode: game.gameMode,
    startTime: game.startTime,
    state: game.state
  };
}

function setupBattleRoyaleAttacks(gameId, io) {
  const attackInterval = setInterval(() => {
    try {
      if (!games.has(gameId)) {
        clearInterval(attackInterval);
        return;
      }
      
      const game = games.get(gameId);
      
      // Stop attacks if game is over
      if (game.state !== 'playing') {
        clearInterval(attackInterval);
        return;
      }
      
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

function endGame(game, io) {
  game.state = 'finished';
  game.endTime = Date.now();
  
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
  
  // Emit game ended event
  io.to(game.lobbyId).emit('game_ended', {
    rankings,
    gameStats: {
      duration: game.endTime - game.startTime,
      mode: game.gameMode,
      textLength: game.text.length
    }
  });
  
  // Reset lobby state after delay
  setTimeout(() => {
    if (lobbies.has(game.lobbyId)) {
      const lobby = lobbies.get(game.lobbyId);
      lobby.gameStarted = false;
      lobby.gameId = null;
      
      // Reset player states
      lobby.players.forEach(p => {
        p.progress = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.completedAt = null;
      });
      
      io.to(game.lobbyId).emit('lobby_reset', { lobby: filterLobbyData(lobby) });
    }
    
    // Remove game data
    games.delete(game.id);
  }, 10000);
}

// Helper function to calculate player score
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

// Function to determine difficulty level based on text
function getDifficultyLevel(text) {
  const wordCount = text.split(' ').length;
  const avgWordLength = text.length / wordCount;
  
  if (avgWordLength < 4.5) return 'easy';
  else if (avgWordLength < 7) return 'medium';
  else return 'hard';
}

// Helper function for simulating AI progress
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
  const updateInterval = Math.max(500, Math.min(1000, totalSeconds * 10)); // Update 10+ times during the race
  const progressPerUpdate = 100 / (totalSeconds * 1000 / updateInterval);
  
  let currentProgress = 0;
  
  const aiInterval = setInterval(() => {
    if (!games.has(game.id) || game.state !== 'playing') {
      clearInterval(aiInterval);
      return;
    }
    
    // Add variability to the AI's typing speed
    const variabilityFactor = 1 + ((Math.random() * aiSettings.variability / 100) - (aiSettings.variability / 200));
    currentProgress += progressPerUpdate * variabilityFactor;
    
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(aiInterval);
      
      // Update AI player progress
      const aiIndex = game.players.findIndex(p => p.isAI);
      if (aiIndex !== -1) {
        const aiAccuracy = game.players[aiIndex].accuracy;
        // Calculate mistypes based on accuracy - lower accuracy means more mistypes
        const mistypedWordsCount = Math.floor((100 - aiAccuracy) / 5);
        
        game.players[aiIndex].progress = 100;
        game.players[aiIndex].completedAt = Date.now();
        game.players[aiIndex].mistypedWords = mistypedWordsCount;
        game.finishedPlayers++;
        
        // Calculate score for AI player
        game.players[aiIndex].score = calculatePlayerScore(game, game.players[aiIndex], game.finishedPlayers === 1);
      }
      
      // Send progress update to all players
      io.to(game.lobbyId).emit('player_progress', {
        playerId: aiPlayer.id,
        progress: 100,
        wpm: aiPlayer.wpm,
        accuracy: aiPlayer.accuracy,
        score: aiPlayer.score || 0,
        completed: true
      });
      
      // End game if all players have finished
      if (game.finishedPlayers === game.players.length) {
        endGame(game, io);
      }
    } else {
      // Update AI player stats
      const aiIndex = game.players.findIndex(p => p.isAI);
      if (aiIndex !== -1) {
        game.players[aiIndex].progress = Math.floor(currentProgress);
        
        // Add some WPM variability over time
        const wpmVariability = Math.random() * aiSettings.variability - (aiSettings.variability / 2);
        game.players[aiIndex].wpm = Math.floor(aiSettings.baseWPM + wpmVariability);
      }
      
      // Broadcast progress update
      io.to(game.lobbyId).emit('player_progress', {
        playerId: aiPlayer.id,
        progress: Math.floor(currentProgress),
        wpm: aiPlayer.wpm,
        accuracy: aiPlayer.accuracy
      });
    }
  }, updateInterval);
  
  // Store the interval ID in the game object so we can clear it later if needed
  game.aiInterval = aiInterval;
}

// Helper function to get a random number in a range
function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add function to clean up resources - useful for testing
socketHandler.cleanup = function() {
  // Clear all disconnect timeouts
  disconnectTimeouts.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  disconnectTimeouts.clear();
  
  // Clear other resources
  lobbies.clear();
  games.clear();
  players.clear();
};

module.exports = socketHandler;
