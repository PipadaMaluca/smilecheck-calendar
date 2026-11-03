import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertTriangle, CalendarPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AiLabel, AiNotice } from '@/components/ai/AiNotice';
import { TriageData } from '@/types/triage';

/** General guidance only (not a medical device): no diagnosis, severity or treatment. */
interface AiResult {
  symptomSummary: string;
  generalTips: string[];
  seekUrgentHelp: boolean;
}

export function TriageAiAnalysisCard({ triageData, symptomLabels, durationLabel }: {
  triageData: TriageData;
  symptomLabels: string[];
  durationLabel: string;
}) {
  const { t, i18n } = useTranslation();
  const { demoMode, user } = useAuth();
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Demo mode and signed-out visitors never call the AI.
    if (demoMode || !user) {
      setError(t(demoMode ? 'triage.ai.error' : 'triage.ai.errorAuth'));
      return;
    }
    const lang = (['pt', 'en', 'fr'].includes(i18n.language?.slice(0, 2)) ? i18n.language.slice(0, 2) : 'pt');
    supabase.functions.invoke('triage-ai', {
      body: {
        language: lang,
        symptoms: symptomLabels,
        otherSymptom: triageData.otherSymptom ?? '',
        teeth: triageData.selectedTeeth,
        unknownLocation: triageData.unknownLocation,
        duration: durationLabel,
        painIntensity: triageData.painIntensity,
        isRoutineCheckup: triageData.isRoutineCheckup,
      },
    }).then(async ({ data, error }) => {
      if (cancelled) return;
      const status = (error as { context?: Response } | null)?.context?.status;
      if (status === 401) setError(t('triage.ai.errorAuth'));
      else if (status === 429) setError(t('triage.ai.errorLimit'));
      else if (error || data?.error) setError(t('triage.ai.error'));
      else setResult(data as AiResult);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl p-4 text-left space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground flex-1">{t('triage.ai.title')}</h3>
        <AiLabel />
      </div>
      <AiNotice />

      {!result && !error && (
        <div className="space-y-2" aria-busy="true">
          <p className="text-xs text-muted-foreground">{t('triage.ai.analyzing')}</p>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}

      {error && <p className="text-sm text-muted-foreground">{error}</p>}

      {result && (
        <>
          {result.symptomSummary && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('triage.ai.summaryLabel')}</p>
              <p className="text-sm text-foreground">{result.symptomSummary}</p>
            </div>
          )}
          {result.generalTips.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('triage.ai.tips')}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                {result.generalTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
          <div className={result.seekUrgentHelp ? 'flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive' : 'flex gap-2 rounded-lg bg-muted p-3 text-sm text-foreground'}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            <span>{t(result.seekUrgentHelp ? 'triage.ai.emergency' : 'triage.ai.whenUrgent')}</span>
          </div>
          <p className="flex gap-2 text-sm text-foreground">
            <CalendarPlus className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden />
            <span>{t('triage.ai.book')}</span>
          </p>
          <p className="text-xs text-muted-foreground">{t('triage.ai.disclaimer')}</p>
        </>
      )}
    </div>
  );
}
