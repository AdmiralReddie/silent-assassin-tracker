
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Player } from '@/types/game';
import { useNotifications } from '@/hooks/useNotifications';
import KillReportDialog from '@/components/KillReportDialog';

interface PlayerDashboardProps {
  player: Player;
  target: Player | null;
  onRequestKill: (targetId: string, killMethod: string, killDescription: string) => void;
  onConfirmKill: (confirmed: boolean) => void;
  onLogout: () => void;
  onRefresh?: () => void;
  gameStatus?: 'setup' | 'active' | 'finished';
  alivePlayersCount?: number;
}

const PlayerDashboard = ({ 
  player, 
  target, 
  onRequestKill, 
  onConfirmKill, 
  onLogout,
  onRefresh,
  gameStatus,
  alivePlayersCount = 0
}: PlayerDashboardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [previousGameStatus, setPreviousGameStatus] = useState<string | null>(null);
  const [previousTargetId, setPreviousTargetId] = useState<string | null>(null);
  const [previousAliveCount, setPreviousAliveCount] = useState<number>(0);
  const notifications = useNotifications();

  // Notification effects
  useEffect(() => {
    // Game started notification
    if (previousGameStatus === 'setup' && gameStatus === 'active') {
      notifications.notifyGameStarted();
    }
    setPreviousGameStatus(gameStatus || null);
  }, [gameStatus, previousGameStatus, notifications]);

  useEffect(() => {
    // New target notification
    if (target && previousTargetId && previousTargetId !== target.id && gameStatus === 'active') {
      notifications.notifyNewTarget(target.name);
    }
    setPreviousTargetId(target?.id || null);
  }, [target, previousTargetId, gameStatus, notifications]);

  useEffect(() => {
    // Win notification (when alive count reaches 1 and player is alive)
    if (alivePlayersCount === 1 && player.is_alive && previousAliveCount > 1) {
      notifications.notifyWin();
    }
    setPreviousAliveCount(alivePlayersCount);
  }, [alivePlayersCount, player.is_alive, previousAliveCount, notifications]);

  useEffect(() => {
    // Kill request notification
    if (player.pending_kill_confirmation) {
      const { killMethod, killDescription } = player.pending_kill_confirmation;
      notifications.notifyKillRequest(undefined, killMethod, killDescription);
    }
  }, [player.pending_kill_confirmation, notifications]);

  useEffect(() => {
    const updateTime = () => {
      if (player.last_action) {
        const timeDiff = Date.now() - new Date(player.last_action).getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
          setTimeLeft(`vor ${hours}h ${minutes % 60}m`);
        } else {
          setTimeLeft(`vor ${minutes}m`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [player.last_action]);

  const handleKillRequest = (killMethod: string, killDescription: string) => {
    if (!target) return;
    
    onRequestKill(target.id, killMethod, killDescription);
  };

  const handleConfirmKill = (confirmed: boolean) => {
    onConfirmKill(confirmed);
    
    if (confirmed) {
      const { killMethod, killDescription } = player.pending_kill_confirmation || {};
      notifications.notifyKilled(killMethod, killDescription);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('player-code');
    onLogout();
  };

  if (!player.is_alive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-400">
              Du wurdest eliminiert!
            </CardTitle>
            <CardDescription className="text-slate-300">
              Danke fürs Mitspielen, {player.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Ausloggen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show win screen
  if (alivePlayersCount === 1 && player.is_alive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-400">
              🏆 Du hast gewonnen!
            </CardTitle>
            <CardDescription className="text-slate-300">
              Herzlichen Glückwunsch, {player.name}! Du bist der letzte Überlebende!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Ausloggen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Mörder Spiel</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Ausloggen
            </Button>
          </div>
        </div>

        {/* Player Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{player.name}</CardTitle>
            <CardDescription className="text-slate-300">
              Letzte Aktivität: {timeLeft || 'Gerade eben'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge className="bg-green-600 text-white">
                Lebendig
              </Badge>
              {alivePlayersCount > 0 && (
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {alivePlayersCount} Überlebende
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kill Confirmation Request */}
        {player.pending_kill_confirmation && (
          <Card className="bg-red-900 border-red-700 animate-pulse">
            <CardHeader>
              <CardTitle className="text-white">Eliminierung bestätigen</CardTitle>
              <CardDescription className="text-red-200">
                Wurdest du eliminiert?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {player.pending_kill_confirmation.killMethod && (
                <div className="bg-red-800 p-3 rounded">
                  <p className="text-white text-sm font-semibold">
                    Werkzeug: {player.pending_kill_confirmation.killMethod}
                  </p>
                  {player.pending_kill_confirmation.killDescription && (
                    <p className="text-red-200 text-sm mt-1">
                      {player.pending_kill_confirmation.killDescription}
                    </p>
                  )}
                </div>
              )}
              <p className="text-white text-sm">
                Ein anderer Spieler behauptet, dich eliminiert zu haben. 
                Bestätige nur, wenn dies wirklich der Fall ist.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleConfirmKill(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Ja, ich wurde eliminiert
                </Button>
                <Button 
                  onClick={() => handleConfirmKill(false)}
                  variant="outline"
                  className="flex-1 border-red-400 text-red-400 hover:bg-red-800"
                >
                  Nein
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Target Info */}
        {target ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Dein Ziel</CardTitle>
              <CardDescription className="text-slate-300">
                Eliminiere diese Person
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-red-400">{target.name}</h3>
              </div>
              
              <KillReportDialog
                targetName={target.name}
                onReport={handleKillRequest}
                disabled={!!target.pending_kill_confirmation}
                pendingConfirmation={!!target.pending_kill_confirmation}
              />
              
              {target.pending_kill_confirmation && (
                <p className="text-xs text-slate-400 text-center">
                  {target.name} muss die Eliminierung bestätigen
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-300">Kein Ziel verfügbar</p>
              <p className="text-sm text-slate-400 mt-2">
                Das Spiel ist noch nicht gestartet oder beendet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;
