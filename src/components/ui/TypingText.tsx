import React, { useMemo } from 'react';

interface TypingTextProps {
  text: string;
  currentInput: string;
  className?: string;
}

export const TypingText: React.FC<TypingTextProps> = ({ text, currentInput, className }) => {
  // Calculate the positions for rendering the text with appropriate styling
  const { typed, current, upcoming } = useMemo(() => {
    // Split the text into characters that have been typed vs. upcoming
    const typedChars = currentInput.split('');
    const textChars = text.split('');
    
    // Each character in typed section with correct/incorrect marking
    const typedSection = typedChars.map((char, i) => {
      const expected = textChars[i] || '';
      const isCorrect = char === expected;
      
      return {
        char: expected,
        className: isCorrect ? 'text-green-500' : 'text-red-500 bg-red-100 dark:bg-red-900'
      };
    });
    
    // Current character to type (highlighted)
    const currentChar = textChars[typedChars.length] || '';
    
    // Remaining characters
    const upcomingChars = textChars.slice(typedChars.length + 1);
    
    return {
      typed: typedSection,
      current: currentChar,
      upcoming: upcomingChars.join('')
    };
  }, [text, currentInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent scrolling on space key
    if (e.code === 'Space') {
      e.preventDefault();
    }
  };
  
  return (
    <div 
      className={`font-mono text-lg leading-relaxed ${className || ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Already typed characters */}
      {typed.map((char, i) => (
        <span key={`typed-${i}`} className={char.className}>
          {char.char}
        </span>
      ))}
      
      {/* Current character to type */}
      {current && (
        <span className="bg-primary/30 border-b-2 border-primary animate-pulse">
          {current}
        </span>
      )}
      
      {/* Upcoming characters */}
      <span className="text-muted-foreground">{upcoming}</span>
    </div>
  );
};
