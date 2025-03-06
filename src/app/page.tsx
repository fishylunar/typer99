'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, reconnectSocket } from '@/lib/socket';
import { GameMode, AIDifficulty, AvailableWordlists } from '@/types';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [lobbyId, setLobbyId] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('free-for-all');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [wordlists, setWordlists] = useState<AvailableWordlists>({});
  const [selectedWordlist, setSelectedWordlist] = useState('standard');
  const [showAdult, setShowAdult] = useState(false);

  // Connect socket and get available wordlists
  useEffect(() => {
    reconnectSocket();
    const socket = getSocket();
    
    const handleWordlists = (lists: AvailableWordlists) => {
      setWordlists(lists);
    };
    
    socket.on('wordlists', handleWordlists);
    socket.emit('get_wordlists');
    
    return () => {
      socket.off('wordlists', handleWordlists);
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }
    
    if (lobbyId) {
      // Join existing lobby
      router.push(`/lobby?nickname=${encodeURIComponent(nickname)}&lobbyId=${encodeURIComponent(lobbyId)}`);
    } else {
      // Create new lobby with selected game mode and wordlist
      const params = new URLSearchParams({
        nickname: nickname,
        mode: gameMode
      });
      
      if (gameMode === 'practice') {
        params.append('aiDifficulty', aiDifficulty);
      }
      
      params.append('wordlist', selectedWordlist);
      
      router.push(`/lobby?${params.toString()}`);
    }
  };

  // Filter out NSFW wordlists unless showAdult is true
  const filteredWordlists = Object.entries(wordlists).filter(([_, data]) => {
    return showAdult || !data.nsfw;
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Typer-99</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-2 rounded border border-input bg-background"
                placeholder="Enter nickname"
                maxLength={16}
              />
            </div>
            
            {/* Wordlist Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Word List
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showAdult" 
                    checked={showAdult} 
                    onChange={() => setShowAdult(!showAdult)}
                  />
                  <label htmlFor="showAdult" className="text-xs text-muted-foreground">
                    Show NSFW lists
                  </label>
                </div>
              </div>
              
              <select
                value={selectedWordlist}
                onChange={(e) => setSelectedWordlist(e.target.value)}
                className="w-full p-2 rounded border border-input bg-background"
              >
                {filteredWordlists.map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.name}{data.nsfw ? ' (NSFW)' : ''} - {data.eligibleForXP ? '✓ XP' : '✗ No XP'}
                  </option>
                ))}
              </select>
              
              {/* Description of selected wordlist */}
              {selectedWordlist && wordlists[selectedWordlist] && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {wordlists[selectedWordlist].description}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Join Existing Lobby (Optional)
              </label>
              <input
                type="text"
                value={lobbyId}
                onChange={(e) => setLobbyId(e.target.value)}
                className="w-full p-2 rounded border border-input bg-background"
                placeholder="Enter lobby ID or leave blank to create one"
              />
            </div>
            
            {!lobbyId && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`p-2 rounded text-center border transition-colors ${
                      gameMode === 'free-for-all' 
                        ? 'bg-primary text-white border-primary hover:bg-primary/80' 
                        : 'bg-neutral text-foreground border-border hover:border-primary hover:bg-neutral/80'
                    }`}
                    onClick={() => setGameMode('free-for-all')}
                  >
                    Free For All
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center border transition-colors ${
                      gameMode === '1v1' 
                        ? 'bg-primary text-white border-primary hover:bg-primary/80' 
                        : 'bg-neutral text-foreground border-border hover:border-primary hover:bg-neutral/80'
                    }`}
                    onClick={() => setGameMode('1v1')}
                  >
                    1v1 Duel
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center border transition-colors ${
                      gameMode === 'battle-royale' 
                        ? 'bg-primary text-white border-primary hover:bg-primary/80' 
                        : 'bg-neutral text-foreground border-border hover:border-primary hover:bg-neutral/80'
                    }`}
                    onClick={() => setGameMode('battle-royale')}
                  >
                    Battle Royale
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center border transition-colors ${
                      gameMode === 'practice' 
                        ? 'bg-primary text-white border-primary hover:bg-primary/80' 
                        : 'bg-neutral text-foreground border-border hover:border-primary hover:bg-neutral/80'
                    }`}
                    onClick={() => setGameMode('practice')}
                  >
                    Practice vs AI
                  </button>
                </div>
                
                {gameMode === 'practice' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">
                      AI Difficulty
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        className={`p-1 text-sm rounded text-center ${aiDifficulty === 'easy' ? 'bg-accent text-white' : 'bg-neutral text-foreground'}`}
                        onClick={() => setAiDifficulty('easy')}
                      >
                        Easy
                      </button>
                      <button
                        type="button"
                        className={`p-1 text-sm rounded text-center ${aiDifficulty === 'medium' ? 'bg-accent text-white' : 'bg-neutral text-foreground'}`}
                        onClick={() => setAiDifficulty('medium')}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`p-1 text-sm rounded text-center ${aiDifficulty === 'hard' ? 'bg-accent text-white' : 'bg-neutral text-foreground'}`}
                        onClick={() => setAiDifficulty('hard')}
                      >
                        Hard
                      </button>
                      <button
                        type="button"
                        className={`p-1 text-sm rounded text-center ${aiDifficulty === 'expert' ? 'bg-accent text-white' : 'bg-neutral text-foreground'}`}
                        onClick={() => setAiDifficulty('expert')}
                      >
                        Expert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-2 bg-primary text-white rounded font-medium"
            >
              {lobbyId ? 'Join Lobby' : 'Create Lobby'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
