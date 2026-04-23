import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../lib/gameContext';
import { Chessboard as ChessboardComponent } from 'react-chessboard';

const Chessboard = ChessboardComponent as any;

export const GameRoom: React.FC = () => {
  const { roomId } = useParams();
  const { game, color, turn, makeMove, status, winner, opponentConnected, joinRoom } = useGame();
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    if (color === null && roomId && opponentConnected) {
      navigate(`/room/${roomId}/color`);
    }
  }, [color, roomId, navigate, opponentConnected]);

  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });
    
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, any> = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: "radial-gradient(circle, rgba(0,0,0,.2) 20%, transparent 20%)",
        borderRadius: "50%",
      };
    });
    
    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    if (!opponentConnected) {
      if (status === 'finished' || game.isGameOver()) return;
    } else {
      if (!color) return;
      if (turn !== color) return;
      if (status === 'finished' || game.isGameOver()) return;
    }

    if (!moveFrom) {
      const hasOptions = getMoveOptions(square);
      if (hasOptions) setMoveFrom(square);
      return;
    }

    const moveSuccess = makeMove(moveFrom, square);

    if (moveSuccess) {
      setMoveFrom(null);
      setOptionSquares({});
    } else {
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
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono bg-stone-800 px-3 py-1 rounded">
            ROOM: {roomId}
          </span>
          <button
            onClick={copyLink}
            className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1 rounded transition"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className={`text-sm ${opponentConnected ? 'text-green-400' : 'text-yellow-400'}`}>
          {opponentConnected ? 'Opponent Online' : 'Waiting for opponent...'}
        </div>
      </div>

      <div className="mb-4 text-center">
        {isGameOver ? (
          <div>
            <h2 className="text-2xl font-bold text-red-400">GAME OVER</h2>
            <p className="text-lg">
              {winner === 'draw' ? 'Draw' : `${winner === 'w' ? 'White' : 'Black'} Wins!`}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold">
              {turn === 'w' ? 'White' : 'Black'}'s Turn
            </h2>
            {game.inCheck() && (
              <p className="text-red-400 font-bold animate-pulse">CHECK!</p>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-[500px] aspect-square">
        <Chessboard
          id="chetranj-board"
          position={game.fen()}
          onSquareClick={onSquareClick}
          boardOrientation={color === 'b' ? 'black' : 'white'}
          customDarkSquareStyle={{ backgroundColor: '#779556' }}
          customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
          customSquareStyles={optionSquares}
          arePiecesDraggable={false}
          animationDuration={300}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-stone-400">
          You are playing: <span className="font-bold text-white">{color === 'w' ? 'White' : color === 'b' ? 'Black' : 'Not selected'}</span>
        </p>
      </div>
    </div>
  );
};