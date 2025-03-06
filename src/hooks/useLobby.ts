import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, emitEvent } from '@/lib/socket';
import { Lobby, LobbyJoinParams, Player, GameMode } from '@/types';

export function useLobby() {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const isHostRef = useRef(false);
  
  // Update host status when lobby or currentPlayerId changes
  useEffect(() => {
    if (lobby && currentPlayerId) {
      const hostStatus = lobby.hostId === currentPlayerId;
      setIsHost(hostStatus);
      isHostRef.current = hostStatus;
      
      console.log("Host check (in effect):", {
        isHost: hostStatus,
        hostId: lobby.hostId,
        currentId: currentPlayerId,
        playersCount: lobby.players?.length
      });
    }
  }, [lobby, currentPlayerId]);

  useEffect(() => {
    const socket = getSocket();
    
    const handleLobbyJoined = ({ lobby }: { lobby: Lobby }) => {
      setLobby(lobby);
      setIsConnecting(false);
      setCurrentPlayerId(socket.id);
      
      // Important: Update host status immediately on join
      const hostStatus = lobby.hostId === socket.id;
      setIsHost(hostStatus);
      isHostRef.current = hostStatus;
      
      console.log("Lobby joined:", {
        hostId: lobby.hostId,
        currentId: socket.id,
        isHost: hostStatus,
        players: lobby.players.map(p => ({ id: p.id, nickname: p.nickname, isHost: p.isHost }))
      });
    };
    
    const handlePlayerJoined = ({ player, lobbyState }: { player: Player, lobbyState: Lobby }) => {
      setLobby(lobbyState);
      
      // Re-check host status when players change
      if (currentPlayerId) {
        const hostStatus = lobbyState.hostId === currentPlayerId;
        setIsHost(hostStatus);
        isHostRef.current = hostStatus;
      }
    };
    
    const handlePlayerLeft = ({ playerId, lobbyState }: { playerId: string, lobbyState: Lobby }) => {
      setLobby(lobbyState);
      
      // Re-check host status when players change
      if (currentPlayerId) {
        const hostStatus = lobbyState.hostId === currentPlayerId;
        setIsHost(hostStatus);
        isHostRef.current = hostStatus;
      }
    };
    
    const handleError = ({ message }: { message: string }) => {
      setError(message);
      setIsConnecting(false);
    };
    
    const handleLobbyReset = ({ lobby }: { lobby: Lobby }) => {
      setLobby(lobby);
    };

    const handleGameStarting = ({ countdown }: { countdown: number }) => {
      console.log("Game starting with countdown:", countdown);
      // Update local lobby state immediately to trigger navigation
      setLobby(prev => prev ? { ...prev, gameStarted: true } : null);
    };
    
    // Register socket event listeners
    socket.on('lobby_joined', handleLobbyJoined);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('error', handleError);
    socket.on('lobby_reset', handleLobbyReset);
    socket.on('game_starting', handleGameStarting);
    
    // Clean up listeners on unmount
    return () => {
      socket.off('lobby_joined', handleLobbyJoined);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('error', handleError);
      socket.off('lobby_reset', handleLobbyReset);
      socket.off('game_starting', handleGameStarting);
    };
  }, [currentPlayerId]);
  
  const joinLobby = useCallback((params: LobbyJoinParams) => {
    setIsConnecting(true);
    setError(null);
    emitEvent('join_lobby', params);
  }, []);
  
  const startGame = useCallback(() => {
    console.log("Start game called, isHost:", isHost, isHostRef.current);
    if (!lobby) return;
    emitEvent('start_game', { lobbyId: lobby.id });
  }, [lobby, isHost]);
  
  const leaveLobby = useCallback(() => {
    // We don't need a special event for this - disconnecting will handle it
    setLobby(null);
  }, []);
  
  return {
    lobby,
    error,
    isConnecting,
    currentPlayerId,
    joinLobby,
    startGame,
    leaveLobby,
    isHost
  };
}
