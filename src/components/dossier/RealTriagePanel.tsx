import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTriage, type TriageResponse } from '@/data/dossierSource';
import { formatDate } from '@/lib/formatters';
import { SYMPTOM_KEYS, DURATION_KEYS } from '@/components/triage/TriageCompletion';

/** Read-only triage answers saved for a real appointment; empty state otherwise. */
export function RealTriagePanel({ appointmentId }: { appointmentId: string }) {
  const { t } = useTranslation();
  const [row, setRow] = useState<TriageResponse | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    fetchTriage(appointmentId).then((r) => alive && setRow(r)).catch(() => alive && setRow(null));
    return () => { alive = false; };
  }, [appointmentId]);
  const a = (row?.answers ?? {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String).join(', ') : v ? String(v) : '');
  const fields: [string, string][] = row ? ([
    [t('consultationDetail.triageSymptoms'), [(Array.isArray(a.symptoms) ? a.symptoms.map((x) => (SYMPTOM_KEYS[String(x)] ? t(SYMPTOM_KEYS[String(x)]) : String(x))).join(', ') : ''), a.otherSymptom ? String(a.otherSymptom) : ''].filter(Boolean).join(', ')],
    [t('dossierReal.triage.teeth'), a.unknownLocation ? t('dossierReal.triage.unknown') : list(a.selectedTeeth)],
    [t('consultationDetail.triageDuration'), DURATION_KEYS[String(a.duration ?? '')] ? t(DURATION_KEYS[String(a.duration)]) : list(a.duration)],
    [t('consultationDetail.triageIntensity'), a.painIntensity != null && a.painIntensity !== '' ? `${a.painIntensity}/10` : ''],
  ] as [string, string][]).filter(([, v]) => v) : [];
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('consultationDetail.triage')}</h3>
      {row === undefined ? <Skeleton className="h-12 w-full" /> : !row ? (
        <p className="text-sm text-muted-foreground italic">{t('dossierReal.triage.empty')}</p>
      ) : (
        <div className="space-y-2 text-sm">
          {fields.map(([k, v]) => <p key={k}><span className="text-muted-foreground">{k}:</span> {v}</p>)}
          {row.summary && <p><span className="text-muted-foreground">{t('dossierReal.triage.summary')}:</span> {row.summary}</p>}
          <p className="text-xs text-muted-foreground">{t('dossierReal.triage.answeredOn', { date: formatDate(row.created_at) })}</p>
        </div>
      )}
    </div>
  );
}
