import React from 'react';
import { Player } from '@/types';

interface PlayerProgressProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export const PlayerProgress: React.FC<PlayerProgressProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div className={`mb-2 p-3 rounded-lg border ${
      isCurrentPlayer ? 'border-primary bg-primary/10' : 'border-border bg-card'
    }`}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className={`font-semibold ${isCurrentPlayer ? 'text-primary' : 'text-foreground'}`}>
            {player.nickname}
          </span>
          {player.completedAt && (
            <span className="ml-2 text-xs bg-green-500 text-white px-1 py-0.5 rounded">
              Finished
            </span>
          )}
          {!player.connected && (
            <span className="ml-2 text-xs bg-gray-500 text-white px-1 py-0.5 rounded">
              Disconnected
            </span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <span className="mr-3">{player.wpm} WPM</span>
          <span>{player.accuracy}% Acc</span>
        </div>
      </div>
      
      <div className="w-full h-2 bg-neutral rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            player.completedAt ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${player.progress}%` }}
        />
      </div>
    </div>
  );
};
