import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, Ban, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/formatters';
import { fetchDisplayNames } from '@/data/displayNames';
import { docNumberLabel, downloadDocumentPdf, voidDocument, type DocKind, type DocRow } from '@/data/clinicalDocs';

/** List of real prescriptions / referral letters with PDF download and (author-only) void with reason. */
export function DocumentList({ kind, rows, loading, error, onChanged, emptyText, patientNames }: {
  kind: DocKind; rows: DocRow[]; loading: boolean; error: boolean; onChanged: () => void; emptyText: string;
  patientNames?: Map<string, string>;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [voidTarget, setVoidTarget] = useState<DocRow | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const ids = Array.from(new Set(rows.flatMap((r) => [r.dentist_id, r.to_dentist_id].filter(Boolean) as string[])));
    if (ids.length) void fetchDisplayNames(ids).then(setNames).catch(() => undefined);
  }, [rows]);

  const pdf = async (r: DocRow) => {
    setBusy(r.id);
    try { await downloadDocumentPdf(kind, r.id, t); } catch { toast.error(t('docs.pdfError')); } finally { setBusy(null); }
  };
  const confirmVoid = async () => {
    if (!voidTarget || reason.trim().length < 3) return;
    try { await voidDocument(kind, voidTarget.id, reason); toast.success(t('docs.voidedOk')); setVoidTarget(null); setReason(''); onChanged(); }
    catch { toast.error(t('docs.voidError')); }
  };

  if (loading) return <Skeleton className="h-20 w-full" />;
  if (error) return <p className="text-sm text-destructive">{t('docs.loadError')}</p>;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground italic py-4 text-center">{emptyText}</p>;

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="p-3 rounded-lg bg-secondary/50 space-y-1" data-testid="doc-row">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{docNumberLabel(kind, r.number)}</span>
              <Badge variant={r.status === 'anulada' ? 'destructive' : 'secondary'}>{t(`docs.status.${r.status}`)}</Badge>
              {r.urgency === 'urgente' && <Badge variant="destructive">{t('docs.urgencyLevel.urgente')}</Badge>}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(new Date(r.created_at), { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {names.get(r.dentist_id) ?? ''}
            {kind === 'referral_letter' && <> → {r.to_external ?? (r.to_dentist_id ? names.get(r.to_dentist_id) : '') ?? ''}</>}
            {patientNames?.get(r.patient_id) && <> · {patientNames.get(r.patient_id)}</>}
          </p>
          <p className="text-xs text-foreground">
            {kind === 'prescription' ? (r.items ?? []).map((i) => [i.medicamento, i.dosagem].filter(Boolean).join(' ')).join(', ') : r.reason}
          </p>
          {r.status === 'anulada' && r.void_reason && <p className="text-xs text-destructive">{t('docs.voidReason')}: {r.void_reason}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2" disabled={busy === r.id} onClick={() => void pdf(r)}>
              <Download className="w-3.5 h-3.5" /> {t('docs.downloadPdf')}
            </Button>
            {r.dentist_id === user?.id && r.status === 'emitida' && (
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2 text-destructive" onClick={() => setVoidTarget(r)}>
                <Ban className="w-3.5 h-3.5" /> {t('docs.void')}
              </Button>
            )}
          </div>
        </div>
      ))}
      <Dialog open={!!voidTarget} onOpenChange={(o) => { if (!o) { setVoidTarget(null); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('docs.voidTitle')}</DialogTitle>
            <DialogDescription>{t('docs.voidDescription')}</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('docs.voidReasonPlaceholder')} maxLength={500} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVoidTarget(null); setReason(''); }}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={reason.trim().length < 3} onClick={() => void confirmVoid()}>{t('docs.void')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
