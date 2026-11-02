import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/ui/empty-state';

/** Real dentist accounts without any clinic: they cannot receive bookings until they join one. Demo never shows it. */
export function NoClinicNotice({ onInvite }: { onInvite: () => void }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: me } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (me?.role !== 'dentist') return;
      const { count } = await supabase.from('clinic_members').select('id', { count: 'exact', head: true }).eq('dentist_id', session.user.id);
      if (alive) setShow((count ?? 0) === 0);
    })().catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!show) return null;
  return (
    <div role="status" className="mb-4 rounded-2xl border border-warning/30 bg-warning/10">
      <EmptyState
        icon={Building2}
        size="sm"
        title={t('noClinic.title')}
        description={t('noClinic.description')}
        action={{ label: t('noClinic.invite'), onClick: onInvite }}
      />
    </div>
  );
}
