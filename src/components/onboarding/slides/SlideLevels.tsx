interface SlideLevelsProps {
  isActive: boolean;
}

const levelsData = [
  { icon: '🥫', name: 'Lata', range: '0-99 pts', color: 'text-muted-foreground', bgColor: 'bg-muted/20', borderColor: 'border-muted/40' },
  { icon: '🥉', name: 'Bronze', range: '100-249 pts', color: 'text-amber-700', bgColor: 'bg-amber-700/20', borderColor: 'border-amber-700/40' },
  { icon: '🥈', name: 'Prata', range: '250-499 pts', color: 'text-gray-300', bgColor: 'bg-gray-300/20', borderColor: 'border-gray-300/40' },
  { icon: '🥇', name: 'Ouro', range: '500-999 pts', color: 'text-amber-400', bgColor: 'bg-amber-400/20', borderColor: 'border-amber-400/40' },
  { icon: '⬜', name: 'Platina', range: '1000-1999 pts', color: 'text-white', bgColor: 'bg-white/20', borderColor: 'border-white/40' },
  { icon: '💎', name: 'Diamante', range: '2000-4999 pts', color: 'text-sky-400', bgColor: 'bg-sky-400/20', borderColor: 'border-sky-400/40' },
  { icon: '🔱', name: 'Adamantino', range: '5000+ pts', color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/40' },
];

export const SlideLevels = ({ isActive }: SlideLevelsProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-6 flex items-center gap-2">
        🏆 SOBE DE NÍVEL
      </h2>

      <div className="glass-card p-4 w-full max-w-sm space-y-2">
        {levelsData.map((level, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${level.bgColor} ${level.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{level.icon}</span>
              <span className={`font-bold ${level.color}`}>{level.name}</span>
            </div>
            <span className="text-muted-foreground text-sm font-medium">{level.range}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-muted-foreground text-center max-w-xs text-sm">
        Acumula pontos e <span className="text-amber-400 font-semibold">mostra o teu estatuto!</span>
      </p>
    </div>
  );
};
