import { useState, useEffect } from 'react';

interface SlideRewardsProps {
  isActive: boolean;
}

export const SlideRewards = ({ isActive }: SlideRewardsProps) => {
  const [time, setTime] = useState({ hours: 14, minutes: 32, seconds: 47 });

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const rewards = [
    { icon: '📅', label: 'Check-in diário', bonus: '+1 pt/dia' },
    { icon: '🔥', label: 'Streak 7 dias', bonus: '+5 pts' },
    { icon: '🏆', label: 'Streak 30 dias', bonus: '+15 pts' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <h2 className="font-gaming text-2xl md:text-3xl text-gaming-gold mb-6 flex items-center gap-2">
        🎁 RECOMPENSAS DIÁRIAS
      </h2>

      <div className="glass-card-strong p-6 w-full max-w-sm text-center mb-6">
        <p className="text-muted-foreground mb-4 text-sm">Próxima recompensa em:</p>
        
        <div className="flex justify-center gap-2 mb-6">
          {[
            { value: formatNumber(time.hours), label: 'H' },
            { value: formatNumber(time.minutes), label: 'M' },
            { value: formatNumber(time.seconds), label: 'S' },
          ].map((unit, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`bg-secondary/80 rounded-xl px-4 py-3 min-w-[60px] ${isActive ? 'animate-countdown' : ''}`}>
                <span className="font-gaming text-3xl text-gaming-green">{unit.value}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{unit.label}</span>
            </div>
          ))}
        </div>

        <p className="text-foreground font-medium mb-4">
          Abre a app todos os dias! 📱
        </p>

        <div className="space-y-2">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{
                backgroundColor: 'hsla(162, 100%, 43%, 0.1)',
                borderColor: 'hsla(162, 100%, 43%, 0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{reward.icon}</span>
                <span className="text-foreground/80 text-sm">{reward.label}</span>
              </div>
              <span className="text-gaming-green font-bold text-sm">{reward.bonus}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-center text-sm max-w-xs">
        Reset às <span className="text-gaming-gold font-semibold">9h</span> — não percas o teu streak!
      </p>
    </div>
  );
};
