
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface KillReportDialogProps {
  targetName: string;
  onReport: (killMethod: string, killDescription: string) => void;
  disabled?: boolean;
  pendingConfirmation?: boolean;
}

const KillReportDialog = ({ 
  targetName, 
  onReport, 
  disabled = false, 
  pendingConfirmation = false 
}: KillReportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [killMethod, setKillMethod] = useState('');
  const [killDescription, setKillDescription] = useState('');

  const handleSubmit = () => {
    if (killMethod.trim()) {
      onReport(killMethod.trim(), killDescription.trim());
      setIsOpen(false);
      setKillMethod('');
      setKillDescription('');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setKillMethod('');
    setKillDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          disabled={disabled || pendingConfirmation}
        >
          {pendingConfirmation 
            ? 'Warte auf Bestätigung...' 
            : 'Ich habe mein Ziel eliminiert'
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Eliminierung von {targetName}</DialogTitle>
          <DialogDescription className="text-slate-300">
            Beschreibe, wie du {targetName} eliminiert hast
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="kill-method" className="text-white">
              Werkzeug/Waffe *
            </Label>
            <Input
              id="kill-method"
              value={killMethod}
              onChange={(e) => setKillMethod(e.target.value)}
              placeholder="z.B. Wasserpistole, Nerf-Dart, Klopapier..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="kill-description" className="text-white">
              Beschreibung (optional)
            </Label>
            <Textarea
              id="kill-description"
              value={killDescription}
              onChange={(e) => setKillDescription(e.target.value)}
              placeholder="Wie ist die Eliminierung passiert?"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              maxLength={200}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              disabled={!killMethod.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Eliminierung melden
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KillReportDialog;
