'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLobby } from '@/hooks/useLobby';
import { getSocket } from '@/lib/socket';
import { Player, GameMode, AIDifficulty } from '@/types';
import { NicknameDialog } from '@/components/NicknameDialog';
import Link from 'next/link';

function LobbyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState<string | null>(searchParams.get('nickname'));
  const lobbyId = searchParams.get('lobbyId');
  const gameMode = searchParams.get('mode') as GameMode || 'free-for-all';
  const aiDifficulty = searchParams.get('aiDifficulty') as AIDifficulty || 'medium';
  const wordlist = searchParams.get('wordlist') || 'standard';
  
  // Add a ref to track join attempts
  const hasJoinedRef = useRef(false);
  
  // Fix: Change initial state to check if nickname is empty
  const [showNicknameDialog, setShowNicknameDialog] = useState(
    Boolean(lobbyId && (!nickname || nickname.trim() === ''))
  );
  
  const {
    lobby,
    error,
    isConnecting,
    joinLobby,
    startGame,
    isHost,
    currentPlayerId,
    wordlists
  } = useLobby();
  
  const [copied, setCopied] = useState(false);
  
  // Fix: Improve the nickname checking and dialog logic
  useEffect(() => {
    console.log("Checking nickname:", { nickname, lobbyId, showDialog: showNicknameDialog });
    if (lobbyId && (!nickname || nickname.trim() === '')) {
      console.log("Setting nickname dialog to true");
      setShowNicknameDialog(true);
    }
  }, [nickname, lobbyId, showNicknameDialog]);
  
  // Add a state to track join status more explicitly
  const [joinState, setJoinState] = useState<'idle' | 'joining' | 'joined' | 'error'>('idle');
  
  // Handle nickname submission
  const handleNicknameSubmit = (newNickname: string) => {
    console.log("Nickname submitted:", newNickname);
    setNickname(newNickname);
    setShowNicknameDialog(false);
  };
  
  // Join lobby when ready - with improved join state tracking
  useEffect(() => {
    if (!nickname || showNicknameDialog || joinState !== 'idle') {
      console.log("Not joining lobby yet:", { 
        nickname, 
        showDialog: showNicknameDialog,
        joinState
      });
      return;
    }
    
    console.log("Joining lobby with:", { nickname, lobbyId, gameMode, aiDifficulty, wordlist });
    
    // Update state to prevent multiple join attempts
    setJoinState('joining');
    
    joinLobby({
      nickname,
      lobbyId: lobbyId || undefined,
      gameMode: lobbyId ? undefined : gameMode,
      aiDifficulty: gameMode === 'practice' ? aiDifficulty : undefined,
      wordlist: wordlist
    });
  }, [nickname, lobbyId, gameMode, aiDifficulty, wordlist, joinLobby, showNicknameDialog, joinState]);
  
  // Track successful join
  useEffect(() => {
    if (lobby && joinState === 'joining') {
      setJoinState('joined');
    }
  }, [lobby, joinState]);
  
  // Reset join state on error
  useEffect(() => {
    if (error && joinState === 'joining') {
      setJoinState('error');
      
      // Allow retrying after a short delay
      const timer = setTimeout(() => {
        setJoinState('idle');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, joinState]);
  
  // Join lobby when ready - with fix for multiple join prevention
  useEffect(() => {
    if (!nickname || showNicknameDialog || hasJoinedRef.current) {
      console.log("Not joining lobby yet:", { 
        nickname, 
        showDialog: showNicknameDialog,
        hasJoined: hasJoinedRef.current 
      });
      return;
    }
    
    console.log("Joining lobby with:", { nickname, lobbyId, gameMode, aiDifficulty, wordlist });
    
    // Mark that we've attempted to join
    hasJoinedRef.current = true;
    
    joinLobby({
      nickname,
      lobbyId: lobbyId || undefined,
      gameMode: lobbyId ? undefined : gameMode,
      aiDifficulty: gameMode === 'practice' ? aiDifficulty : undefined,
      wordlist: wordlist
    });
  }, [nickname, lobbyId, gameMode, aiDifficulty, wordlist, joinLobby, showNicknameDialog]);
  
  // Reset the join flag when disconnected
  useEffect(() => {
    // If there's an error or we're no longer connecting but don't have a lobby
    // then we need to reset the join flag to allow another attempt
    if ((error || (!isConnecting && !lobby)) && hasJoinedRef.current) {
      console.log("Resetting join flag due to error or disconnect");
      hasJoinedRef.current = false;
    }
  }, [error, isConnecting, lobby]);
  
  // Navigate to game when it starts
  useEffect(() => {
    if (lobby?.gameStarted) {
      router.push(`/game?lobbyId=${lobby.id}`);
    }
  }, [lobby?.gameStarted, lobby?.id, router]);

  // Direct navigation on game_starting event
  useEffect(() => {
    const socket = getSocket();
    
    const handleDirectGameStart = () => {
      console.log("Forcing navigation to game page");
      if (lobby) {
        router.push(`/game?lobbyId=${lobby.id}`);
      }
    };
    
    socket.on('game_starting', handleDirectGameStart);
    
    return () => {
      socket.off('game_starting', handleDirectGameStart);
    };
  }, [router, lobby]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      router.replace('/');
    }
  }, [error, router]);
  
  // Fix: Add debugging to see values
  useEffect(() => {
    if (lobby) {
      console.log("Lobby data:", { 
        lobby, 
        isHost, 
        currentPlayerId,
        hostId: lobby.hostId 
      });
    }
  }, [lobby, isHost, currentPlayerId]);
  
  // Force check the host status
  const checkHostStatus = () => {
    const isActuallyHost = lobby && currentPlayerId === lobby.hostId;
    console.log(`Direct host check: ${isActuallyHost}`, {
      currentId: currentPlayerId,
      hostId: lobby?.hostId
    });
    return isActuallyHost;
  }
  
  // Copy invite link
  const copyInviteLink = () => {
    if (!lobby) return;
    
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    const url = `${window.location.origin}/lobby?nickname=Guest-${randomNumbers}&lobbyId=${lobby.id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => alert('Failed to copy link')
    );
  };
  
  if (isConnecting) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connecting...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </main>
    );
  }
  
  if (!lobby) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error connecting to lobby</h2>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }
  
  // Get the wordlist display name and metadata
  const currentWordlist = lobby.wordlist || 'standard';
  const wordlistMeta = wordlists[currentWordlist] || { 
    name: 'Standard', 
    description: 'Default wordlist', 
    nsfw: false,
    eligibleForXP: true 
  };
  
  return (
    <main className="min-h-screen flex flex-col p-4 bg-background">
      {/* Fix: Make sure dialog is properly rendered with high z-index */}
      {showNicknameDialog && (
        <NicknameDialog 
          isOpen={showNicknameDialog} 
          onSubmit={handleNicknameSubmit} 
        />
      )}
      
      <div className="max-w-2xl w-full mx-auto mt-8">
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Game Lobby</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm px-3 py-1 bg-accent/20 text-accent rounded-full">
                {lobby.gameMode === '1v1' ? '1v1 Duel' : 
                 lobby.gameMode === 'free-for-all' ? 'Free for All' : 
                 lobby.gameMode === 'practice' ? 'Practice' :
                 'Battle Royale'}
              </span>
              <span className="text-xs px-2 py-1 bg-neutral text-muted-foreground rounded">
                {lobby.players.length}/{lobby.maxPlayers}
              </span>
            </div>
          </div>
          
          {/* Display the selected wordlist */}
          <div className="mb-4 p-3 rounded-lg bg-background border border-border">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Wordlist: </span>
                <span className="text-sm">{wordlistMeta.name}</span>
                {wordlistMeta.nsfw && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-error/20 text-error rounded">NSFW</span>
                )}
                {!wordlistMeta.eligibleForXP && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-warning/20 text-warning rounded">No XP</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{wordlistMeta.description}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Invite Code</h2>
              <button
                onClick={copyInviteLink}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className="font-mono p-2 bg-neutral rounded text-center">
              {lobby.id}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Players</h2>
            <div className="space-y-2">
              {lobby.players.map(player => (
                <PlayerItem 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === currentPlayerId}
                />
              ))}
              
              {/* Show AI opponent for practice mode */}
              {lobby.gameMode === 'practice' && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-accent bg-accent/10">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">AI Opponent</span>
                    <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      {lobby.aiSettings?.difficulty || 'Medium'} Difficulty
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      ~{lobby.aiSettings?.baseWPM || 60} WPM
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Debug buttons - useful for troubleshooting */}
          <div className="mb-4 px-4 py-2 bg-card rounded-lg border border-border text-xs">
            <button
              onClick={() => {
                console.log("Force host status check:", checkHostStatus());
              }}
              className="px-2 py-1 bg-neutral text-white rounded mr-2"
            >
              Check Host
            </button>
            
            <button
              onClick={() => {
                startGame();
                // Add a fallback direct navigation after a short delay
                setTimeout(() => {
                  if (lobby) router.push(`/game?lobbyId=${lobby.id}`);
                }, 1000);
              }}
              className="px-2 py-1 bg-primary text-white rounded"
            >
              Force Start
            </button>
          </div>
          
          {/* Fix: Make the host condition more explicit */}
          {isHost === true ? (
            <button
              onClick={startGame}
              disabled={lobby.players.length < (lobby.gameMode === '1v1' ? 2 : 1)}
              className="w-full py-3 bg-primary text-white rounded-md font-medium disabled:opacity-50 hover:bg-primary/90"
            >
              Start Game {lobby.gameMode === '1v1' && lobby.players.length < 2 ? "(Waiting for opponent)" : ""}
            </button>
          ) : (
            <div className="text-center text-muted-foreground">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Lobby...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    }>
      <LobbyPageContent />
    </Suspense>
  );
}

interface PlayerItemProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const PlayerItem: React.FC<PlayerItemProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isCurrentPlayer ? 'border-primary bg-primary/10' : 'border-border'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isCurrentPlayer ? 'text-primary' : ''}`}>
          {player.nickname}
        </span>
        {isCurrentPlayer && (
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            You
          </span>
        )}
      </div>
      {player.isHost && (
        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
          Host
        </span>
      )}
    </div>
  );
};
