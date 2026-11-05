import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { supabase } from '@/integrations/supabase/client';
import { searchMyPatients, dobDisplay, type PatientHit } from '@/data/publicProfiles';
import { cn } from '@/lib/utils';

export interface PickedPatient { id: string; name: string; dateOfBirth: string | null; familyMemberId: string | null; familyName?: string }

/** Real patient picker: only patients in an active relationship (server RPC), plus their family members visible to me. */
export function PatientPicker({ value, onChange }: { value: PickedPatient | null; onChange: (p: PickedPatient | null) => void }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<PatientHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<{ id: string; full_name: string; date_of_birth: string | null }[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const h = setTimeout(() => {
      void searchMyPatients(q, 0, 20).then((r) => { if (alive) setItems(r.items); }).catch(() => { if (alive) setItems([]); })
        .finally(() => { if (alive) setLoading(false); });
    }, 250);
    return () => { alive = false; clearTimeout(h); };
  }, [q]);

  useEffect(() => {
    if (!value) { setFamily([]); return; }
    void supabase.from('family_members').select('id, full_name, date_of_birth').eq('primary_patient_id', value.id)
      .then(({ data }) => setFamily((data ?? []) as typeof family));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('prescription.searchPatient')} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      {loading && items.length === 0 ? <Skeleton className="h-16 w-full" /> : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t('docs.noPatients')}</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => {
            const sel = value?.id === p.id;
            return (
              <button key={p.id} type="button"
                onClick={() => onChange({ id: p.id, name: p.full_name ?? '', dateOfBirth: p.date_of_birth, familyMemberId: null })}
                className={cn('w-full flex items-center p-2.5 gap-2.5 rounded-lg border transition-colors hover:border-primary hover:bg-primary/5',
                  sel ? 'border-primary bg-primary/10' : 'border-border')}>
                <PersonAvatar name={p.full_name ?? ''} size="sm" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{dobDisplay(p.date_of_birth)}</p>
                </div>
                {sel && <Check className="w-5 h-5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
      {value && family.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('docs.forWhom')}</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: null as string | null, full_name: value.name, date_of_birth: value.dateOfBirth }, ...family].map((f) => (
              <button key={f.id ?? 'self'} type="button"
                onClick={() => onChange({ ...value, familyMemberId: f.id, familyName: f.id ? f.full_name : undefined })}
                className={cn('px-3 py-1.5 rounded-lg border text-sm', value.familyMemberId === f.id ? 'border-primary bg-primary/10' : 'border-border')}>
                {f.full_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
