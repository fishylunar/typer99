import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Typer-99
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            A battle royale typing game where speed and accuracy determine your fate.
          </p>
          <p>
            &copy; {new Date().getFullYear()} Typer-99. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
