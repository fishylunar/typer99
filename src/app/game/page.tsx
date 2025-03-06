/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { useTyping } from '@/hooks/useTyping';
import { TypingText } from '@/components/ui/TypingText';
import { PlayerProgress } from '@/components/PlayerProgress';
import { Countdown } from '@/components/Countdown';
import { GameResults } from '@/components/GameResults';
import { getSocket } from '@/lib/socket';
import { AvailableWordlists } from '@/types';
import Link from 'next/link';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lobbyId = searchParams.get('lobbyId');
  
  const {
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
  } = useGame();
  
  // Prevent navigating away accidentally
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGameActive || isGameStarting) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGameActive, isGameStarting]);
  
  // Redirect if no lobby ID
  useEffect(() => {
    if (!lobbyId) {
      router.replace('/');
    }
  }, [lobbyId, router]);

  // Add debug logging
  useEffect(() => {
    console.log("Game page state:", {
      gameState,
      gameText,
      countdown,
      isGameStarting,
      isGameActive
    });
  }, [gameState, gameText, countdown, isGameStarting, isGameActive]);
  
  // Prevent space key scrolling at the page level
  useEffect(() => {
    const preventSpaceScroll = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', preventSpaceScroll);
    return () => window.removeEventListener('keydown', preventSpaceScroll);
  }, []);
  
  // Typing functionality
  const typing = useTyping({
    text: gameText || '',
    onProgress: (progress, wpm, accuracy) => {
      updateProgress(progress, wpm, accuracy);
    },
    onComplete: (wpm, accuracy, timeInSeconds) => {
      completeGame(wpm, accuracy, timeInSeconds);
    }
  });

  // Add state to fetch wordlist metadata
  const [wordlistInfo, setWordlistInfo] = useState({
    name: '',
    nsfw: false,
    eligibleForXP: true
  });
  
  // Get wordlist info from game state
  useEffect(() => {
    if (gameState?.wordlist) {
      // This would need to be fetched from the server or passed through the game state
      const socket = getSocket();
      socket.emit('get_wordlists');
      socket.once('wordlists', (wordlists: AvailableWordlists) => {
        const selectedWordlist = wordlists[gameState.wordlist || 'standard'] || {
          name: 'Standard',
          nsfw: false,
          eligibleForXP: true
        };
        setWordlistInfo(selectedWordlist);
      });
    }
  }, [gameState?.wordlist]);
  
  if (!gameState && !isGameStarting) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Waiting for game...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="mt-4 text-sm text-muted-foreground">

            Game state: {gameState ? ((gameState as any)?.state || 'Unknown') : 'Not connected'}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
                  {isGameStarting ? `Countdown: ${countdown}` : 'No countdown'}
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.replace('/')}
              className="px-3 py-1 bg-primary text-white rounded-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }
  
  if (isGameFinished && rankings) {
    return <GameResults rankings={rankings} gameStats={gameStats} currentPlayerId={currentPlayerId} />;
  }
  
  return (
    <main className="min-h-screen flex flex-col p-4 bg-background">
      <div className="max-w-4xl w-full mx-auto mt-4">
        {isGameStarting && countdown !== null ? (
          <Countdown value={countdown} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - Player progress */}
            <div className="md:col-span-1 order-2 md:order-1">
              <h2 className="text-lg font-bold mb-3">Players</h2>
              <div className="space-y-2">
                {gameState?.players.map(player => (
                  <PlayerProgress 
                    key={player.id} 
                    player={player} 
                    isCurrentPlayer={player.id === currentPlayerId} 
                  />
                ))}
              </div>
            </div>
            
            {/* Main content - Typing area */}
            <div className="md:col-span-2 order-1 md:order-2">
              <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
                <div className="flex justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Type!</h2>
                    <p className="text-muted-foreground">
                      {gameState?.gameMode === "battle-royale" ? 
                        "Battle Royale - Watch out for attacks!" : 
                        gameState?.gameMode === "1v1" ? 
                          "1v1 - Race to finish first!" : 
                          "Free for All - Race to finish!"}
                    </p>
                    {/* Add wordlist name display */}
                    {wordlistInfo.name && (
                      <p className="text-xs mt-1">
                        Wordlist: {wordlistInfo.name}
                        {wordlistInfo.nsfw && <span className="text-error ml-1">(NSFW)</span>}
                        {!wordlistInfo.eligibleForXP && <span className="text-warning ml-1">(No XP)</span>}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-primary">
                      {typing.wpm} <span className="text-sm text-muted-foreground">WPM</span>
                    </div>
                    <div className="text-muted-foreground">
                      {typing.accuracy}% accuracy
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className="border rounded-md p-4 bg-background min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary" 
                    tabIndex={0}
                    ref={typing.inputRef}
                    onKeyDown={(e) => {
                      if (e.code === 'Space') {
                        e.preventDefault();
                      }
                    }}
                  >
                    {gameText && (
                      <TypingText 
                        text={gameText} 
                        currentInput={typing.currentInput} 
                        className="mb-4"
                      />
                    )}
                  </div>
                  
                  {typing.completed && (
                    <div className="absolute inset-0 bg-success/10 backdrop-blur-sm rounded-md flex items-center justify-center">
                      <div className="bg-card p-4 rounded-lg border border-success text-center">
                        <h3 className="text-xl font-bold text-success mb-1">Completed!</h3>
                        <p className="text-muted-foreground">Waiting for other players...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 h-2 bg-neutral rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${typing.completed ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${typing.progress}%` }}
                  />
                </div>
                
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Click the text area or press any key to focus
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Game...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  );
}
