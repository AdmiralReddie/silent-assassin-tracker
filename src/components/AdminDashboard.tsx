
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player, Game } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import PlayerManagement from './PlayerManagement';

interface AdminDashboardProps {
  game: Game | null;
  players: Player[];
  aliveCount: number;
  pendingConfirmations: Player[];
  loggedInPlayers: Player[];
  onAddPlayer: (name: string) => Promise<string | null>;
  onUpdatePlayer: (playerId: string, newName: string) => Promise<boolean>;
  onDeletePlayer: (playerId: string) => Promise<boolean>;
  onStartGame: () => Promise<boolean>;
  onResetGame: () => Promise<boolean>;
  onLogout: () => void;
}

const AdminDashboard = ({ 
  game,
  players, 
  aliveCount, 
  pendingConfirmations,
  loggedInPlayers,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onStartGame,
  onResetGame, 
  onLogout 
}: AdminDashboardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStartGame = async () => {
    if (loggedInPlayers.length < 2) {
      toast({
        title: "Nicht genug Spieler",
        description: "Mindestens 2 Spieler müssen eingeloggt sein",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await onStartGame();
    
    if (success) {
      toast({
        title: "Spiel gestartet",
        description: "Alle Ziele wurden zugewiesen",
      });
    } else {
      toast({
        title: "Fehler",
        description: "Spiel konnte nicht gestartet werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleResetGame = async () => {
    if (!confirm('Bist du sicher, dass du das Spiel zurücksetzen möchtest?')) return;
    
    setLoading(true);
    const success = await onResetGame();
    
    if (success) {
      toast({
        title: "Spiel zurückgesetzt",
        description: "Alle Spieler sind wieder lebendig und müssen sich neu einloggen",
      });
    } else {
      toast({
        title: "Fehler",
        description: "Spiel konnte nicht zurückgesetzt werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const formatLastAction = (dateString?: string) => {
    if (!dateString) return 'Nie';
    
    const date = new Date(dateString);
    const timeDiff = Date.now() - date.getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `vor ${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `vor ${minutes}m`;
    } else {
      return 'Gerade eben';
    }
  };

  const gameStatus = game?.status || 'setup';
  const canStartGame = gameStatus === 'setup' && loggedInPlayers.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Spielleitung Dashboard</h1>
            <p className="text-slate-300">
              Spiel Status: <Badge className={
                gameStatus === 'setup' ? 'bg-orange-600' :
                gameStatus === 'active' ? 'bg-green-600' : 'bg-red-600'
              }>
                {gameStatus === 'setup' ? 'Vorbereitung' :
                 gameStatus === 'active' ? 'Aktiv' : 'Beendet'}
              </Badge>
            </p>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Ausloggen
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Gesamt Spieler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{players.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Eingeloggt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{loggedInPlayers.length}</div>
              <p className="text-slate-400 text-xs">von {players.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Lebende Spieler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{aliveCount}</div>
              <p className="text-slate-400 text-xs">von {players.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Bestätigungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{pendingConfirmations.length}</div>
              <p className="text-slate-400 text-xs">ausstehend</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="flex gap-4">
          {gameStatus === 'setup' && (
            <Button 
              onClick={handleStartGame}
              disabled={!canStartGame || loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Wird gestartet...' : 'Spiel starten'}
            </Button>
          )}
          
          <Button 
            onClick={handleResetGame}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Wird zurückgesetzt...' : 'Spiel zurücksetzen'}
          </Button>
        </div>

        {/* Start Game Info */}
        {gameStatus === 'setup' && !canStartGame && (
          <Card className="bg-orange-900 border-orange-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-200">
                <span>⚠️</span>
                <span>
                  {players.length < 2 
                    ? `Mindestens 2 Spieler benötigt (${players.length} vorhanden)`
                    : `${loggedInPlayers.length} von ${players.length} Spielern eingeloggt - Warte auf mehr Spieler`
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Management */}
        <PlayerManagement
          players={players}
          onAddPlayer={onAddPlayer}
          onUpdatePlayer={onUpdatePlayer}
          onDeletePlayer={onDeletePlayer}
          gameStatus={gameStatus}
        />

        {/* Game Overview */}
        {gameStatus !== 'setup' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Spiel Übersicht</CardTitle>
              <CardDescription className="text-slate-300">
                Aktuelle Spielsituation (Ziele sind bewusst nicht sichtbar)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Letzte Aktion</TableHead>
                    <TableHead className="text-slate-300">Ausstehend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {player.name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={player.is_alive ? "bg-green-600" : "bg-red-600"}
                        >
                          {player.is_alive ? "Lebendig" : "Tot"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {formatLastAction(player.last_action)}
                      </TableCell>
                      <TableCell>
                        {player.pending_kill_confirmation && (
                          <Badge variant="outline" className="border-orange-400 text-orange-400">
                            Kill-Bestätigung
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pending Confirmations Details */}
        {pendingConfirmations.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ausstehende Kill-Bestätigungen</CardTitle>
              <CardDescription className="text-slate-300">
                Diese Spieler müssen eine Eliminierung bestätigen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingConfirmations.map((player) => (
                  <div 
                    key={player.id} 
                    className="flex justify-between items-center p-3 bg-slate-700 rounded-lg"
                  >
                    <span className="text-white">{player.name}</span>
                    <Badge variant="outline" className="border-orange-400 text-orange-400">
                      Wartet auf Bestätigung
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
