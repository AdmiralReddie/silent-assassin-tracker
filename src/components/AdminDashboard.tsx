
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  players: Player[];
  aliveCount: number;
  pendingConfirmations: Player[];
  onResetGame: () => void;
  onLogout: () => void;
}

const AdminDashboard = ({ 
  players, 
  aliveCount, 
  pendingConfirmations,
  onResetGame, 
  onLogout 
}: AdminDashboardProps) => {
  const [showCodes, setShowCodes] = useState(false);
  const { toast } = useToast();

  const handleResetGame = () => {
    if (confirm('Bist du sicher, dass du das Spiel zurücksetzen möchtest?')) {
      onResetGame();
      toast({
        title: "Spiel zurückgesetzt",
        description: "Alle Spieler sind wieder lebendig",
      });
    }
  };

  const formatLastAction = (date?: Date) => {
    if (!date) return 'Nie';
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Ausloggen
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Lebende Spieler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{aliveCount}</div>
              <p className="text-slate-400 text-sm">von {players.length} Spielern</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Ausstehende Bestätigungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{pendingConfirmations.length}</div>
              <p className="text-slate-400 text-sm">Kill-Bestätigungen</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Spiel Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={aliveCount > 1 ? "bg-green-600" : "bg-red-600"}>
                {aliveCount > 1 ? "Aktiv" : "Beendet"}
              </Badge>
              <p className="text-slate-400 text-sm mt-2">
                {aliveCount === 1 ? "Gewinner gefunden!" : "Spiel läuft"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <Button 
            onClick={() => setShowCodes(!showCodes)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {showCodes ? 'Codes verstecken' : 'Codes anzeigen'}
          </Button>
          
          <Button 
            onClick={handleResetGame}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Spiel zurücksetzen
          </Button>
        </div>

        {/* Players Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Spieler Übersicht</CardTitle>
            <CardDescription className="text-slate-300">
              Alle Spieler und ihre aktuellen Status (Ziele sind bewusst nicht sichtbar)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  {showCodes && <TableHead className="text-slate-300">Code</TableHead>}
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
                    {showCodes && (
                      <TableCell className="text-slate-400 font-mono">
                        {player.code}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge 
                        className={player.isAlive ? "bg-green-600" : "bg-red-600"}
                      >
                        {player.isAlive ? "Lebendig" : "Tot"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatLastAction(player.lastAction)}
                    </TableCell>
                    <TableCell>
                      {player.pendingKillConfirmation && (
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

        {/* Pending Confirmations */}
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
