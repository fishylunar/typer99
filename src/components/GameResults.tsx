import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { Player, GameStats, AvailableWordlists } from '@/types';
import { getSocket } from '@/lib/socket';

interface GameResultsProps {
  rankings: Player[];
  gameStats?: GameStats | null;
  currentPlayerId: string | null;
}

export const GameResults: React.FC<GameResultsProps> = ({ 
  rankings, 
  gameStats, 
  currentPlayerId 
}) => {
  // const router = useRouter();
  const [wordlistInfo, setWordlistInfo] = useState<{name: string, nsfw: boolean, eligibleForXP: boolean} | null>(null);
  
  // Get wordlist info if available
  useEffect(() => {
    if (gameStats?.wordlist) {
      const socket = getSocket();
      socket.emit('get_wordlists');
      socket.once('wordlists', (wordlists: AvailableWordlists) => {
        if (gameStats.wordlist && wordlists[gameStats.wordlist]) {
          setWordlistInfo(wordlists[gameStats.wordlist]);
        }
      });
    }
  }, [gameStats?.wordlist]);

  // Find current player's rank
  const currentPlayer = rankings.find(p => p.id === currentPlayerId);
  const isWinner = currentPlayer?.rank === 1;
  
  // Format game duration
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if this was a practice game against AI
  const isPracticeMode = gameStats?.mode === 'practice';
  const aiPlayer = rankings.find(p => p.id.startsWith('ai-'));
  const humanPlayer = rankings.find(p => p.id === currentPlayerId);
  const didBeatAI = humanPlayer && aiPlayer && 
                    (humanPlayer.rank !== undefined) && 
                    (aiPlayer.rank !== undefined) && 
                    (humanPlayer.rank < aiPlayer.rank);
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isWinner ? (
              <span className="text-success">You Won!</span>
            ) : isPracticeMode && didBeatAI ? (
              <span className="text-success">You Beat the AI!</span>
            ) : isPracticeMode ? (
              <span>Practice Complete</span>
            ) : (
              <span>Game Over</span>
            )}
          </h1>
          <p className="text-muted-foreground">
            {gameStats?.mode === '1v1' ? '1v1 Duel' : 
             gameStats?.mode === 'free-for-all' ? 'Free for All' : 
             gameStats?.mode === 'practice' ? 'Practice Mode' :
             'Battle Royale'} - {gameStats && formatTime(gameStats.duration)} 
          </p>
          {/* Display wordlist info if available */}
          {wordlistInfo && (
            <p className="text-sm mt-2">
              Wordlist: {wordlistInfo.name}
              {wordlistInfo.nsfw && <span className="ml-2 text-xs px-1.5 py-0.5 bg-error/20 text-error rounded">NSFW</span>}
              {!wordlistInfo.eligibleForXP && <span className="ml-2 text-xs px-1.5 py-0.5 bg-warning/20 text-warning rounded">No XP</span>}
            </p>
          )}
        </div>
        
        <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Final Rankings</h2>
            
            <div className="space-y-3">
              {rankings.map((player) => {
                const isCurrentPlayer = player.id === currentPlayerId;
                
                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center p-3 rounded-md ${
                      isCurrentPlayer ? 'bg-primary/10 border border-primary' : 
                      player.rank === 1 ? 'bg-success/10 border border-success' : 
                      'bg-card border border-border'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral mr-3">
                      {player.rank}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium">{player.nickname}</span>
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            You
                          </span>
                        )}
                        {!player.connected && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-neutral text-muted-foreground">
                            Disconnected
                          </span>
                        )}
                      </div>
                      {player.completedAt && (
                        <div className="text-xs text-muted-foreground">
                          Finished {player.mistypedWords !== undefined && (
                            <span className="ml-1">• {player.mistypedWords} mistyped words</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono font-bold text-accent">
                        {player.score || 0} <span className="text-xs text-muted-foreground">XP</span>
                      </div>
                      <div className="font-mono font-medium">
                        {player.wpm} <span className="text-xs text-muted-foreground">WPM</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.accuracy}% accuracy
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {isPracticeMode && (
            <div className="mb-4 text-center">
              <Link 
                href={`/lobby?nickname=${humanPlayer?.nickname || ''}&mode=practice&aiDifficulty=${
                  // Use a type assertion for the AI difficulty or provide a default
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((aiPlayer as any)?.difficulty || 'medium')
                }`}
                className="inline-block px-4 py-2 bg-primary text-white rounded-md mx-auto"
              >
                Practice Again
              </Link>
            </div>
          )}
          
          <div className="border-t border-border p-4 bg-neutral/30 flex justify-between items-center">
            <Link 
              href="/"
              className="text-sm text-primary hover:underline"
            >
              Return to Home
            </Link>
            
            <div className="text-sm text-muted-foreground">
              {gameStats?.textLength && `${Math.round(gameStats.textLength / 5)} words`}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
