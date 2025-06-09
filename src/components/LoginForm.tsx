
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (code: string) => boolean | Promise<boolean>;
  isAdmin?: boolean;
}

const LoginForm = ({ onLogin, isAdmin = false }: LoginFormProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    
    try {
      const success = await onLogin(isAdmin ? code : code.toUpperCase());
      
      if (success) {
        toast({
          title: "Login erfolgreich",
          description: isAdmin ? "Willkommen im Admin-Bereich" : "Willkommen beim Mörder-Spiel!",
        });
      } else {
        toast({
          title: "Login fehlgeschlagen",
          description: isAdmin 
            ? "Ungültiger Admin-Code" 
            : "Ungültiger Code oder Spieler bereits eliminiert",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isAdmin ? 'Spielleitung Login' : 'Mörder Spiel'}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {isAdmin 
              ? 'Melde dich als Spielleitung an'
              : 'Melde dich mit deinem persönlichen Code an'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={isAdmin ? "Admin Code" : "Dein persönlicher Code"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || !code.trim()}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
          
          {isAdmin && (
            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-slate-300">Admin Code: <span className="font-mono">ADMIN</span></p>
            </div>
          )}
          
          {!isAdmin && (
            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2">Hinweis:</h3>
              <p className="text-xs text-slate-300">
                Du erhältst deinen persönlichen Code von der Spielleitung. 
                Die Spielleitung kann Codes in der Admin-Oberfläche erstellen und verwalten.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
