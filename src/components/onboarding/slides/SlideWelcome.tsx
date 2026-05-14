import { Sparkles } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/branding/Logo';

interface SlideWelcomeProps { isActive: boolean; userRole: UserRole; }

export const SlideWelcome = ({ isActive, userRole }: SlideWelcomeProps) => {
  const { t } = useTranslation();
  const roleKey = userRole === 'patient' ? 'patient' : userRole === 'dentist' ? 'dentist' : 'clinic';
  const title = t(`onboarding.${roleKey}.welcomeTitle`);
  const subtitle = t(`onboarding.${roleKey}.welcomeSubtitle`);
  const tagline = t(`onboarding.${roleKey}.welcomeTagline`);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
      <div className={`relative mb-8 ${isActive ? 'animate-float' : ''}`}>
        <div className="flex items-center justify-center">
          <span className="block sm:hidden"><Logo variant="full" size={260} className="drop-shadow-[0_0_20px_rgba(100,180,255,0.4)]" /></span>
          <span className="hidden sm:block lg:hidden"><Logo variant="full" size={280} className="drop-shadow-[0_0_20px_rgba(100,180,255,0.4)]" /></span>
          <span className="hidden lg:block"><Logo variant="full" size={300} className="drop-shadow-[0_0_20px_rgba(100,180,255,0.4)]" /></span>
        </div>
        <Sparkles className={`absolute -top-2 -right-2 w-8 h-8 text-gaming-gold ${isActive ? 'animate-sparkle' : ''}`} />
        <Sparkles className={`absolute bottom-2 -left-4 w-6 h-6 text-gaming-diamond ${isActive ? 'animate-sparkle' : ''}`} style={{ animationDelay: '0.5s' }} />
      </div>
      <h1 className="font-gaming text-3xl md:text-4xl text-foreground mb-3">
        {t('onboarding.welcomeTo')}{' '}<span className="text-gaming-diamond">{title}</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-6">{subtitle}</p>
      <div className="glass-card p-6 max-w-sm">
        <p className="text-foreground/90 leading-relaxed">
          <span className="text-gaming-gold font-semibold">{tagline.split(',')[0]}</span>
          {tagline.includes(',') && <>, <span className="text-gaming-diamond font-semibold">{tagline.split(',').slice(1).join(',').trim()}</span></>}
        </p>
      </div>
    </div>
  );
};