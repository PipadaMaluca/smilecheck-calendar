import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { searchMyPatients, type PatientHit } from '@/data/publicProfiles';
import { formatDate } from '@/lib/formatters';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const PAGE = 20;

/**
 * Real patient search (dentist/clinic): server RPC `search_my_patients` returns only
 * patients in an active relationship (same rule as the dossier). Opening a file
 * goes through the dossier screen, which logs the access.
 */
export function RealPatientsTab({ onViewDossier }: { onViewDossier?: (patientId: string) => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<PatientHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const req = useRef(0);

  const load = async (q: string, offset: number) => {
    const id = ++req.current;
    setLoading(true); setError(false);
    try {
      const r = await searchMyPatients(q, offset, PAGE);
      if (id !== req.current) return;
      setItems((prev) => (offset === 0 ? r.items : [...prev, ...r.items]));
      setTotal(r.total);
    } catch {
      if (id === req.current) setError(true);
    } finally {
      if (id === req.current) setLoading(false);
    }
  };

  useEffect(() => {
    const h = setTimeout(() => void load(query, 0), 300);
    return () => clearTimeout(h);
  }, [query]);

  return (
    <div className="space-y-4" data-testid="real-patients">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('publicProfile.patientSearchPlaceholder')} className="pl-10" />
      </div>
      <p className="text-xs text-muted-foreground">{t('search.resultsFound', { count: total })}</p>
      {loading && items.length === 0 ? (
        <Skeleton className="h-24 w-full" />
      ) : error ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{t('search.real.loadError')}</p>
          <Button variant="outline" className="mt-3" onClick={() => void load(query, 0)}>{t('common.retry')}</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('search.noPatientsFound')}</p>
          <p className="text-xs mt-1">{t('search.tryOtherTerms')}</p>
        </div>
      ) : (
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
          {items.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <PersonAvatar name={p.full_name ?? ''} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{p.full_name ?? '—'}</p>
                  {p.date_of_birth && <p className="text-xs text-muted-foreground">{formatDate(`${p.date_of_birth}T12:00:00`, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('publicProfile.lastVisit')}: {p.last_visit ? formatDate(p.last_visit, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                {' · '}
                {t('publicProfile.nextVisit')}: {p.next_visit ? formatDate(p.next_visit, { day: 'numeric', month: 'short' }) : '—'}
              </p>
              <Button size="sm" variant="outline" className="w-full text-xs gap-1" onClick={() => onViewDossier?.(p.id)}>
                <FolderOpen className="w-3 h-3" /> {t('publicProfile.openDossier')}
              </Button>
            </div>
          ))}
        </div>
      )}
      {items.length < total && !loading && (
        <div className="flex justify-center"><Button variant="outline" onClick={() => void load(query, items.length)}>{t('search.real.loadMore')}</Button></div>
      )}
    </div>
  );
}
