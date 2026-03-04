import { Sparkles } from 'lucide-react';
import smileCheckLogo from '@/assets/smilecheck-logo.png';
import { UserRole } from '@/types/calendar';

interface SlideWelcomeProps {
  isActive: boolean;
  userRole: UserRole;
}

const WELCOME_DATA: Record<UserRole, { title: string; subtitle: string; tagline: string }> = {
  patient: {
    title: 'SmileCheck!',
    subtitle: 'A app que recompensa a tua saúde oral!',
    tagline: 'Ganha pontos, sobe de nível e destaca-te!',
  },
  dentist: {
    title: 'SmileCheck Pro!',
    subtitle: 'A plataforma que valoriza a tua prática clínica!',
    tagline: 'Ganha pontos, sobe de nível e destaca-te!',
  },
  clinic: {
    title: 'SmileCheck Clínica!',
    subtitle: 'A plataforma que destaca a sua clínica!',
    tagline: 'Acumule pontos, suba de nível e lidere o ranking!',
  },
};

export const SlideWelcome = ({ isActive, userRole }: SlideWelcomeProps) => {
  const data = WELCOME_DATA[userRole];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
      {/* Animated logo */}
      <div className={`relative mb-8 ${isActive ? 'animate-float' : ''}`}>
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center">
          <img 
            src={smileCheckLogo} 
            alt="SmileCheck Logo" 
            className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(100,180,255,0.4)]"
          />
        </div>
        <Sparkles 
          className={`absolute -top-2 -right-2 w-8 h-8 text-gaming-gold ${isActive ? 'animate-sparkle' : ''}`} 
        />
        <Sparkles 
          className={`absolute bottom-2 -left-4 w-6 h-6 text-gaming-diamond ${isActive ? 'animate-sparkle' : ''}`}
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Title */}
      <h1 className="font-gaming text-3xl md:text-4xl text-foreground mb-3">
        Bem-vindo ao{' '}
        <span className="text-gaming-diamond">{data.title}</span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-muted-foreground mb-6">
        {data.subtitle}
      </p>

      {/* Description card */}
      <div className="glass-card p-6 max-w-sm">
        <p className="text-foreground/90 leading-relaxed">
          <span className="text-gaming-gold font-semibold">{data.tagline.split(',')[0]}</span>
          {data.tagline.includes(',') && <>, <span className="text-gaming-diamond font-semibold">{data.tagline.split(',').slice(1).join(',').trim()}</span></>}
          {!data.tagline.includes(',') && null}
        </p>
      </div>
    </div>
  );
};
