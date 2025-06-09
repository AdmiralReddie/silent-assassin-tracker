
import { useState, useEffect } from 'react';
import { Player, GameState, KillRequest } from '@/types/game';

// Mock data für Demo-Zwecke
const initialPlayers: Player[] = [
  { 
    id: '1', 
    name: 'Alice Weber', 
    code: 'ALICE123', 
    isAlive: true, 
    targetId: '2',
    lastAction: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  { 
    id: '2', 
    name: 'Bob Schmidt', 
    code: 'BOB456', 
    isAlive: true, 
    targetId: '3',
    lastAction: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  { 
    id: '3', 
    name: 'Clara Müller', 
    code: 'CLARA789', 
    isAlive: true, 
    targetId: '4',
    lastAction: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  { 
    id: '4', 
    name: 'David Koch', 
    code: 'DAVID321', 
    isAlive: true, 
    targetId: '1',
    lastAction: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: initialPlayers,
    isGameActive: true
  });
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [killRequests, setKillRequests] = useState<KillRequest[]>([]);

  const loginPlayer = (code: string): Player | null => {
    const player = gameState.players.find(p => p.code === code && p.isAlive);
    if (player) {
      setCurrentPlayer(player);
      return player;
    }
    return null;
  };

  const requestKill = (killerId: string, targetId: string) => {
    const newRequest: KillRequest = {
      killerId,
      targetId,
      timestamp: new Date()
    };
    
    setKillRequests(prev => [...prev, newRequest]);
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => 
        player.id === targetId 
          ? { 
              ...player, 
              pendingKillConfirmation: { 
                killerId, 
                timestamp: new Date() 
              } 
            }
          : player
      )
    }));
  };

  const confirmKill = (targetId: string, confirmed: boolean) => {
    if (!confirmed) {
      // Kill abgelehnt - Bestätigung entfernen
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(player => 
          player.id === targetId 
            ? { ...player, pendingKillConfirmation: undefined }
            : player
        )
      }));
      setKillRequests(prev => prev.filter(req => req.targetId !== targetId));
      return;
    }

    // Kill bestätigt
    const killRequest = killRequests.find(req => req.targetId === targetId);
    if (!killRequest) return;

    const target = gameState.players.find(p => p.id === targetId);
    const killer = gameState.players.find(p => p.id === killRequest.killerId);
    
    if (!target || !killer) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(player => {
        if (player.id === targetId) {
          // Ziel wird eliminiert
          return { 
            ...player, 
            isAlive: false, 
            pendingKillConfirmation: undefined,
            lastAction: new Date()
          };
        } else if (player.id === killRequest.killerId) {
          // Killer übernimmt das Ziel seines Opfers
          return { 
            ...player, 
            targetId: target.targetId,
            lastAction: new Date()
          };
        }
        return player;
      })
    }));

    // Kill Request entfernen
    setKillRequests(prev => prev.filter(req => req.targetId !== targetId));
    
    // Current player aktualisieren falls betroffen
    if (currentPlayer?.id === killRequest.killerId) {
      setCurrentPlayer(prev => prev ? { 
        ...prev, 
        targetId: target.targetId,
        lastAction: new Date()
      } : null);
    }
  };

  const resetGame = () => {
    setGameState({
      players: initialPlayers.map(p => ({ 
        ...p, 
        isAlive: true,
        pendingKillConfirmation: undefined,
        lastAction: new Date()
      })),
      isGameActive: true
    });
    setKillRequests([]);
    setCurrentPlayer(null);
  };

  const getCurrentTarget = (playerId: string): Player | null => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player?.targetId) return null;
    
    return gameState.players.find(p => p.id === player.targetId) || null;
  };

  const getAlivePlayersCount = () => {
    return gameState.players.filter(p => p.isAlive).length;
  };

  const getPendingConfirmations = () => {
    return gameState.players.filter(p => p.pendingKillConfirmation);
  };

  return {
    gameState,
    currentPlayer,
    killRequests,
    loginPlayer,
    requestKill,
    confirmKill,
    resetGame,
    getCurrentTarget,
    getAlivePlayersCount,
    getPendingConfirmations,
    setCurrentPlayer
  };
};
