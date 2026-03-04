import { Check, Square, PartyPopper } from 'lucide-react';
import { UserRole } from '@/types/calendar';

interface SlideStartProps {
  isActive: boolean;
  userRole: UserRole;
  onComplete: () => void;
}

interface NextStep {
  label: string;
  points: string;
}

const STEPS_BY_ROLE: Record<UserRole, { title: string; bonus: string; bonusPoints: string; steps: NextStep[] }> = {
  patient: {
    title: 'ESTÁS PRONTO!',
    bonus: '+5 pts por criar conta',
    bonusPoints: '5',
    steps: [
      { label: 'Completar perfil', points: '+3 pts' },
      { label: 'Primeira consulta', points: '+10 pts' },
      { label: 'Convidar um amigo', points: '+10 pts' },
    ],
  },
  dentist: {
    title: 'ESTÁS PRONTO!',
    bonus: '+5 pts por criar conta',
    bonusPoints: '5',
    steps: [
      { label: 'Completar perfil', points: '+5 pts' },
      { label: 'Primeira consulta realizada', points: '+10 pts' },
      { label: 'Verificar email/telemóvel', points: '+3 pts' },
    ],
  },
  clinic: {
    title: 'ESTÁ PRONTO!',
    bonus: '+10 pts por criar conta',
    bonusPoints: '10',
    steps: [
      { label: 'Completar perfil da clínica', points: '+10 pts' },
      { label: 'Adicionar 5 fotos', points: '+5 pts' },
      { label: 'Verificar dados oficiais', points: '+5 pts' },
    ],
  },
};

export const SlideStart = ({ isActive, userRole, onComplete }: SlideStartProps) => {
  const data = STEPS_BY_ROLE[userRole];
  const currentPoints = parseInt(data.bonusPoints);
  const maxPoints = 100;
  const progressPercentage = (currentPoints / maxPoints) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      {/* Animated rocket */}
      <div className={`mb-6 ${isActive ? 'animate-rocket' : ''}`}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center glow-gold" style={{ background: 'linear-gradient(135deg, hsla(45, 100%, 50%, 0.2), hsla(162, 100%, 43%, 0.1))' }}>
          <span className="text-6xl">🚀</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="font-gaming text-3xl md:text-4xl text-foreground mb-4">
        {data.title}
      </h2>

      {/* Account creation bonus */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{ backgroundColor: 'hsla(162, 100%, 43%, 0.2)', borderColor: 'hsla(162, 100%, 43%, 0.4)' }}>
        <Check className="w-5 h-5 text-gaming-green" />
        <span className="text-foreground font-medium">{data.bonus}</span>
      </div>

      {/* Next steps card */}
      <div className="glass-card p-5 w-full max-w-sm mb-6">
        <p className="text-muted-foreground text-sm mb-4">Próximos passos:</p>
        
        <div className="space-y-3">
          {data.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Square className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground/80">{step.label}</span>
              </div>
              <span className="text-gaming-green font-bold text-sm">{step.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4 w-full max-w-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥫</span>
            <span className="text-foreground font-medium">Lata</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {currentPoints}/{maxPoints} pts
          </span>
        </div>
        
        <div className="h-3 bg-secondary/50 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-1000 glow-green"
            style={{ width: `${progressPercentage}%`, background: 'linear-gradient(to right, hsl(162, 100%, 43%), hsla(162, 100%, 43%, 0.7))' }}
          />
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Próximo:</span>
          <span className="text-xl">🥉</span>
          <span className="text-level-bronze font-medium">Bronze</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onComplete}
        className="btn-gaming-gold flex items-center gap-3 px-10 py-4 rounded-2xl text-lg glow-gold"
      >
        <PartyPopper className="w-6 h-6" />
        <span className="font-gaming">COMEÇAR!</span>
      </button>
    </div>
  );
};
