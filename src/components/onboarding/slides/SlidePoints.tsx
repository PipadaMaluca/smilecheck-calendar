import { UserRole } from '@/types/calendar';

interface SlidePointsProps {
  isActive: boolean;
  userRole: UserRole;
}

interface PointItem {
  icon: string;
  label: string;
  points: string;
}

const PATIENT_POINTS: PointItem[] = [
  { icon: '⭐', label: 'Avaliação 5★', points: '+5 pts' },
  { icon: '⭐', label: 'Avaliação 4★', points: '+3 pts' },
  { icon: '✅', label: 'Confirmação 24h', points: '+1 pt' },
  { icon: '✅', label: 'Confirmação 1h', points: '+1 pt' },
  { icon: '🏃', label: 'Compareceu', points: '+5 pts' },
  { icon: '⏰', label: 'Chegou a horas', points: '+2 pts' },
  { icon: '🤝', label: 'Colaborou durante a consulta', points: '+2 pts' },
  { icon: '🪥', label: 'Higiene oral adequada', points: '+2 pts' },
  { icon: '📋', label: 'Seguiu recomendações', points: '+2 pts' },
];

const DENTIST_POINTS: PointItem[] = [
  { icon: '📋', label: 'Consulta concluída', points: '+8 pts' },
  { icon: '📱', label: 'Teleconsulta realizada', points: '+10 pts' },
  { icon: '💬', label: 'Responder mensagem em 24h', points: '+2 pts' },
  { icon: '📝', label: 'Emitir receita', points: '+1 pt' },
  { icon: '📄', label: 'Carta de referência', points: '+2 pts' },
  { icon: '⭐', label: 'Avaliação 5★ de paciente', points: '+5 pts' },
  { icon: '🔥', label: 'Streak 7 dias', points: '+10 pts' },
];

const CLINIC_POINTS: PointItem[] = [
  { icon: '📋', label: 'Consulta concluída na clínica', points: '+3 pts' },
  { icon: '📱', label: 'Teleconsulta realizada', points: '+5 pts' },
  { icon: '⭐', label: 'Avaliação 5★ de paciente', points: '+5 pts' },
  { icon: '👨‍⚕️', label: 'Novo dentista ativo', points: '+15 pts' },
  { icon: '📊', label: 'Taxa confirmação > 90%', points: '+10 pts/sem' },
  { icon: '🏆', label: 'Dentista no Top 100', points: '+20 pts' },
];

const POINTS_BY_ROLE: Record<UserRole, PointItem[]> = {
  patient: PATIENT_POINTS,
  dentist: DENTIST_POINTS,
  clinic: CLINIC_POINTS,
};

const BOTTOM_TEXT: Record<UserRole, string> = {
  patient: 'Ganha XP para subir de nível e Pontos para trocar por recompensas!',
  dentist: 'Ganha XP para subir de nível e Pontos para trocar por recompensas!',
  clinic: 'Ganha XP para subir de nível e Pontos para trocar por recompensas!',
};

const TITLE: Record<UserRole, string> = {
  patient: '💰 GANHA XP & PONTOS',
  dentist: '💰 GANHA XP & PONTOS',
  clinic: '💰 GANHE XP & PONTOS',
};

export const SlidePoints = ({ isActive, userRole }: SlidePointsProps) => {
  const pointsData = POINTS_BY_ROLE[userRole];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 overflow-y-auto py-8">
      <h2 className="font-gaming text-2xl md:text-3xl text-gaming-gold mb-6 flex items-center gap-2">
        {TITLE[userRole]}
      </h2>

      <div className="glass-card p-4 w-full max-w-sm space-y-2">
        {pointsData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-foreground font-medium text-sm">{item.label}</span>
            </div>
            <span className="font-bold text-sm text-gaming-green">
              {item.points}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-muted-foreground text-center max-w-xs text-sm">
        {BOTTOM_TEXT[userRole].split('mais pontos')[0]}
        <span className="font-bold text-gaming-green">mais pontos ganhas!</span>
      </p>
    </div>
  );
};
