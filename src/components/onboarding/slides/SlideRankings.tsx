import { Trophy } from 'lucide-react';
import { UserRole } from '@/types/calendar';

interface SlideRankingsProps {
  isActive: boolean;
  userRole: UserRole;
}

const RANKING_TYPES: Record<UserRole, { icon: string; title: string; description: string }[]> = {
  patient: [],
  dentist: [
    { icon: '🌐', title: 'Global', description: 'Top 25 mundial' },
    { icon: '🏳️', title: 'Nacional', description: 'Top 25 do seu país' },
    { icon: '🏢', title: 'Clínica', description: 'Dentro da sua clínica' },
  ],
  clinic: [
    { icon: '🌐', title: 'Global', description: 'Top 25 mundial' },
    { icon: '🏳️', title: 'Nacional', description: 'Top 25 do seu país' },
    { icon: '📍', title: 'Regional', description: 'Na sua região' },
  ],
};

const monthlyPrizes = [
  { position: 2, prize: '€100 em produtos + badge', color: '#C0C0C0' },
  { position: 1, prize: '€200 em produtos + badge exclusivo', color: '#FFD700' },
  { position: 3, prize: '€50 em produtos + badge', color: '#CD7F32' },
];

export const SlideRankings = ({ isActive, userRole }: SlideRankingsProps) => {
  const rankingTypes = RANKING_TYPES[userRole] || RANKING_TYPES.dentist;

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
      <h2 className="font-gaming text-xl md:text-2xl text-gaming-gold mb-4 flex items-center gap-2">
        🏆 RANKINGS & COMPETIÇÃO
      </h2>

      {/* Podium Visual */}
      <div className="flex items-end justify-center gap-1 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: '#C0C0C0' }}>2º</span>
          <div className="w-12 h-14 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#C0C0C0' }}>
            <span className="text-xl">🥈</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Trophy className="w-5 h-5 mb-1" style={{ color: '#FFD700' }} />
          <span className="text-lg font-bold" style={{ color: '#FFD700' }}>1º</span>
          <div className="w-14 h-20 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
            <span className="text-2xl">🥇</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: '#CD7F32' }}>3º</span>
          <div className="w-12 h-10 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#CD7F32' }}>
            <span className="text-xl">🥉</span>
          </div>
        </div>
      </div>

      {/* Ranking Types */}
      <div className="w-full max-w-sm mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Tipos de Rankings</h3>
        <div className="grid grid-cols-3 gap-2">
          {rankingTypes.map((type, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <span className="text-xl">{type.icon}</span>
              <p className="text-xs font-semibold text-foreground mt-1">{type.title}</p>
              <p className="text-[10px] text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Prizes */}
      <div className="w-full max-w-sm mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Prémios Mensais</h3>
        <div className="flex items-end justify-center gap-2">
          {monthlyPrizes.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-2 rounded-xl border ${
                item.position === 1 ? 'flex-1 max-w-[140px]' : 'flex-1 max-w-[100px]'
              }`}
              style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}
            >
              <span className="text-lg font-bold" style={{ color: item.color }}>{item.position}º</span>
              <p className="text-[10px] text-center text-muted-foreground mt-1">{item.prize}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Highlights */}
      <div className="w-full max-w-sm mb-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Destaques Anuais</h3>
        <div className="p-3 rounded-xl border border-white/20" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌍</span>
            <span className="font-semibold text-foreground text-sm">Top 1 Global Anual</span>
          </div>
          <p className="text-[10px] text-muted-foreground">€2000 + Bilhete de Congresso + 10% Desconto Pós-Graduação + Badge</p>
        </div>
        <div className="p-3 rounded-xl border border-white/20" style={{ background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-foreground text-sm">Top 1 Nacional Anual</span>
          </div>
          <p className="text-[10px] text-muted-foreground">€1000 + Bilhete de Congresso + Badge</p>
        </div>
      </div>

      {/* Info Note */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <span className="text-base">ℹ️</span>
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p>Rankings atualizam em tempo real</p>
            <p>Em caso de empate: quem tem mais teleconsultas ganha</p>
          </div>
        </div>
      </div>
    </div>
  );
};
