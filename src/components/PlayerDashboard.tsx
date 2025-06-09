
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface PlayerDashboardProps {
  player: Player;
  target: Player | null;
  onRequestKill: (targetId: string) => void;
  onConfirmKill: (confirmed: boolean) => void;
  onLogout: () => void;
}

const PlayerDashboard = ({ 
  player, 
  target, 
  onRequestKill, 
  onConfirmKill, 
  onLogout 
}: PlayerDashboardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { toast } = useToast();

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

  const handleKillRequest = () => {
    if (!target) return;
    
    onRequestKill(target.id);
    toast({
      title: "Eliminierung beantragt",
      description: `${target.name} muss die Eliminierung bestätigen`,
    });
  };

  const handleConfirmKill = (confirmed: boolean) => {
    onConfirmKill(confirmed);
    toast({
      title: confirmed ? "Eliminierung bestätigt" : "Eliminierung abgelehnt",
      description: confirmed 
        ? "Du wurdest aus dem Spiel eliminiert" 
        : "Du bleibst im Spiel",
      variant: confirmed ? "destructive" : "default",
    });
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
              onClick={onLogout}
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
          <Button 
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Ausloggen
          </Button>
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
            <Badge className="bg-green-600 text-white">
              Lebendig
            </Badge>
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
              
              <Button 
                onClick={handleKillRequest}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={!!target.pending_kill_confirmation}
              >
                {target.pending_kill_confirmation 
                  ? 'Warte auf Bestätigung...' 
                  : 'Ich habe mein Ziel eliminiert'
                }
              </Button>
              
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
