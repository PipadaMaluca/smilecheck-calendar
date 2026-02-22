import { useState } from 'react';
import { Copy, RefreshCw, ChevronDown, ChevronUp, Smartphone, Apple, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function CalendarSyncSection() {
  const [icsLink, setIcsLink] = useState('webcal://smilecheck.app/cal/usr_a1b2c3d4.ics');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(icsLink);
    toast.success('Link copiado!');
  };

  const handleRegenerate = () => {
    const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
    setIcsLink(`webcal://smilecheck.app/cal/${newId}.ics`);
    toast.success('Link regenerado! O link anterior foi invalidado.');
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sincronização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sincronize a sua agenda com o seu calendário externo.
        </p>

        {/* ICS Link */}
        <div className="bg-secondary/30 rounded-lg p-3 space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Link ICS</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 text-foreground truncate border border-border">
              {icsLink}
            </code>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="w-3.5 h-3.5" />
              Copiar Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2 text-destructive hover:text-destructive">
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerar Link
            </Button>
          </div>
        </div>

        {/* Instructions toggle */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center gap-2 text-sm text-primary hover:underline w-full"
        >
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Como adicionar ao seu calendário
        </button>

        {showInstructions && (
          <div className="space-y-4 text-sm text-foreground bg-secondary/20 rounded-lg p-4">
            {/* Google */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                Google Calendar
              </div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>Abra Google Calendar</li>
                <li>Clique em "+" ao lado de "Outros calendários"</li>
                <li>Selecione "A partir do URL"</li>
                <li>Cole o link acima</li>
              </ol>
            </div>

            {/* Apple */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Apple className="w-4 h-4 text-muted-foreground" />
                Apple Calendar
              </div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>Abra Calendário</li>
                <li>Ficheiro → Nova Subscrição de Calendário</li>
                <li>Cole o link acima</li>
              </ol>
            </div>

            {/* Outlook */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Outlook
              </div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>Abra Outlook</li>
                <li>Adicionar Calendário → Da Internet</li>
                <li>Cole o link acima</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
