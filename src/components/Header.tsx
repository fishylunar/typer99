'use client'
import React, { useState } from 'react';
import Link from 'next/link';
// import { useThemeContext } from '@/components/providers/ThemeProvider';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';

export const Header: React.FC = () => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  // const { currentTheme } = useThemeContext();

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Typer-99</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-md hover:bg-neutral"
            aria-label="Theme settings"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-foreground"
            >
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
            </svg>
          </button>
        </nav>
      </div>
      
      {isThemeMenuOpen && (
        <div className="absolute right-4 top-16 z-10 w-72 bg-card rounded-md border border-border shadow-lg">
          <ThemeCustomizer />
          <div className="p-4 bg-neutral/30 border-t border-border flex justify-end">
            <button
              onClick={() => setIsThemeMenuOpen(false)}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
