import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme, Theme } from '@/hooks/useTheme';
import { UserRole } from '@/types/calendar';
import { Building2, Stethoscope, User, Sun, Moon } from 'lucide-react';
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
  const isDark = theme === 'dark';

  const baseBtn =
    'flex-1 h-[26px] rounded-md text-[11px] font-semibold transition-colors flex items-center justify-center px-0.5 uppercase';
  const active = 'bg-card text-foreground shadow-sm';
  const inactive = 'bg-transparent text-muted-foreground hover:text-foreground';

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-[2px]">{children}</div>
  );

  const roles: { id: UserRole; label: string; Icon: typeof Building2 }[] = [
    { id: 'clinic', label: t('demoTooltips.roleClinic'), Icon: Building2 },
    { id: 'dentist', label: t('demoTooltips.roleDentist'), Icon: Stethoscope },
    { id: 'patient', label: t('demoTooltips.rolePatient'), Icon: User },
  ];
  const langs = ['pt', 'fr', 'en'] as const;
  const themes: { id: Theme; Icon: typeof Sun; tip: string }[] = [
    { id: 'light', Icon: Sun, tip: t('demoTooltips.themeLight') },
    { id: 'dark', Icon: Moon, tip: t('demoTooltips.themeDark') },
  ];

  const Divider = () => (
    <div
      className="h-[1px] my-1 rounded-full bg-border" 
      aria-hidden="true"
    />
  );

  return (
    <div
      className={cn(
        'rounded-[10px] border border-border bg-muted/60 backdrop-blur-md mx-1',
        'p-1.5',
        className
      )}
    >
      <div className="space-y-0">
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
                      <Ico className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{r.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </Row>
        </TooltipProvider>

        <Divider />

        {/* Language */}
        <Row>
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => i18n.changeLanguage(l)}
              className={cn(baseBtn, i18n.language === l ? active : inactive)}
              aria-pressed={i18n.language === l}
            >
              {l}
            </button>
          ))}
        </Row>

        <Divider />

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
              <tt.Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </Row>
      </div>
    </div>
  );
}