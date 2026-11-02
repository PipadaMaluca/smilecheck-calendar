import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CHEQUE_PROTESE_START } from '@/lib/cheques';
import { formatDate } from '@/lib/formatters';

/** Clinic-only toggles; hidden for clinics outside Portugal. The server also refuses true for FR clinics. */
export function ClinicChequesSettings() {
  const { t } = useTranslation();
  const { demoMode, user } = useAuth();
  const [clinic, setClinic] = useState<{ id: string; country: string; accepts_cheque_dentista: boolean; accepts_cheque_protese: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (demoMode || !user) {
      setClinic({ id: 'demo', country: 'PT', accepts_cheque_dentista: true, accepts_cheque_protese: true });
      return;
    }
    void supabase.from('clinics').select('id, country, accepts_cheque_dentista, accepts_cheque_protese')
      .eq('owner_profile_id', user.id).limit(1).maybeSingle()
      .then(({ data }) => setClinic(data ?? null));
  }, [demoMode, user]);

  if (!clinic || clinic.country !== 'PT') return null;

  const update = async (field: 'accepts_cheque_dentista' | 'accepts_cheque_protese', value: boolean) => {
    const prev = clinic;
    setClinic({ ...clinic, [field]: value });
    if (clinic.id === 'demo') return;
    const { error } = await supabase.from('clinics').update(field === 'accepts_cheque_dentista' ? { accepts_cheque_dentista: value } : { accepts_cheque_protese: value }).eq('id', clinic.id);
    if (error) { setClinic(prev); toast.error(t('cheques.saveError')); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{t('cheques.acceptsDentista')}</span>
        <Switch aria-label={t('cheques.acceptsDentista')} checked={clinic.accepts_cheque_dentista} onCheckedChange={(v) => update('accepts_cheque_dentista', v)} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {t('cheques.acceptsProtese')}
          <span className="block text-xs text-muted-foreground font-normal">{t('cheques.proteseFromHint', { date: formatDate(CHEQUE_PROTESE_START, { month: 'long', year: 'numeric' }) })}</span>
        </span>
        <Switch aria-label={t('cheques.acceptsProtese')} checked={clinic.accepts_cheque_protese} onCheckedChange={(v) => update('accepts_cheque_protese', v)} />
      </div>
    </div>
  );
}
