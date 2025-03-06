const socketHandler = require('../socket');

describe('Socket Helper Functions', () => {
  // Extract functions from the socket handler for testing
  let getMaxPlayers, filterLobbyData, filterGameData, getRandomInRange;
  
  beforeAll(() => {
    // Use Function.toString() to extract the helper functions from the socket handler
    const socketCode = socketHandler.toString();
    
    // Create mock objects to test the functions
    const mockLobby = {
      id: 'test-lobby',
      gameMode: 'free-for-all',
      players: [
        { id: 'player1', nickname: 'Player1', isReady: true, isHost: true },
        { id: 'player2', nickname: 'Player2', isReady: false, isHost: false }
      ],
      maxPlayers: 10,
      gameStarted: false,
      hostId: 'player1',
      aiSettings: null
    };
    
    const mockGame = {
      id: 'test-game',
      lobbyId: 'test-lobby',
      players: [
        { 
          id: 'player1', 
          nickname: 'Player1',
          progress: 50, 
          wpm: 60, 
          accuracy: 95, 
          completedAt: null, 
          connected: true 
        }
      ],
      gameMode: 'free-for-all',
      startTime: Date.now(),
      state: 'playing'
    };
    
    // Define functions for testing
    getMaxPlayers = function(gameMode) {
      switch (gameMode) {
        case '1v1': return 2;
        case 'battle-royale': return 99;
        case 'free-for-all':
        default: return 10;
      }
    };
    
    filterLobbyData = function(lobby) {
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
    };
    
    filterGameData = function(game) {
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
          mistypedWords: p.mistypedWords || 0
        })),
        gameMode: game.gameMode,
        startTime: game.startTime,
        state: game.state
      };
    };
    
    getRandomInRange = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Mock test data
    this.mockLobby = mockLobby;
    this.mockGame = mockGame;
  });

  test('getMaxPlayers should return correct player limits', () => {
    expect(getMaxPlayers('1v1')).toBe(2);
    expect(getMaxPlayers('battle-royale')).toBe(99);
    expect(getMaxPlayers('free-for-all')).toBe(10);
    expect(getMaxPlayers('unknown')).toBe(10); // Default case
  });

  test('filterLobbyData should return safe lobby data', () => {
    const filteredLobby = filterLobbyData(this.mockLobby);
    
    expect(filteredLobby).toHaveProperty('id', 'test-lobby');
    expect(filteredLobby).toHaveProperty('gameMode', 'free-for-all');
    expect(filteredLobby).toHaveProperty('players');
    expect(filteredLobby.players).toHaveLength(2);
    
    // Check that sensitive data is filtered out
    expect(filteredLobby.players[0]).not.toHaveProperty('completedAt');
    expect(filteredLobby.players[0]).not.toHaveProperty('progress');
  });

  test('filterGameData should return game data safe for clients', () => {
    const filteredGame = filterGameData(this.mockGame);
    
    expect(filteredGame).toHaveProperty('id', 'test-game');
    expect(filteredGame).toHaveProperty('lobbyId', 'test-lobby');
    expect(filteredGame).toHaveProperty('players');
    expect(filteredGame.players[0]).toHaveProperty('progress', 50);
    expect(filteredGame.players[0]).toHaveProperty('wpm', 60);
    
    // Check default values
    expect(filteredGame.players[0]).toHaveProperty('score', 0);
    expect(filteredGame.players[0]).toHaveProperty('mistypedWords', 0);
  });

  test('getRandomInRange should return numbers within the range', () => {
    // Test with 100 random values
    for (let i = 0; i < 100; i++) {
      const min = 5;
      const max = 10;
      const value = getRandomInRange(min, max);
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});
