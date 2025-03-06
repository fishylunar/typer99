import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, emitEvent } from '@/lib/socket';
import { Game, Player, GameStats } from '@/types';

interface UseGameReturn {
  gameState: Game | null;
  gameText: string | null;
  countdown: number | null;
  isGameStarting: boolean;
  isGameActive: boolean;
  isGameFinished: boolean;
  rankings: Player[] | null;
  gameStats: GameStats | null;
  updateProgress: (progress: number, wpm: number, accuracy: number) => void;
  completeGame: (wpm: number, accuracy: number, timeInSeconds: number, mistypedWords?: number) => void;
  currentPlayerId: string | null;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [gameText, setGameText] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [rankings, setRankings] = useState<Player[] | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const socket = getSocket();
    setCurrentPlayerId(socket.id);
    
    const handleGameStarting = ({ countdown: count }: { countdown: number }) => {
      console.log("Game starting handler in useGame:", count);
      setCountdown(count);
      setIsGameStarting(true);
      
      // Set up countdown timer
      let remaining = count;
      const countdownInterval = setInterval(() => {
        remaining--;
        setCountdown(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };
    
    const handleGameStarted = ({ 
      gameId: id, 
      text, 
      gameState: state 
    }: { 
      gameId: string; 
      text: string; 
      gameState: Game;
    }) => {
      console.log("Game started handler in useGame:", id, state);
      setGameId(id);
      setGameText(text);
      setGameState(state);
      setIsGameStarting(false);
      setCountdown(null);
    };
    
    const handlePlayerProgress = ({ 
      playerId, 
      progress, 
      wpm, 
      accuracy 
    }: { 
      playerId: string; 
      progress: number; 
      wpm: number; 
      accuracy: number;
      completed?: boolean;
    }) => {
      setGameState(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          players: prev.players.map(player =>
            player.id === playerId
              ? { ...player, progress, wpm, accuracy }
              : player
          )
        };
      });
    };
    
    const handleGameEnded = ({ 
      rankings: finalRankings, 
      gameStats: stats
    }: { 
      rankings: Player[]; 
      gameStats: GameStats;
    }) => {
      setRankings(finalRankings);
      setGameStats(stats);
      
      // Clear any update intervals
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
    
    const handleWordAttack = ({ 
      attackerId, 
      attackerName, 
      wordCount 
    }: { 
      attackerId: string; 
      attackerName: string; 
      wordCount: number;
    }) => {
      // In a real implementation, this would add more words to the player's text
      console.log(`Attack from ${attackerName}: +${wordCount} words`);
      // This would need to modify the gameText and notify the user
    };
    
    // Register event handlers
    socket.on('game_starting', handleGameStarting);
    socket.on('game_started', handleGameStarted);
    socket.on('player_progress', handlePlayerProgress);
    socket.on('game_ended', handleGameEnded);
    socket.on('word_attack', handleWordAttack);
    
    // Log all socket events for debugging
    (socket as any).onAny((event: string, ...args: unknown[]) => {
      if (event.startsWith('game_')) {
        console.log(`[Game Event] ${event}:`, args);
      }
    });

    return () => {
      // Clean up event handlers
      socket.off('game_starting', handleGameStarting);
      socket.off('game_started', handleGameStarted);
      socket.off('player_progress', handlePlayerProgress);
      socket.off('game_ended', handleGameEnded);
      socket.off('word_attack', handleWordAttack);
      
      // Clear any update intervals
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);
  
  const updateProgress = useCallback((progress: number, wpm: number, accuracy: number) => {
    if (!gameId) return;
    
    emitEvent('update_progress', {
      gameId,
      progress,
      wpm,
      accuracy
    });
  }, [gameId]);
  
  const completeGame = useCallback((wpm: number, accuracy: number, timeInSeconds: number, mistypedWords: number = 0) => {
    if (!gameId) return;
    
    console.log("Sending game_completed event to server:", { 
      gameId, wpm, accuracy, timeInSeconds, mistypedWords 
    });
    
    emitEvent('game_completed', {
      gameId,
      wpm,
      accuracy,
      time: timeInSeconds,
      mistypedWords
    });
  }, [gameId]);
  
  return {
    gameState,
    gameText,
    countdown,
    isGameStarting,
    isGameActive: Boolean(gameState && gameState.state === 'playing'),
    isGameFinished: Boolean(rankings && gameStats),
    rankings,
    gameStats,
    updateProgress,
    completeGame,
    currentPlayerId
  };
}
