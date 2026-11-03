import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  canPickColor: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState(new Chess());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId] = useState(() => localStorage.getItem('chetranj_pid') || uuidv4());
  const [color, setColor] = useState<'w' | 'b' | null>(null);
  const colorRef = useRef<'w' | 'b' | null>(null);
  const channelRef = useRef<any>(null);
  const [canPickColor, setCanPickColor] = useState(false);
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
      .on('broadcast', { event: 'request_color' }, ({ payload }) => {
        // another client asked what colour I am; reply only if I actually
        // know it and I'm not the requester.
        if (payload.playerId !== playerId && colorRef.current !== null) {
          channel.send({
            type: 'broadcast',
            event: 'color_picked',
            payload: { playerId, color: colorRef.current }
          });
        }
      })
      .on('broadcast', { event: 'color_picked' }, ({ payload }) => {
        if (payload.playerId !== playerId) {
           // Opponent picked a colour; we always take the opposite (even if
           // our own colour was previously set incorrectly).  This handles the
           // case where the joining client picked the same colour as the host
           // before the broadcast arrived.
           setColor(payload.color === 'w' ? 'b' : 'w');
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
  if (count > 1 && colorRef.current !== null) {
    channel.send({
      type: 'broadcast',
      event: 'color_picked',
      payload: { playerId, color: colorRef.current }
    });
  }
})
    });

    channelRef.current = channel;
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
        // A color may be selected before the channel finishes subscribing.
        if (colorRef.current !== null) {
          channel.send({
            type: 'broadcast',
            event: 'color_picked',
            payload: { playerId, color: colorRef.current }
          });
        } else {
          channel.send({
            type: 'broadcast',
            event: 'request_color',
            payload: { playerId }
          });
        }
      }
    });

    return () => {
      if (channelRef.current === channel) channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId]);

  const createRoom = async () => {
    const newRoomId = uuidv4().slice(0, 8);
    sessionStorage.setItem('chetranj_host_room', newRoomId);
    setCanPickColor(true);
    setRoomId(newRoomId);
    colorRef.current = null;
    setColor(null);
    setGame(new Chess());
    setOpponentConnected(false);
    setStatus('waiting');
    return newRoomId;
  };

  const joinRoom = async (id: string) => {
  if (id !== roomId) {
    setCanPickColor(sessionStorage.getItem('chetranj_host_room') === id);
    colorRef.current = null;
    setColor(null);
    setGame(new Chess());
    setOpponentConnected(false);
  }
  setRoomId(id);
  // In multiplayer mode we don't pre‑assign a color to the joining player.
  // The room owner will pick a colour and broadcast it; the newcomer will
  // receive the opposite via the realtime listeners.  For local (no
  // Supabase) we keep the old hotseat behaviour of giving the second player
  // black so the first player is always white.
  setStatus('waiting');
  if (!isSupabaseConfigured()) {
      if (!color) setColor('b'); // second player on the same device
      setStatus('playing');
      setOpponentConnected(true);
  }
};

  const pickColor = (c: 'w' | 'b') => {
    // In online rooms only the room creator chooses; the joiner receives the
    // opposite side from the creator's subscribed room channel.
    if (isSupabaseConfigured() && !canPickColor) return;
    if (color !== null) return;

    colorRef.current = c;
    setColor(c);
    if (isSupabaseConfigured() && roomId && channelRef.current) {
      channelRef.current.send({
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
        
        if (isSupabaseConfigured() && roomId && channelRef.current) {
            channelRef.current.send({
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
    opponentConnected,
    canPickColor
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
