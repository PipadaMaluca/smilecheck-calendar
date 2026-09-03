import { FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export function DemoModeBadge() {
  const { demoMode } = useAuth();
  const { t } = useTranslation();
  if (!demoMode) return null;

  return (
    <div className="fixed left-3 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] md:bottom-3 z-[95] pointer-events-none">
      <span className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-background/80 text-muted-foreground border border-border/60 backdrop-blur-md shadow-sm">
        <FlaskConical className="w-3 h-3 text-primary" />
        {t('auth.demo', { defaultValue: 'Demo' })}
      </span>
    </div>
  );
}
