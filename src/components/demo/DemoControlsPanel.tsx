import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import smileIcon from '@/assets/smilecheck-icon.png';
import { cn } from '@/lib/utils';
import { useTheme, Theme } from '@/hooks/useTheme';
import { UserRole } from '@/types/calendar';
import { Building2, Stethoscope, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ROLE_EVENT = 'smilecheck:set-role';

export function dispatchRoleChange(role: UserRole) {
  window.dispatchEvent(new CustomEvent(ROLE_EVENT, { detail: role }));
}

export function useDemoRole(): [UserRole, (r: UserRole) => void] {
  const [params, setParams] = useSearchParams();
  const urlRole = params.get('role');
  const initial: UserRole =
    urlRole === 'patient' || urlRole === 'dentist' || urlRole === 'clinic'
      ? urlRole
      : 'clinic';
  const [role, setRoleState] = useState<UserRole>(initial);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<UserRole>).detail;
      if (next === 'patient' || next === 'dentist' || next === 'clinic') {
        setRoleState(next);
      }
    };
    window.addEventListener(ROLE_EVENT, handler);
    return () => window.removeEventListener(ROLE_EVENT, handler);
  }, []);

  const setRole = (r: UserRole) => {
    setRoleState(r);
    const next = new URLSearchParams(params);
    next.set('role', r);
    setParams(next, { replace: true });
    dispatchRoleChange(r);
  };

  return [role, setRole];
}

interface DemoControlsPanelProps {
  className?: string;
  compact?: boolean;
}

export function DemoControlsPanel({ className, compact = false }: DemoControlsPanelProps) {
  const { i18n, t } = useTranslation();
  const [theme, setTheme] = useTheme();
  const [role, setRole] = useDemoRole();

  const baseBtn =
    'flex-1 h-8 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-[10px] px-[3px]';
  const active = 'bg-primary text-primary-foreground';
  const inactive =
    'bg-transparent border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40';

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-[5px]">{children}</div>
  );

  const roles: { id: UserRole; label: string; Icon: typeof Building2 }[] = [
    { id: 'clinic', label: t('demoTooltips.roleClinic'), Icon: Building2 },
    { id: 'dentist', label: t('demoTooltips.roleDentist'), Icon: Stethoscope },
    { id: 'patient', label: t('demoTooltips.rolePatient'), Icon: User },
  ];
  const langs = ['pt', 'fr', 'en'] as const;
  const themes: { id: Theme; label: string; tip: string }[] = [
    { id: 'light', label: '☀️', tip: t('demoTooltips.themeLight') },
    { id: 'dark', label: '🌙', tip: t('demoTooltips.themeDark') },
  ];
  const langTips: Record<string, string> = {
    pt: t('demoTooltips.languagePt'),
    fr: t('demoTooltips.languageFr'),
    en: t('demoTooltips.languageEn'),
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-border bg-background/30',
        compact ? 'p-2.5' : 'p-3',
        className
      )}
    >
      {/* Logo header */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-[12px] font-semibold text-foreground text-center">SmileCheck</span>
      </div>

      <div className="space-y-1">
        {/* Role (icons only with tooltip) */}
        <TooltipProvider delayDuration={200}>
          <Row>
            {roles.map((r) => {
              const Ico = r.Icon;
              return (
                <Tooltip key={r.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setRole(r.id)}
                      className={cn(baseBtn, role === r.id ? active : inactive)}
                      aria-pressed={role === r.id}
                      aria-label={r.label}
                    >
                      <Ico className="h-[15px] w-[15px] px-[5px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{r.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </Row>
        </TooltipProvider>

        {/* Language */}
        <Row>
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => i18n.changeLanguage(l)}
              className={cn(
                baseBtn,
                'uppercase',
                i18n.language === l ? active : inactive
              )}
              aria-pressed={i18n.language === l}
            >
              {l}
            </button>
          ))}
        </Row>

        {/* Theme */}
        <Row>
          {themes.map((tt) => (
            <button
              key={tt.id}
              onClick={() => setTheme(tt.id)}
              className={cn(baseBtn, theme === tt.id ? active : inactive)}
              aria-label={tt.id}
              aria-pressed={theme === tt.id}
            >
              <span className="text-[14px] leading-none">{tt.label}</span>
            </button>
          ))}
        </Row>
      </div>
    </div>
  );
}