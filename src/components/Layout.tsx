import React from 'react';
import { MusicPlayer } from './MusicPlayer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-wood text-amber-50 relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 flex-1 flex flex-col">
        {children}
      </div>
      <MusicPlayer />
    </div>
  );
};
