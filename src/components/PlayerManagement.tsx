
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Copy } from 'lucide-react';

interface PlayerManagementProps {
  players: Player[];
  onAddPlayer: (name: string) => Promise<string | null>;
  onUpdatePlayer: (playerId: string, newName: string) => Promise<boolean>;
  onDeletePlayer: (playerId: string) => Promise<boolean>;
  gameStatus: string;
}

const PlayerManagement = ({ 
  players, 
  onAddPlayer, 
  onUpdatePlayer, 
  onDeletePlayer,
  gameStatus 
}: PlayerManagementProps) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    setLoading(true);
    const code = await onAddPlayer(newPlayerName.trim());
    
    if (code) {
      toast({
        title: "Spieler hinzugefügt",
        description: `${newPlayerName} wurde mit Code ${code} erstellt`,
      });
      setNewPlayerName('');
    } else {
      toast({
        title: "Fehler",
        description: "Spieler konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdatePlayer = async (playerId: string) => {
    if (!editName.trim()) return;
    
    setLoading(true);
    const success = await onUpdatePlayer(playerId, editName.trim());
    
    if (success) {
      toast({
        title: "Spieler aktualisiert",
        description: "Name wurde erfolgreich geändert",
      });
      setEditingPlayer(null);
      setEditName('');
    } else {
      toast({
        title: "Fehler",
        description: "Name konnte nicht geändert werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Bist du sicher, dass du ${playerName} löschen möchtest?`)) return;
    
    setLoading(true);
    const success = await onDeletePlayer(playerId);
    
    if (success) {
      toast({
        title: "Spieler gelöscht",
        description: `${playerName} wurde entfernt`,
      });
    } else {
      toast({
        title: "Fehler",
        description: "Spieler konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: "Code wurde in die Zwischenablage kopiert",
    });
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player.id);
    setEditName(player.name);
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
    setEditName('');
  };

  const canEdit = gameStatus === 'setup';

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Spieler Verwaltung</CardTitle>
        <CardDescription className="text-slate-300">
          {canEdit ? 'Füge Spieler hinzu und bearbeite ihre Namen' : 'Spiel läuft - Spieler können nicht bearbeitet werden'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Player Form */}
        {canEdit && (
          <div className="flex gap-2">
            <Input
              placeholder="Spieler Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <Button 
              onClick={handleAddPlayer}
              disabled={loading || !newPlayerName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        )}

        {/* Players Table */}
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Name</TableHead>
              <TableHead className="text-slate-300">Code</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Eingeloggt</TableHead>
              {canEdit && <TableHead className="text-slate-300">Aktionen</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id} className="border-slate-700">
                <TableCell>
                  {editingPlayer === player.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleUpdatePlayer(player.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleUpdatePlayer(player.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✓
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="border-slate-600 text-slate-300"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <span className="text-white font-medium">{player.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{player.code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(player.code)}
                      className="p-1 h-6 w-6 text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={player.is_alive ? "bg-green-600" : "bg-red-600"}>
                    {player.is_alive ? "Lebendig" : "Tot"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={player.has_logged_in ? "default" : "outline"}
                    className={player.has_logged_in 
                      ? "bg-blue-600" 
                      : "border-slate-600 text-slate-400"
                    }
                  >
                    {player.has_logged_in ? "Ja" : "Nein"}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(player)}
                        disabled={loading || editingPlayer === player.id}
                        className="p-1 h-6 w-6 text-slate-400 hover:text-white"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePlayer(player.id, player.name)}
                        disabled={loading}
                        className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {players.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            Noch keine Spieler hinzugefügt
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;
