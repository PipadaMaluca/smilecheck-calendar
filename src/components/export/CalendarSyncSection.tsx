import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, ChevronDown, Smartphone, Apple, Mail, AlertCircle, AlertTriangle } from 'lucide-react';
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
  const [syncError, setSyncError] = useState(false);
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

  const handleRetry = () => {
    setSyncError(false);
    toast.success(t('export.statusSynced'));
  };

  const togglePlatform = (p: Platform) => setExpandedPlatform(prev => prev === p ? null : p);

  const platformButtons: { key: Exclude<Platform, null>; icon: React.ElementType; emoji: string; label: string; steps: string[] }[] = [
    { key: 'google', icon: Smartphone, emoji: '📱', label: 'Google Calendar', steps: ['googleStep1', 'googleStep2', 'googleStep3', 'googleStep4'] },
    { key: 'apple', icon: Apple, emoji: '🍎', label: 'Apple Calendar', steps: ['appleStep1', 'appleStep2', 'appleStep3', 'appleStep4'] },
    { key: 'outlook', icon: Mail, emoji: '📧', label: 'Outlook', steps: ['outlookStep1', 'outlookStep2', 'outlookStep3', 'outlookStep4'] },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('export.syncTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{t('export.syncDescription')}</p>

        {/* Platform Sync Buttons (stacked, accordion) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('export.syncWith')}</label>
          <div className="space-y-2">
            {platformButtons.map(({ key, emoji, label, steps }) => {
              const isOpen = expandedPlatform === key;
              return (
                <div key={key} className="rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => togglePlatform(key)}
                    aria-expanded={isOpen}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors min-h-[56px] ${
                      isOpen ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl leading-none" aria-hidden>{emoji}</span>
                      <span className="text-base font-semibold">{label}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 py-4 bg-background/40 border-t border-border space-y-3">
                      <ol className="list-decimal list-inside text-muted-foreground space-y-1.5 text-sm">
                        {steps.map(step => (
                          <li key={step}>{t(`export.${step}`)}</li>
                        ))}
                      </ol>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-background/60 rounded px-3 py-2 text-foreground truncate border border-border">{icsLink}</code>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 shrink-0">
                          <Copy className="w-3.5 h-3.5" /> {t('export.copyLink')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync Status */}
        <div className={`rounded-lg p-3 space-y-2 border ${syncError ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/30 border-transparent'}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {syncError ? (
                <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className={`text-sm font-medium ${syncError ? 'text-destructive' : 'text-foreground'}`}>
                {syncError ? t('export.syncError') : t('export.statusSynced')}
              </span>
            </div>
            {syncError ? (
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1.5 h-8">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('export.tryAgain')}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">{t('export.lastSync')}: {t('export.lastSyncTime')}</span>
            )}
          </div>
          {!syncError && (
            <p className="text-xs text-muted-foreground">{t('export.nextSync')}: {t('export.nextSyncTime')}</p>
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

        {/* Regenerate Link */}
        <div className="flex flex-wrap gap-2 justify-end">
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
      </CardContent>
    </Card>
  );
}
