import React, { useEffect, useState } from 'react';

interface WordAttackNotificationProps {
  attackerName: string;
  wordCount: number;
  onDismiss: () => void;
}

export const WordAttackNotification: React.FC<WordAttackNotificationProps> = ({ 
  attackerName, 
  wordCount, 
  onDismiss 
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Allow animation to finish
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div 
      className={`fixed bottom-8 right-8 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg 
      transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center">
        <div className="mr-3 bg-white/20 p-2 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m13 2-2 2.5-2-2.5"/>
            <path d="M11 13.5V7.5"/>
            <path d="M9 5c-3.507 1-6 5-6 9v1c0 2.5 2 4 4 4h8c2 0 4-1.5 4-4v-1c0-4-2.493-8-6-9Z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold">Word Attack!</h3>
          <p className="text-sm">
            {attackerName} sent you {wordCount} extra words!
          </p>
        </div>
      </div>
    </div>
  );
};
