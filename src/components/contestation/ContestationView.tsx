import { useState } from 'react';
import { Glyph } from '@/components/ui/glyph';
import { ArrowLeft, Upload, X, FileText, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface ContestationViewProps {
  onBack: () => void;
  entryData?: {
    name: string;
    date: string;
    points: number;
    reason: string;
    hoursAgo: number;
  };
}

export function ContestationView({ onBack, entryData }: ContestationViewProps) {
  const { t } = useTranslation();
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [explanation, setExplanation] = useState('');
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: 'comprovativo_medico.pdf', size: '2.4 MB' },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const MOTIVOS = [
    { key: 'attended', label: t('contestation.reasons.attended') },
    { key: 'cancelledEarly', label: t('contestation.reasons.cancelledEarly') },
    { key: 'systemError', label: t('contestation.reasons.systemError') },
    { key: 'emergency', label: t('contestation.reasons.emergency') },
    { key: 'other', label: t('contestation.reasons.other') },
  ];

  const entry = entryData || {
    name: 'Dr. Gonçalo Pipo',
    date: '31 Jan 2026',
    points: -8,
    reason: 'Faltou à consulta',
    hoursAgo: 4,
  };

  const remainingHours = Math.max(0, 24 - entry.hoursAgo);
  const remainingMinutes = 15;

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Glyph emoji="✅" className="w-14 h-14" />
        <h2 className="text-xl font-bold text-foreground">{t('contestation.submitted')}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {t('contestation.submittedDesc')}
        </p>
        <Button onClick={onBack}>{t('contestation.backToHistory')}</Button>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{t('contestation.title')}</h1>
        </div>

        {/* Original evaluation card */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {entry.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t('contestation.receivedAgo', { hours: entry.hoursAgo })}</p>
            </div>
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
              {entry.points} pontos · {entry.reason}
            </Badge>
          </CardContent>
        </Card>

        {/* Warning banner */}
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-warning">
              {t('contestation.timeLimit')}
            </p>
            <p className="text-xs text-warning/80">
              {t('contestation.timeRemaining')}: {remainingHours}h {remainingMinutes}min
            </p>
          </div>
        </div>

        {/* Motivo */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t('contestation.reason')}</h3>
          <RadioGroup value={selectedMotivo} onValueChange={setSelectedMotivo} className="space-y-2">
            {MOTIVOS.map((motivo) => (
              <div key={motivo.key} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer press">
                <RadioGroupItem value={motivo.key} id={motivo.key} />
                <Label htmlFor={motivo.key} className="text-sm text-foreground cursor-pointer flex-1 press">{motivo.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Explicação */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t('contestation.explain')}</h3>
          <Textarea
            placeholder={t('contestation.explainPlaceholder')}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            maxLength={500}
            className="min-h-[100px]"
          />
          <p className="text-[11px] text-muted-foreground text-right">{explanation.length}/500 {t('contestation.characters')}</p>
        </div>

        {/* Documentos */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">{t('contestation.supportDocs')}</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/30 active:border-primary/40 transition-colors cursor-pointer press">
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">{t('contestation.dragFiles')}</span>
              <span className="sm:hidden">{t('contestation.dragFilesMobile')}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{t('contestation.maxFiles')}</p>
          </div>
          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{f.name}</span>
                    <span className="text-[11px] text-muted-foreground">— {f.size}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] h-8 w-8" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-blue-400">
              {t('contestation.infoReview')}
            </p>
            <p className="text-[11px] text-blue-400/70">
              {t('contestation.infoRejected')}
            </p>
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-center gap-3">
          <Checkbox checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} id="agree" />
          <Label htmlFor="agree" className="text-xs text-foreground cursor-pointer press">
            {t('contestation.declare')}
          </Label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            className="flex-1 min-h-[44px]"
            disabled={!agreed || !selectedMotivo}
            onClick={() => setSubmitted(true)}
          >
            {t('contestation.submit')}
          </Button>
          <Button variant="outline" className="min-h-[44px] sm:w-auto" onClick={onBack}>{t('common.cancel')}</Button>
        </div>
      </div>
    </ScrollArea>
  );
}
