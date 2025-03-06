'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, AIDifficulty } from '@/types';

export default function HomePage() {
  const [nickname, setNickname] = useState('');
  const [lobbyId, setLobbyId] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>('free-for-all');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleCreateGame = () => {
    if (!nickname) return;
    setIsJoining(true);
    
    // Create a new lobby and navigate to lobby page
    const playerName = nickname.trim() || `Player_${Math.floor(Math.random() * 1000)}`;
    
    // Include AI difficulty only for practice mode
    const params = new URLSearchParams({
      nickname: playerName,
      mode: selectedMode
    });
    
    if (selectedMode === 'practice') {
      params.append('aiDifficulty', aiDifficulty);
    }
    
    // Navigate to lobby page, socket connection will happen there
    router.push(`/lobby?${params.toString()}`);
  };
  
  const handleJoinGame = () => {
    if (!nickname || !lobbyId) return;
    setIsJoining(true);
    
    // Join existing lobby
    const playerName = nickname.trim() || `Player_${Math.floor(Math.random() * 1000)}`;
    
    // Navigate to lobby page with ID
    router.push(`/lobby?nickname=${encodeURIComponent(playerName)}&lobbyId=${lobbyId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary">Typer-99</h1>
          <p className="mt-2 text-xl text-muted-foreground">Battle Royale Typing Game</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium mb-1">
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                className="w-full p-2 border border-input rounded-md bg-background"
                maxLength={15}
                autoComplete="off" // Disable autocomplete
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Game Mode</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(['1v1', 'free-for-all', 'battle-royale', 'practice'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`p-2 rounded-md border ${
                      selectedMode === mode
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-input bg-background text-foreground'
                    }`}
                    onClick={() => setSelectedMode(mode)}
                    type="button"
                  >
                    {mode === '1v1' ? '1v1' : 
                     mode === 'free-for-all' ? 'Free for All' : 
                     mode === 'practice' ? 'Practice' :
                     'Battle Royale'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Show AI difficulty selector when Practice mode is selected */}
            {selectedMode === 'practice' && (
              <div>
                <label className="block text-sm font-medium mb-2">AI Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['easy', 'medium', 'hard', 'expert'] as AIDifficulty[]).map((level) => (
                    <button
                      key={level}
                      className={`p-2 rounded-md border ${
                        aiDifficulty === level
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-input bg-background text-foreground'
                      }`}
                      onClick={() => setAiDifficulty(level)}
                      type="button"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <button
                onClick={handleCreateGame}
                disabled={isJoining || !nickname}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium disabled:opacity-50"
              >
                {isJoining ? 'Creating...' : 'Create Game'}
              </button>
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground">OR JOIN EXISTING</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="lobbyId" className="block text-sm font-medium mb-1">
                Lobby Code
              </label>
              <input
                id="lobbyId"
                type="text"
                value={lobbyId}
                onChange={(e) => setLobbyId(e.target.value)}
                placeholder="Enter lobby code"
                className="w-full p-2 border border-input rounded-md bg-background"
                required
              />
            </div>
            
            <div>
              <button
                onClick={handleJoinGame}
                disabled={isJoining || !nickname || !lobbyId}
                className="w-full bg-secondary hover:bg-secondary/90 text-white py-2 rounded-md font-medium disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
