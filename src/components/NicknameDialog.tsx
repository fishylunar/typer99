import React, { useState } from 'react';

interface NicknameDialogProps {
  isOpen: boolean;
  onSubmit: (nickname: string) => void;
}

export const NicknameDialog: React.FC<NicknameDialogProps> = ({ isOpen, onSubmit }) => {
  const [nickname, setNickname] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
        <h2 className="text-xl font-bold mb-4">Enter Your Nickname</h2>
        <p className="text-muted-foreground mb-4">
          You're joining an existing lobby. Please enter a nickname to continue.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="w-full p-2 border border-input rounded-md bg-background"
              maxLength={15}
              autoComplete="off"
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium disabled:opacity-50"
          >
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  );
};
