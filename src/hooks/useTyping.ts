import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingState } from '@/types';

interface UseTypingProps {
  text: string;
  onProgress?: (progress: number, wpm: number, accuracy: number) => void;
  onComplete?: (wpm: number, accuracy: number, timeInSeconds: number, mistypedWords: number) => void;
}

export function useTyping({ text, onProgress, onComplete }: UseTypingProps) {
  const [state, setState] = useState<TypingState>({
    currentInput: '',
    correctChars: 0,
    incorrectChars: 0,
    totalChars: text.length,
    startTime: null,
    wpm: 0,
    accuracy: 100,
    completed: false,
    totalKeystrokes: 0,
    mistypedWords: 0
  });
  
  // References for tracking words and handling completion
  const lastReportTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const metricsRef = useRef({ wpm: 0, accuracy: 100 });
  const completionCallbackRef = useRef<boolean>(false);
  
  // Improved word tracking - track all words that had errors at any point
  const textWordsRef = useRef<string[]>(text.split(' '));
  const mistypedWordsSetRef = useRef<Set<number>>(new Set());
  const currentWordIndexRef = useRef<number>(0);
  const currentWordErrorRef = useRef<boolean>(false);
  
  // Calculate WPM and accuracy
  const calculateMetrics = useCallback(() => {
    if (!state.startTime) return { wpm: 0, accuracy: 100 };
    
    const timeElapsed = (Date.now() - state.startTime) / 1000; // in seconds
    const minutes = timeElapsed / 60;
    
    // Standard calculation: 5 characters = 1 word
    const wpm = Math.round((state.correctChars / 5) / minutes);
    
    // Calculate accuracy based on total keystrokes including edits
    const accuracy = state.totalKeystrokes === 0 
      ? 100 
      : Math.round((state.correctChars / state.totalKeystrokes) * 100);
    
    return { wpm, accuracy };
  }, [state.startTime, state.correctChars, state.totalKeystrokes]);
  
  // Enhanced mistyped words counting that returns the actual count of mistyped words
  const countMistypedWords = useCallback(() => {
    // Return the size of the Set containing all word indexes that had errors
    return mistypedWordsSetRef.current.size;
  }, []);
  
  // Helper function to analyze current input and update mistyped words
  const updateMistypedWordsTracking = useCallback((input: string) => {
    const words = input.split(' ');
    const currentWordIndex = words.length - 1;
    
    // If on a new word, check the previous word for errors
    if (currentWordIndex > currentWordIndexRef.current) {
      // Previous word is now complete
      const previousWord = words[currentWordIndex - 1];
      const expectedWord = textWordsRef.current[currentWordIndex - 1];
      
      // If the previous word was incorrect, mark it as mistyped
      if (previousWord !== expectedWord) {
        mistypedWordsSetRef.current.add(currentWordIndex - 1);
      }
      
      // Reset error tracking for the new word
      currentWordIndexRef.current = currentWordIndex;
      currentWordErrorRef.current = false;
    }
    
    // Check current word for errors
    if (currentWordIndex < textWordsRef.current.length) {
      const currentWord = words[currentWordIndex];
      const expectedWordStart = textWordsRef.current[currentWordIndex].substring(0, currentWord.length);
      
      // If current input doesn't match expected text, mark this word as having an error
      if (currentWord !== expectedWordStart) {
        currentWordErrorRef.current = true;
        mistypedWordsSetRef.current.add(currentWordIndex);
      }
    }
  }, []);
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent page scrolling on space key
    if (e.code === 'Space' && inputRef.current && inputRef.current === document.activeElement) {
      e.preventDefault();
    }

    if (state.completed) return;
    
    // Start timer on first keypress
    if (!state.startTime && e.key.length === 1) {
      setState(prev => ({ ...prev, startTime: Date.now() }));
    }
    
    // Process typed character
    if (e.key.length === 1) {
      setState(prev => {
        // Compare with expected character
        const currentPosition = prev.correctChars + prev.incorrectChars;
        const expectedChar = text[currentPosition];
        
        if (currentPosition >= text.length) {
          return prev; // Already at the end of text
        }
        
        const isCorrect = e.key === expectedChar;
        
        // Create the new state
        const newInput = prev.currentInput + e.key;
        const newState = {
          ...prev,
          currentInput: newInput,
          correctChars: prev.correctChars + (isCorrect ? 1 : 0),
          incorrectChars: prev.incorrectChars + (isCorrect ? 0 : 1),
          totalKeystrokes: prev.totalKeystrokes + 1,
        };

        // Update mistyped words tracking
        updateMistypedWordsTracking(newInput);
        
        // Check for completion - when we've reached the end of the text
        const reachedEnd = newState.correctChars + newState.incorrectChars >= text.length;
        
        if (reachedEnd && !prev.completed) {
          console.log("End of text reached, allowing completion!");
          return { ...newState, completed: true };
        }
        
        return newState;
      });
    } 
    else if (e.key === 'Backspace') {
      // Handle backspace
      setState(prev => {
        if (prev.currentInput.length === 0) return prev;
        
        // Remove last character and adjust stats
        const lastChar = prev.currentInput.charAt(prev.currentInput.length - 1);
        const currentPosition = prev.correctChars + prev.incorrectChars - 1;
        const expectedChar = text[currentPosition];
        const wasCorrect = lastChar === expectedChar;
        
        const newInput = prev.currentInput.slice(0, -1);
        
        // Update mistyped words tracking after backspace
        updateMistypedWordsTracking(newInput);
        
        return {
          ...prev,
          currentInput: newInput,
          correctChars: prev.correctChars - (wasCorrect ? 1 : 0),
          incorrectChars: prev.incorrectChars - (wasCorrect ? 0 : 1),
          totalKeystrokes: prev.totalKeystrokes + 1
        };
      });
    }
  }, [state.completed, state.startTime, text, updateMistypedWordsTracking]);
  
  // Focus input element on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Add click handler to refocus
      const handleClick = () => inputRef.current?.focus();
      inputRef.current.addEventListener('click', handleClick);
      
      return () => {
        inputRef.current?.removeEventListener('click', handleClick);
      };
    }
  }, []);
  
  // Attach keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Update metrics regularly but avoid infinite loop
  useEffect(() => {
    if (state.completed || !state.startTime) return;
    
    // Use an interval to update metrics
    const updateInterval = setInterval(() => {
      const { wpm, accuracy } = calculateMetrics();
      metricsRef.current = { wpm, accuracy };
      
      // Only update state if values changed significantly
      if (Math.abs(wpm - state.wpm) > 2 || Math.abs(accuracy - state.accuracy) > 1) {
        setState(prev => ({
          ...prev,
          wpm,
          accuracy
        }));
      }
      
      // Report progress
      const progress = Math.floor((state.correctChars / state.totalChars) * 100);
      onProgress?.(progress, wpm, accuracy);
    }, 500);
    
    return () => clearInterval(updateInterval);
  }, [state.completed, state.startTime, calculateMetrics, state.correctChars, state.totalChars, onProgress]);
  
  // Handle completion separately to avoid loops
  useEffect(() => {
    // Check if we just completed and haven't fired the callback yet
    if (state.completed && !completionCallbackRef.current) {
      console.log("Game completion detected!");
      
      completionCallbackRef.current = true;
      
      const timeElapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
      const { wpm, accuracy } = metricsRef.current;
      
      // Get final mistyped words count
      const finalMistypedCount = countMistypedWords();
      console.log(`Final mistyped words count: ${finalMistypedCount}, mistyped words set:`, 
                  Array.from(mistypedWordsSetRef.current));
      
      // Prevent unrealistic WPM values
      const realElapsed = Math.max(timeElapsed, 1);
      const finalWpm = Math.min(wpm, 300);
      
      // Schedule the callback to run on the next tick
      setTimeout(() => {
        onComplete?.(finalWpm, accuracy, realElapsed, finalMistypedCount);
      }, 0);
    }
  }, [state.completed, state.startTime, onComplete, countMistypedWords]);
  
  return {
    wpm: metricsRef.current.wpm,
    accuracy: metricsRef.current.accuracy,
    progress: state.totalChars === 0 ? 0 : Math.floor((state.correctChars + state.incorrectChars) / state.totalChars * 100),
    currentInput: state.currentInput,
    completed: state.completed,
    inputRef,
    mistypedWords: countMistypedWords() // Expose mistyped words count
  };
}
