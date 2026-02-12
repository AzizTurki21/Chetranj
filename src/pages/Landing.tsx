import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../lib/gameContext';
import { ArrowRight, Play } from 'lucide-react';

export const Landing: React.FC = () => {
  const { createRoom, joinRoom } = useGame();
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');

  const handleCreate = async () => {
    const id = await createRoom();
    navigate(`/room/${id}/color`);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      await joinRoom(joinId.trim());
      navigate(`/room/${joinId}/color`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-6xl font-serif text-amber-500 drop-shadow-lg">Chetranj</h1>
        <p className="text-xl text-amber-200/80 font-light tracking-wide">Café du sport</p>
      </div>

      <div className="w-full max-w-md space-y-6 bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-amber-900/30 shadow-2xl">
        <button
          onClick={handleCreate}
          className="w-full group relative px-6 py-4 bg-gradient-to-r from-amber-700 to-amber-900 rounded-xl overflow-hidden shadow-lg hover:shadow-amber-900/50 transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
          <span className="relative flex items-center justify-center text-xl font-bold text-amber-50 gap-2">
            Create New Game <Play size={20} fill="currentColor" />
          </span>
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-amber-800/50"></div>
          <span className="flex-shrink-0 mx-4 text-amber-700">OR</span>
          <div className="flex-grow border-t border-amber-800/50"></div>
        </div>

        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="flex-1 bg-black/50 border border-amber-800/50 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-700/50 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-amber-800 hover:bg-amber-700 text-amber-100 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};
