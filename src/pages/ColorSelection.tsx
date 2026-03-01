import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../lib/gameContext';

export const ColorSelection: React.FC = () => {
  const { roomId } = useParams();
  const { pickColor, color } = useGame();
  const navigate = useNavigate();

  // if a colour has already been determined (e.g. the host picked white and
  // broadcasted it), skip the selection screen and go straight to the board.
  useEffect(() => {
    if (color !== null && roomId) {
      navigate(`/room/${roomId}/play`);
    }
  }, [color, navigate, roomId]);

  const handleSelect = (color: 'w' | 'b') => {
    pickColor(color);
    navigate(`/room/${roomId}/play`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <h2 className="text-3xl font-serif text-amber-200">Choose Your Side</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <button
          onClick={() => handleSelect('w')}
          className="group relative w-64 h-80 bg-slate-200 rounded-2xl shadow-2xl hover:scale-105 transition-all flex flex-col items-center justify-center border-4 border-slate-300"
        >
          <div className="text-6xl mb-4 text-slate-900">♔</div>
          <span className="text-2xl font-serif text-slate-800 font-bold">White</span>
          <span className="text-sm text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            You move first
          </span>
        </button>

        <button
          onClick={() => handleSelect('b')}
          className="group relative w-64 h-80 bg-slate-900 rounded-2xl shadow-2xl hover:scale-105 transition-all flex flex-col items-center justify-center border-4 border-slate-800"
        >
          <div className="text-6xl mb-4 text-slate-100">♚</div>
          <span className="text-2xl font-serif text-slate-100 font-bold">Black</span>
          <span className="text-sm text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Strategic defense
          </span>
        </button>
      </div>
    </div>
  );
};
