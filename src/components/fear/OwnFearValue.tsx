import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FEAR_META, clampFear } from '@/lib/fearScale';
import { fetchOwnFearLevel, DEMO_FEAR } from '@/data/fearSource';
import { supabase } from '@/integrations/supabase/client';

/** Patient's own view: only their self-assessment (never the professional's, never the suggested approach). */
export function OwnFearValue() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<number | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setLevel(DEMO_FEAR.patientLevel); return; }
      fetchOwnFearLevel().then((v) => setLevel(v ?? 0)).catch(() => setLevel(null));
    });
  }, []);
  const l = clampFear(level);
  if (l === null) return null;
  const meta = FEAR_META[l];
  const Icon = meta.icon;
  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 min-h-11 text-sm', meta.bg, meta.border)}>
      <Icon className={cn('h-4 w-4', meta.text)} aria-hidden="true" />
      <span className="text-muted-foreground">{t('fear.yourLevel')}:</span>
      <span className={cn('font-medium', meta.text)}>{l} · {t(`fear.levels.${l}.label`)}</span>
    </div>
  );
}
