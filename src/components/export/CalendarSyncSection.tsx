import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, ChevronDown, ChevronUp, Smartphone, Apple, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function CalendarSyncSection() {
  const { t } = useTranslation();
  const [icsLink, setIcsLink] = useState('webcal://smilecheck.app/cal/usr_a1b2c3d4.ics');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(icsLink);
    toast.success(t('export.linkCopied'));
  };

  const handleRegenerate = () => {
    const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
    setIcsLink(`webcal://smilecheck.app/cal/${newId}.ics`);
    toast.success(t('export.linkRegenerated'));
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('export.syncTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('export.syncDescription')}</p>

        <div className="bg-secondary/30 rounded-lg p-3 space-y-3">
          <label className="text-xs font-medium text-muted-foreground">{t('export.icsLink')}</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 text-foreground truncate border border-border">{icsLink}</code>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="w-3.5 h-3.5" /> {t('export.copyLink')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2 text-destructive hover:text-destructive">
              <RefreshCw className="w-3.5 h-3.5" /> {t('export.regenerateLink')}
            </Button>
          </div>
        </div>

        <button onClick={() => setShowInstructions(!showInstructions)} className="flex items-center gap-2 text-sm text-primary hover:underline w-full">
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {t('export.howToAdd')}
        </button>

        {showInstructions && (
          <div className="space-y-4 text-sm text-foreground bg-secondary/20 rounded-lg p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium"><Smartphone className="w-4 h-4 text-muted-foreground" /> Google Calendar</div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>{t('export.googleStep1')}</li>
                <li>{t('export.googleStep2')}</li>
                <li>{t('export.googleStep3')}</li>
                <li>{t('export.googleStep4')}</li>
              </ol>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium"><Apple className="w-4 h-4 text-muted-foreground" /> Apple Calendar</div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>{t('export.appleStep1')}</li>
                <li>{t('export.appleStep2')}</li>
                <li>{t('export.appleStep3')}</li>
              </ol>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium"><Mail className="w-4 h-4 text-muted-foreground" /> Outlook</div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 pl-6 text-xs">
                <li>{t('export.outlookStep1')}</li>
                <li>{t('export.outlookStep2')}</li>
                <li>{t('export.outlookStep3')}</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
