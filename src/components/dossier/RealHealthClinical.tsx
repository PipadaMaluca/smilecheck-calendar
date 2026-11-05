import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentsSection } from '@/components/dossier/RealPatientDossier';
import { fetchDocuments, fetchMyPlans, uploadDocument, type ClinicalDocument, type TreatmentPlan } from '@/data/dossierSource';
import { fetchDisplayNames } from '@/data/displayNames';
import { formatCurrency, formatDate } from '@/lib/formatters';

/** Patient side (real accounts): own clinical documents (upload/view) and treatment plans without internal notes. */
export function RealHealthClinical({ patientId }: { patientId: string }) {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<ClinicalDocument[] | null>(null);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    const [d, p] = await Promise.all([fetchDocuments(patientId).catch(() => []), fetchMyPlans().catch(() => [])]);
    setDocs(d); setPlans(p.filter((x) => !x.family_member_id));
    const ids = Array.from(new Set(d.filter((x) => !x.uploaded_by_patient).map((x) => x.uploaded_by)));
    if (ids.length) setNames(Object.fromEntries(await fetchDisplayNames(ids).catch(() => new Map<string, string>())));
  }, [patientId]);
  useEffect(() => { void load(); }, [load]);
  if (docs === null) return <Skeleton className="h-24 w-full" />;
  return (
    <div className="space-y-4">
      <DocumentsSection docs={docs} names={names} onChanged={load}
        onUpload={(f, type) => uploadDocument({ patientId, file: f, docType: type })} />
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">{t('dossierReal.plans')}</h4>
        {plans.length === 0 ? <p className="text-sm text-muted-foreground italic">{t('dossierReal.noPlans')}</p> : plans.map((p) => (
          <div key={p.id} className="p-3 rounded-lg bg-secondary/50 space-y-1">
            <p className="text-sm font-medium">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.clinic ?? '—'} · {formatDate(p.updated_at)}</p>
            <ul className="text-sm space-y-0.5">
              {p.items.map((i) => (
                <li key={i.id} className={i.status === 'cancelado' ? 'line-through text-muted-foreground' : ''}>
                  {i.tooth ? `${t('odontogram.tooth')} ${i.tooth} · ` : ''}{i.procedure} · {t(`dossierReal.itemStatusValue.${i.status}`)}
                  {i.estimated_price != null ? ` · ${formatCurrency(Number(i.estimated_price))}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
