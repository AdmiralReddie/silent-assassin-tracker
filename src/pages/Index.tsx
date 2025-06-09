
import { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import LoginForm from '@/components/LoginForm';
import PlayerDashboard from '@/components/PlayerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'player-login' | 'admin-login' | 'player-game' | 'admin-game'>('welcome');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const {
    gameState,
    currentPlayer,
    loginPlayer,
    requestKill,
    confirmKill,
    resetGame,
    getCurrentTarget,
    getAlivePlayersCount,
    getPendingConfirmations,
    setCurrentPlayer
  } = useGameState();

  const handlePlayerLogin = (code: string): boolean => {
    const player = loginPlayer(code);
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
      />
    );
  }

  if (currentView === 'admin-game' && isAdmin) {
    return (
      <AdminDashboard
        players={gameState.players}
        aliveCount={getAlivePlayersCount()}
        pendingConfirmations={getPendingConfirmations()}
        onResetGame={resetGame}
        onLogout={handleLogout}
      />
    );
  }

  return null;
};

export default Index;
