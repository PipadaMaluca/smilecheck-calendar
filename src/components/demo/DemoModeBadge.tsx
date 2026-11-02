import { FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export function DemoModeBadge({ inline, className }: { inline?: boolean; className?: string } = {}) {
  const { demoMode } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // Only inside the app — never on the public landing, auth or legal pages.
  const inApp = pathname.startsWith('/app') || pathname.startsWith('/triagem');
  if (!demoMode || !inApp) return null;

  // Mobile: compact pill integrated in the header, never floating over content.
  if (inline) {
    return (
      <span
        role="status"
        aria-label={t('auth.demoModeActive')}
        className={`md:hidden inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-secondary text-muted-foreground border border-border/60 pointer-events-none ${className ?? ''}`}
      >
        <FlaskConical className="w-3 h-3 text-primary" aria-hidden />
        {t('auth.demo', { defaultValue: 'Demo' })}
      </span>
    );
  }

  // Desktop/tablet only: floating corner badge. Mobile uses the inline header variant.
  return (
    <div className="hidden md:block fixed md:bottom-3 md:right-3 md:z-toast pointer-events-none">
      <span className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-background/80 text-muted-foreground border border-border/60 backdrop-blur-md shadow-sm">
        <FlaskConical className="w-3 h-3 text-primary" />
        {t('auth.demo', { defaultValue: 'Demo' })}
      </span>
    </div>
  );
}
