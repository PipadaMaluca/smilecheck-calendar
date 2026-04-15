import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, ChevronDown, ChevronUp, Smartphone, Apple, Mail, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type Platform = 'google' | 'apple' | 'outlook' | null;

export function CalendarSyncSection() {
  const { t } = useTranslation();
  const [icsLink, setIcsLink] = useState('webcal://smilecheck.app/cal/usr_a1b2c3d4.ics');
  const [expandedPlatform, setExpandedPlatform] = useState<Platform>(null);
  const [syncItems, setSyncItems] = useState({
    inPerson: true,
    teleconsultations: true,
    absences: false,
    trainings: false,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(icsLink);
    toast.success(t('export.linkCopied'));
  };

  const handleRegenerate = () => {
    const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
    setIcsLink(`webcal://smilecheck.app/cal/${newId}.ics`);
    toast.success(t('export.linkRegenerated'));
  };

  const togglePlatform = (p: Platform) => setExpandedPlatform(prev => prev === p ? null : p);

  const platformButtons: { key: Platform; icon: React.ElementType; label: string; steps: string[] }[] = [
    { key: 'google', icon: Smartphone, label: 'Google Calendar', steps: ['googleStep1', 'googleStep2', 'googleStep3', 'googleStep4'] },
    { key: 'apple', icon: Apple, label: 'Apple Calendar', steps: ['appleStep1', 'appleStep2', 'appleStep3'] },
    { key: 'outlook', icon: Mail, label: 'Outlook', steps: ['outlookStep1', 'outlookStep2', 'outlookStep3'] },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('export.syncTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{t('export.syncDescription')}</p>

        {/* Sync Status */}
        <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-foreground">{t('export.statusSynced')}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t('export.lastSync')}: {t('export.lastSyncTime')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('export.nextSync')}: {t('export.nextSyncTime')}</p>
        </div>

        {/* Platform Sync Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('export.syncWith')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {platformButtons.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => togglePlatform(key)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all min-h-[44px] ${
                  expandedPlatform === key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/20 text-foreground hover:bg-secondary/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
                {expandedPlatform === key ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>

          {expandedPlatform && (
            <div className="bg-secondary/20 rounded-lg p-4 space-y-3 text-sm">
              <ol className="list-decimal list-inside text-muted-foreground space-y-1.5 text-xs">
                {platformButtons.find(p => p.key === expandedPlatform)!.steps.map(step => (
                  <li key={step}>{t(`export.${step}`)}</li>
                ))}
              </ol>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 text-foreground truncate border border-border">{icsLink}</code>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 shrink-0">
                  <Copy className="w-3.5 h-3.5" /> {t('export.copyLink')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* What Syncs */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">{t('export.whatSyncs')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {([
              { key: 'inPerson' as const, label: t('export.syncInPerson') },
              { key: 'teleconsultations' as const, label: t('export.syncTeleconsultations') },
              { key: 'absences' as const, label: t('export.syncAbsences') },
              { key: 'trainings' as const, label: t('export.syncTrainings') },
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer min-h-[44px]">
                <Checkbox
                  checked={syncItems[key]}
                  onCheckedChange={(v) => setSyncItems(prev => ({ ...prev, [key]: !!v }))}
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sync Direction */}
        <div className="bg-secondary/20 rounded-lg p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">{t('export.syncDirectionNote')}</p>
        </div>

        {/* ICS Link & Regenerate */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('export.icsLink')}</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background/50 rounded px-3 py-2 text-foreground truncate border border-border">{icsLink}</code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="w-3.5 h-3.5" /> {t('export.copyLink')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                  <RefreshCw className="w-3.5 h-3.5" /> {t('export.regenerateLink')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('export.regenerateTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('export.regenerateConfirm')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
