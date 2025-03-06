import React from 'react';

interface CountdownProps {
  value: number;
}

export const Countdown: React.FC<CountdownProps> = ({ value }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-8">Get ready!</h2>
      <div className="text-8xl font-bold text-primary animate-pulse">
        {value}
      </div>
      <p className="mt-8 text-muted-foreground">
        Game starting soon...
      </p>
    </div>
  );
};
