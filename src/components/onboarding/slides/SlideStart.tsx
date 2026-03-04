import { PartyPopper } from 'lucide-react';
import { UserRole } from '@/types/calendar';

interface SlideStartProps {
  isActive: boolean;
  userRole: UserRole;
  onComplete: () => void;
}

const START_DATA: Record<UserRole, { title: string; description: string }> = {
  patient: { title: 'TUDO PRONTO!', description: 'O seu sorriso agradece. Vamos começar?' },
  dentist: { title: 'VAMOS COMEÇAR!', description: 'A sua prática clínica acaba de ser simplificada.' },
  clinic: { title: 'A SUA CLÍNICA ESTÁ PRONTA!', description: 'Simplifique operações e foque-se no que importa.' },
};

export const SlideStart = ({ isActive, userRole, onComplete }: SlideStartProps) => {
  const data = START_DATA[userRole];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className={`mb-6 ${isActive ? 'animate-rocket' : ''}`}>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-primary/10 flex items-center justify-center glow-gold">
          <span className="text-6xl">🚀</span>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>

      <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">{data.description}</p>

      <button
        onClick={onComplete}
        className="flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-background hover:scale-105 active:scale-95 transition-all duration-300 glow-gold"
      >
        <PartyPopper className="w-6 h-6" />
        COMEÇAR!
      </button>
    </div>
  );
};
