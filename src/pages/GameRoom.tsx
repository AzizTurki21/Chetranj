import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { useGame } from '../lib/gameContext';
import { Chicha } from '../components/Chicha';
import { CigarettePack } from '../components/CigarettePack';
import { Copy, Check, Users } from 'lucide-react';

export const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const { 
    game, 
    makeMove, 
    turn, 
    color, 
    joinRoom, 
    status, 
    winner, 
    resetGame,
    opponentConnected
  } = useGame();
  
  const [copied, setCopied] = useState(false);
  
  // --- CLICK TO MOVE STATE ---
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
  }, [roomId]);

  // if we end up here without a colour, force the user back to the picker
  useEffect(() => {
    // only force the picker when there's another player present; we want
    // to allow solo testing without having to choose a colour.
    if (color === null && roomId && opponentConnected) {
      navigate(`/room/${roomId}/color`);
    }
  }, [color, roomId, navigate, opponentConnected]);

  // Logic to calculate and show the "blurry dots"
  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: "radial-gradient(circle, rgba(0,0,0,.2) 20%, transparent 20%)",
        borderRadius: "50%",
      };
      return move;
    });
    // Highlight the selected piece square
    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    // if there's no opponent, allow the local user to test freely
    if (!opponentConnected) {
      // still prevent moves after game over
      if (status === 'finished' || game.isGameOver()) return;
    } else {
      // when another player is connected follow normal colour/turn rules
      if (!color) return;
      if (turn !== color) return;
      if (status === 'finished' || game.isGameOver()) return;
    }

    // 1. If no piece is selected, try to select one
    if (!moveFrom) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
      return;
    }

    // 2. If a piece is selected, try to move
    const moveSuccess = makeMove(moveFrom, square);
    
    if (moveSuccess) {
      setMoveFrom(null);
      setOptionSquares({});
    } else {
      // If move failed, check if user clicked another of their own pieces to switch selection
      const hasOptions = getMoveOptions(square);
      if (hasOptions) {
        setMoveFrom(square);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGameOver = game.isGameOver();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[80vh] relative">
      
      {/* Header / Status */}
      <div className="absolute top-0 w-full flex justify-between items-start p-4 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-amber-900/50 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-200 text-sm font-bold">ROOM CODE:</span>
            <code className="bg-black/50 px-2 py-1 rounded text-amber-500 font-mono">{roomId}</code>
            <button onClick={copyLink} className="text-amber-400 hover:text-white transition">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-300/70">
            <Users size={14} />
            {opponentConnected ? 'Opponent Online' : 'Waiting for opponent...'}
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-amber-900/50 text-center pointer-events-auto min-w-[200px]">
          {isGameOver ? (
            <div>
              <h2 className="text-2xl font-bold text-red-500 mb-1">GAME OVER</h2>
              <p className="text-amber-100">
                {winner === 'draw' ? 'Draw' : `${winner === 'w' ? 'White' : 'Black'} Wins!`}
              </p>
              <button 
                onClick={resetGame}
                className="mt-2 text-xs bg-amber-700 px-3 py-1 rounded hover:bg-amber-600 transition"
              >
                Rematch
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-amber-100 flex items-center justify-center gap-2">
                {turn === 'w' ? 'White' : 'Black'}'s Turn
                <span className={`w-3 h-3 rounded-full ${turn === 'w' ? 'bg-white' : 'bg-black border border-white'}`} />
              </h2>
              {game.inCheck() && <p className="text-red-400 font-bold animate-pulse">CHECK!</p>}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="relative flex items-center justify-center w-full h-[600px] mt-16">
        
        <div className="hidden lg:block absolute left-10 bottom-20 z-10 transform -rotate-12 hover:scale-105 transition-transform duration-300">
           <CigarettePack />
        </div>

        {/* The Board with orientation fix and dots */}
       <div className="w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
  {(() => {
    const Board = Chessboard as any;
    return (
      <Board 
        key={color ?? 'none'}
        position={game.fen()} 
        onSquareClick={onSquareClick} // The Click logic
        boardOrientation={color === 'b' ? 'black' : 'white'} // The POV logic
        customDarkSquareStyle={{ backgroundColor: '#779556' }}
        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
        customSquareStyles={optionSquares} // The "Blurry Dots"
        arePiecesDraggable={false} // Disable Dragging
        animationDuration={300}
      />
    );
  })()}
</div>

        <div className="hidden lg:block absolute right-10 bottom-0 z-10">
           <Chicha />
        </div>
      </div>
    </div>
  );
};