
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, Game, GameState, KillRequest } from '@/types/game';

export const useSupabaseGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    players: []
  });
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [killRequests, setKillRequests] = useState<KillRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      // Get the current game
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (games && games.length > 0) {
        const game = games[0];
        
        // Get players for this game
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', game.id)
          .order('created_at');

        // Get kill requests
        const { data: requests } = await supabase
          .from('kill_requests')
          .select('*')
          .eq('game_id', game.id)
          .is('confirmed', null);

        // Convert database types to application types
        const players: Player[] = (playersData || []).map(p => ({
          ...p,
          pending_kill_confirmation: p.pending_kill_confirmation ? 
            p.pending_kill_confirmation as { killerId: string; timestamp: string } : null
        }));

        setGameState({
          game,
          players
        });
        setKillRequests(requests || []);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginPlayer = async (code: string): Promise<Player | null> => {
    try {
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_alive', true);

      if (players && players.length > 0) {
        const playerData = players[0];
        
        // Mark player as logged in
        await supabase
          .from('players')
          .update({ 
            has_logged_in: true,
            last_action: new Date().toISOString()
          })
          .eq('id', playerData.id);

        const updatedPlayer: Player = {
          ...playerData,
          has_logged_in: true,
          pending_kill_confirmation: playerData.pending_kill_confirmation ? 
            playerData.pending_kill_confirmation as { killerId: string; timestamp: string } : null
        };
        
        setCurrentPlayer(updatedPlayer);
        
        // Refresh game data
        await loadGameData();
        
        return updatedPlayer;
      }
      return null;
    } catch (error) {
      console.error('Error logging in player:', error);
      return null;
    }
  };

  const addPlayer = async (name: string): Promise<string | null> => {
    if (!gameState.game) return null;
    
    try {
      // Generate unique code
      const code = name.toUpperCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
      
      const { data } = await supabase
        .from('players')
        .insert({
          game_id: gameState.game.id,
          name,
          code,
          is_alive: true,
          has_logged_in: false
        })
        .select()
        .single();

      if (data) {
        await loadGameData();
        return data.code;
      }
      return null;
    } catch (error) {
      console.error('Error adding player:', error);
      return null;
    }
  };

  const updatePlayerName = async (playerId: string, newName: string): Promise<boolean> => {
    try {
      await supabase
        .from('players')
        .update({ name: newName })
        .eq('id', playerId);

      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error updating player name:', error);
      return false;
    }
  };

  const deletePlayer = async (playerId: string): Promise<boolean> => {
    try {
      await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error deleting player:', error);
      return false;
    }
  };

  const startGame = async (): Promise<boolean> => {
    if (!gameState.game) return false;
    
    try {
      // Check if all players have logged in
      const loggedInPlayers = gameState.players.filter(p => p.has_logged_in);
      if (loggedInPlayers.length < 2) {
        throw new Error('At least 2 players must log in before starting the game');
      }

      // Assign targets using the database function
      await supabase.rpc('assign_targets', { game_uuid: gameState.game.id });

      // Update game status to active
      await supabase
        .from('games')
        .update({ status: 'active' })
        .eq('id', gameState.game.id);

      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      return false;
    }
  };

  const requestKill = async (killerId: string, targetId: string): Promise<boolean> => {
    if (!gameState.game) return false;
    
    try {
      // Create kill request
      await supabase
        .from('kill_requests')
        .insert({
          game_id: gameState.game.id,
          killer_id: killerId,
          target_id: targetId
        });

      // Update target with pending confirmation
      await supabase
        .from('players')
        .update({
          pending_kill_confirmation: {
            killerId,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', targetId);

      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error requesting kill:', error);
      return false;
    }
  };

  const confirmKill = async (targetId: string, confirmed: boolean): Promise<boolean> => {
    if (!gameState.game) return false;
    
    try {
      const killRequest = killRequests.find(req => req.target_id === targetId);
      if (!killRequest) return false;

      // Update kill request
      await supabase
        .from('kill_requests')
        .update({ confirmed })
        .eq('id', killRequest.id);

      if (confirmed) {
        const target = gameState.players.find(p => p.id === targetId);
        const killer = gameState.players.find(p => p.id === killRequest.killer_id);
        
        if (target && killer) {
          // Mark target as dead
          await supabase
            .from('players')
            .update({
              is_alive: false,
              pending_kill_confirmation: null,
              last_action: new Date().toISOString()
            })
            .eq('id', targetId);

          // Update killer's target to target's target
          await supabase
            .from('players')
            .update({
              target_id: target.target_id,
              last_action: new Date().toISOString()
            })
            .eq('id', killRequest.killer_id);

          // Update current player if they were involved
          if (currentPlayer?.id === killRequest.killer_id) {
            setCurrentPlayer(prev => prev ? {
              ...prev,
              target_id: target.target_id,
              last_action: new Date().toISOString()
            } : null);
          }
        }
      } else {
        // Remove pending confirmation
        await supabase
          .from('players')
          .update({ pending_kill_confirmation: null })
          .eq('id', targetId);
      }

      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error confirming kill:', error);
      return false;
    }
  };

  const resetGame = async (): Promise<boolean> => {
    try {
      // Delete all kill requests
      if (gameState.game) {
        await supabase
          .from('kill_requests')
          .delete()
          .eq('game_id', gameState.game.id);

        // Reset all players
        await supabase
          .from('players')
          .update({
            is_alive: true,
            target_id: null,
            has_logged_in: false,
            pending_kill_confirmation: null,
            last_action: null
          })
          .eq('game_id', gameState.game.id);

        // Reset game status
        await supabase
          .from('games')
          .update({ status: 'setup' })
          .eq('id', gameState.game.id);
      }

      setCurrentPlayer(null);
      await loadGameData();
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  };

  const getCurrentTarget = (playerId: string): Player | null => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player?.target_id) return null;
    
    return gameState.players.find(p => p.id === player.target_id) || null;
  };

  const getAlivePlayersCount = () => {
    return gameState.players.filter(p => p.is_alive).length;
  };

  const getPendingConfirmations = () => {
    return gameState.players.filter(p => p.pending_kill_confirmation);
  };

  const getAllLoggedInPlayers = () => {
    return gameState.players.filter(p => p.has_logged_in);
  };

  return {
    gameState,
    currentPlayer,
    killRequests,
    loading,
    loginPlayer,
    addPlayer,
    updatePlayerName,
    deletePlayer,
    startGame,
    requestKill,
    confirmKill,
    resetGame,
    getCurrentTarget,
    getAlivePlayersCount,
    getPendingConfirmations,
    getAllLoggedInPlayers,
    setCurrentPlayer,
    refreshData: loadGameData
  };
};
