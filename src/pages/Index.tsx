
import { useState, useEffect } from 'react';
import { useSupabaseGameState } from '@/hooks/useSupabaseGameState';
import LoginForm from '@/components/LoginForm';
import PlayerDashboard from '@/components/PlayerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import AdminDashboardHeader from '@/components/AdminDashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'player-login' | 'admin-login' | 'player-game' | 'admin-game'>('welcome');
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  const {
    gameState,
    currentPlayer,
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
    refreshData
  } = useSupabaseGameState();

  // Check for persisted login on component mount
  useEffect(() => {
    const checkPersistedLogin = async () => {
      const adminLoggedIn = localStorage.getItem('admin-logged-in');
      const playerCode = localStorage.getItem('player-code');

      if (adminLoggedIn === 'true') {
        setIsAdmin(true);
        setCurrentView('admin-game');
      } else if (playerCode) {
        // Try to auto-login the player
        const player = await loginPlayer(playerCode);
        if (player) {
          setCurrentView('player-game');
        } else {
          // Invalid stored code, remove it
          localStorage.removeItem('player-code');
        }
      }
    };

    if (!loading) {
      checkPersistedLogin();
    }
  }, [loading, loginPlayer]);

  const handlePlayerLogin = async (code: string): Promise<boolean> => {
    const player = await loginPlayer(code);
    if (player) {
      setCurrentView('player-game');
      return true;
    }
    return false;
  };

  const handleAdminLogin = (code: string): boolean => {
    if (code === 'ADMIN') {
      setIsAdmin(true);
      setCurrentView('admin-game');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentPlayer(null);
    setIsAdmin(false);
    setCurrentView('welcome');
    localStorage.removeItem('admin-logged-in');
    localStorage.removeItem('player-code');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast({
        title: "Aktualisiert",
        description: "Spieldaten wurden neu geladen",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Aktualisierung fehlgeschlagen",
        variant: "destructive",
      });
    }
    setRefreshing(false);
  };

  const handleRequestKill = (targetId: string) => {
    if (currentPlayer) {
      requestKill(currentPlayer.id, targetId);
    }
  };

  const handleConfirmKill = (confirmed: boolean) => {
    if (currentPlayer) {
      confirmKill(currentPlayer.id, confirmed);
    }
  };

  const handleStartGame = async (): Promise<boolean> => {
    return await startGame();
  };

  const handleResetGame = async (): Promise<boolean> => {
    const success = await resetGame();
    if (success) {
      // If we're currently a player, log them out since the game was reset
      if (currentPlayer) {
        handleLogout();
      }
    }
    return success;
  };

  // Show loading while initial data is being fetched
  if (loading && currentView === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="text-white text-xl">Lade Spieldaten...</div>
      </div>
    );
  }

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
        <Card className="w-full max-w-lg bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              🎯 Mörder Spiel
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Das ultimative Assassin-Spiel für Gruppen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <p className="text-slate-300">
                Jeder Spieler hat ein Ziel. Eliminiere dein Ziel und übernimm dessen Mission.
              </p>
              <p className="text-sm text-slate-400">
                Letzter Überlebender gewinnt!
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setCurrentView('player-login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3"
              >
                Als Spieler anmelden
              </Button>
              
              <Button 
                onClick={() => setCurrentView('admin-login')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 text-lg py-3"
              >
                Als Spielleitung anmelden
              </Button>
            </div>

            <div className="mt-8 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Spielregeln:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Du siehst nur deinen Namen und dein aktuelles Ziel</li>
                <li>• Eliminiere dein Ziel und übernimm dessen Mission</li>
                <li>• Eliminierungen müssen vom Ziel bestätigt werden</li>
                <li>• Du weißt nie, wer dich jagt</li>
              </ul>
            </div>

            {/* Show current game status */}
            {gameState.game && (
              <div className="mt-4 p-3 bg-slate-700 rounded-lg text-center">
                <p className="text-sm text-slate-300">
                  Aktuelles Spiel: {gameState.players.length} Spieler, 
                  Status: <span className="capitalize">{gameState.game.status}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Screens
  if (currentView === 'player-login') {
    return (
      <div>
        <LoginForm onLogin={handlePlayerLogin} />
        <div className="fixed top-4 left-4">
          <Button 
            onClick={() => setCurrentView('welcome')}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            ← Zurück
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div>
        <LoginForm onLogin={handleAdminLogin} isAdmin />
        <div className="fixed top-4 left-4">
          <Button 
            onClick={() => setCurrentView('welcome')}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            ← Zurück
          </Button>
        </div>
      </div>
    );
  }

  // Game Screens
  if (currentView === 'player-game' && currentPlayer) {
    const target = getCurrentTarget(currentPlayer.id);
    return (
      <PlayerDashboard
        player={currentPlayer}
        target={target}
        onRequestKill={handleRequestKill}
        onConfirmKill={handleConfirmKill}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
      />
    );
  }

  if (currentView === 'admin-game' && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <AdminDashboardHeader 
            onRefresh={handleRefresh}
            onLogout={handleLogout}
            refreshing={refreshing}
          />
          <AdminDashboard
            game={gameState.game}
            players={gameState.players}
            aliveCount={getAlivePlayersCount()}
            pendingConfirmations={getPendingConfirmations()}
            loggedInPlayers={getAllLoggedInPlayers()}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayerName}
            onDeletePlayer={deletePlayer}
            onStartGame={handleStartGame}
            onResetGame={handleResetGame}
            onLogout={() => {}} // Empty since handled by header
          />
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
