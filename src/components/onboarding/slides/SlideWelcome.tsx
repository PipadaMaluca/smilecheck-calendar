import { Sparkles } from 'lucide-react';
import smileLogo from '@/assets/smilecheck-logo-full.png';
import { UserRole } from '@/types/calendar';

interface SlideWelcomeProps {
  isActive: boolean;
  userRole: UserRole;
}

const WELCOME_DATA: Record<UserRole, { title: string; subtitle: string; description: string }> = {
  patient: {
    title: 'SmileCheck!',
    subtitle: 'Bem-vindo ao',
    description: 'A sua saúde oral numa só app. Gerir consultas, acumular pontos e cuidar do seu sorriso nunca foi tão fácil.',
  },
  dentist: {
    title: 'SmileCheck Pro!',
    subtitle: 'Bem-vindo ao',
    description: 'A plataforma que simplifica a sua prática clínica. Agenda, pacientes e teleconsultas num só lugar.',
  },
  clinic: {
    title: 'SmileCheck Clínica!',
    subtitle: 'Bem-vindo ao',
    description: 'Gerir a sua clínica nunca foi tão simples. Equipa, operações e estatísticas centralizadas.',
  },
};

export const SlideWelcome = ({ isActive, userRole }: SlideWelcomeProps) => {
  const data = WELCOME_DATA[userRole];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
      <div className={`relative mb-8 ${isActive ? 'animate-float' : ''}`}>
        <img
          src={smileLogo}
          alt="SmileCheck Logo"
          className="w-48 object-contain drop-shadow-[0_0_20px_rgba(33,150,243,0.4)]"
        />
        <Sparkles
          className={`absolute -top-2 -right-2 w-8 h-8 text-amber-400 ${isActive ? 'animate-sparkle' : ''}`}
        />
        <Sparkles
          className={`absolute bottom-2 -left-4 w-6 h-6 text-primary ${isActive ? 'animate-sparkle' : ''}`}
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        {data.subtitle}{' '}
        <span className="text-primary">{data.title}</span>
      </h1>

      <div className="glass-card p-6 max-w-sm">
        <p className="text-foreground/90 leading-relaxed">{data.description}</p>
      </div>
    </div>
  );
};
