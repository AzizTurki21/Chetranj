import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from './supabase';

interface GameContextType {
  game: Chess;
  roomId: string | null;
  playerId: string;
  color: 'w' | 'b' | null; // Player's color
  turn: 'w' | 'b';
  status: string; // 'waiting', 'playing', 'finished'
  winner: 'w' | 'b' | 'draw' | null;
  createRoom: () => Promise<string>;
  joinRoom: (id: string) => Promise<void>;
  pickColor: (c: 'w' | 'b') => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  opponentConnected: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId] = useState(() => localStorage.getItem('chetranj_pid') || uuidv4());
  const [color, setColor] = useState<'w' | 'b' | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [status, setStatus] = useState('waiting'); // waiting, playing
  
  useEffect(() => {
    localStorage.setItem('chetranj_pid', playerId);
  }, [playerId]);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!roomId || !isSupabaseConfigured()) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: playerId,
        },
      },
    });

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        const newGame = new Chess(payload.fen);
        setGame(newGame);
      })
      .on('broadcast', { event: 'color_picked' }, ({ payload }) => {
        if (payload.playerId !== playerId) {
           // Opponent picked color
           // If they picked white, I am black, etc.
           if (color === null) {
              setColor(payload.color === 'w' ? 'b' : 'w');
           }
        }
      })
      // 1. Updated Presence Listener
.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState();
  const presences = Object.keys(state);
  const count = presences.length;
  
  setOpponentConnected(count > 1);
  if (count > 1) setStatus('playing');

  // CRITICAL: If I am the host and I have a color, 
  // broadcast it so the newcomer knows what color THEY are.
  if (count > 1 && color !== null) {
    channel.send({
      type: 'broadcast',
      event: 'color_picked',
      payload: { playerId, color: color }
    });
  }
})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, color]);

  const createRoom = async () => {
    const newRoomId = uuidv4().slice(0, 8);
    setRoomId(newRoomId);
    setStatus('waiting');
    return newRoomId;
  };

  const joinRoom = async (id: string) => {
  setRoomId(id);
  // This logic is why your friend sees your POV. 
  // We must force the guest to 'b' if they don't have a color.
  if (!color) {
    setColor('b');
  }
  setStatus('waiting');
  if (!isSupabaseConfigured()) {
      setStatus('playing'); 
      setOpponentConnected(true);
  }
};

  const pickColor = (c: 'w' | 'b') => {
    setColor(c);
    if (isSupabaseConfigured() && roomId) {
        supabase.channel(`room:${roomId}`).send({
            type: 'broadcast',
            event: 'color_picked',
            payload: { playerId, color: c }
        });
    } else {
        // Local mode: if I pick white, the "opponent" is black. 
        // Actually for local hotseat, color doesn't matter as much, 
        // but let's just set it.
    }
  };

  const makeMove = useCallback((from: string, to: string, promotion: string = 'q') => {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move({ from, to, promotion });
      if (result) {
        setGame(gameCopy);
        
        if (isSupabaseConfigured() && roomId) {
            supabase.channel(`room:${roomId}`).send({
                type: 'broadcast',
                event: 'move',
                payload: { fen: gameCopy.fen() }
            });
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, roomId]);

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
  };

  const value = {
    game,
    roomId,
    playerId,
    color,
    turn: game.turn(),
    status,
    winner: (game.isGameOver() ? (game.isDraw() ? 'draw' : (game.turn() === 'w' ? 'b' : 'w')) : null) as 'w' | 'b' | 'draw' | null,
    createRoom,
    joinRoom,
    pickColor,
    makeMove,
    resetGame,
    opponentConnected
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
