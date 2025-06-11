
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();

  const notifyGameStarted = () => {
    toast({
      title: "🎯 Spiel gestartet!",
      description: "Das Mörder-Spiel hat begonnen. Viel Erfolg!",
      duration: 5000,
    });
  };

  const notifyKilled = (killMethod?: string, killDescription?: string) => {
    const methodText = killMethod && killDescription 
      ? ` mit ${killMethod} (${killDescription})`
      : killMethod 
        ? ` mit ${killMethod}`
        : '';
    
    toast({
      title: "💀 Du wurdest eliminiert!",
      description: `Du wurdest scheinbar eliminiert${methodText}.`,
      variant: "destructive",
      duration: 8000,
    });
  };

  const notifyKillConfirmed = (confirmed: boolean, targetName?: string) => {
    if (confirmed) {
      toast({
        title: "✅ Eliminierung bestätigt",
        description: targetName ? `${targetName} wurde eliminiert` : "Ziel wurde eliminiert",
        duration: 5000,
      });
    } else {
      toast({
        title: "❌ Eliminierung abgelehnt",
        description: "Die Eliminierung wurde vom Ziel abgelehnt",
        duration: 5000,
      });
    }
  };

  const notifyNewTarget = (targetName: string) => {
    toast({
      title: "🎯 Neues Ziel!",
      description: `Dein neues Ziel ist: ${targetName}`,
      duration: 6000,
    });
  };

  const notifyWin = () => {
    toast({
      title: "🏆 Du hast gewonnen!",
      description: "Herzlichen Glückwunsch! Du bist der letzte Überlebende!",
      duration: 10000,
    });
  };

  const notifyKillRequest = (killerName?: string, killMethod?: string, killDescription?: string) => {
    const methodText = killMethod && killDescription 
      ? ` mit ${killMethod} (${killDescription})`
      : killMethod 
        ? ` mit ${killMethod}`
        : '';
    
    toast({
      title: "⚠️ Eliminierung beantragt",
      description: `Ein Spieler behauptet, dich eliminiert zu haben${methodText}`,
      variant: "destructive",
      duration: 8000,
    });
  };

  return {
    notifyGameStarted,
    notifyKilled,
    notifyKillConfirmed,
    notifyNewTarget,
    notifyWin,
    notifyKillRequest,
  };
};
