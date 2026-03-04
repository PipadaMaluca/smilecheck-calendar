import { UserRole } from '@/types/calendar';

interface SlidePointsProps {
  isActive: boolean;
  userRole: UserRole;
}

const POINTS_DATA: Record<UserRole, { icon: string; label: string; points: string }[]> = {
  patient: [
    { icon: '⭐', label: 'Avaliação 5★', points: '+5 pts' },
    { icon: '✅', label: 'Confirmar consulta', points: '+1 pt' },
    { icon: '📝', label: 'Deixar avaliação', points: '+1 pt' },
    { icon: '👥', label: 'Convidar amigo', points: '+10 pts' },
    { icon: '🔥', label: 'Streak 7 dias', points: '+5 pts' },
    { icon: '🏥', label: 'Ir à consulta', points: '+3 pts' },
  ],
  dentist: [
    { icon: '⭐', label: 'Avaliação 5★ do paciente', points: '+5 pts' },
    { icon: '✅', label: 'Confirmar paciente', points: '+1 pt' },
    { icon: '📱', label: 'Teleconsulta realizada', points: '+3 pts' },
    { icon: '📝', label: 'Prescrição enviada', points: '+1 pt' },
    { icon: '👥', label: 'Convidar colega', points: '+10 pts' },
    { icon: '🔥', label: 'Streak 7 dias', points: '+5 pts' },
  ],
  clinic: [
    { icon: '⭐', label: 'Avaliação média 4.5+', points: '+10 pts' },
    { icon: '✅', label: 'Taxa confirmação >90%', points: '+5 pts' },
    { icon: '📱', label: 'Teleconsultas da equipa', points: '+2 pts' },
    { icon: '👥', label: 'Convidar clínica', points: '+20 pts' },
    { icon: '🔥', label: 'Streak 30 dias', points: '+15 pts' },
  ],
};

export const SlidePoints = ({ isActive, userRole }: SlidePointsProps) => {
  const data = POINTS_DATA[userRole];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-8 flex items-center gap-2">
        💰 GANHA PONTOS
      </h2>

      <div className="glass-card p-6 w-full max-w-sm space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-foreground font-medium text-sm">{item.label}</span>
            </div>
            <span className="font-bold text-emerald-400 text-sm">{item.points}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-muted-foreground text-center max-w-xs text-sm">
        {userRole === 'patient'
          ? <>100 pontos = <span className="text-primary font-bold">€10 em recompensas!</span></>
          : <>Acumule pontos e <span className="text-primary font-bold">suba nos rankings!</span></>
        }
      </p>
    </div>
  );
};
