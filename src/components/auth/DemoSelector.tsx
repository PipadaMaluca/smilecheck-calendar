import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Stethoscope, Building2 } from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import { Logo } from '@/components/branding/Logo';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/calendar';

const options: { icon: typeof User; labelKey: string; name: string; role: UserRole }[] = [
  { icon: Building2, labelKey: 'demo.clinic', name: 'SmileCheck', role: 'clinic' },
  { icon: Stethoscope, labelKey: 'demo.dentist', name: 'Dr. Gonçalo Pipo', role: 'dentist' },
  { icon: User, labelKey: 'demo.patient', name: 'João Silva', role: 'patient' },
];

export function DemoSelector() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enterDemo } = useAuth();

  return (
    <AuthBackground>
      <div className="flex flex-col items-center animate-fade-in">
        <div className="mb-8">
          <span className="block sm:hidden"><Logo variant="full" size={260} className="drop-shadow-[0_0_30px_hsla(207,90%,54%,0.35)]" /></span>
          <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="drop-shadow-[0_0_30px_hsla(207,90%,54%,0.35)]" /></span>
          <span className="hidden lg:block"><Logo variant="full" size={300} className="drop-shadow-[0_0_30px_hsla(207,90%,54%,0.35)]" /></span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">{t('demo.title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('demo.subtitle')}</p>

        <div className="w-full space-y-3">
          {options.map((o) =>
            <button
              key={o.role}
              onClick={() => {
                localStorage.removeItem(`smilecheck_video_splash_${o.role}`);
                enterDemo(o.role);
                navigate(`/app?role=${o.role}&demo=true`);
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border hover:border-primary hover:bg-accent transition-colors press"
            >
              <o.icon className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">{t(o.labelKey)} {o.name}</span>
            </button>
          )}
        </div>

        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
          {t('demo.backToLogin')}
        </button>
      </div>
    </AuthBackground>
  );
}
