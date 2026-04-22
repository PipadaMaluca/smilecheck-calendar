import { Trophy } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface SlideRankingsProps { isActive: boolean; userRole: UserRole; }

export const SlideRankings = ({ isActive, userRole }: SlideRankingsProps) => {
  const { t } = useTranslation();

  const rankingTypes = userRole === 'clinic'
    ? [{ icon: '🌐', titleKey: 'onboarding.rankings.global', descKey: 'onboarding.rankings.globalDesc' }, { icon: '🏳️', titleKey: 'onboarding.rankings.national', descKey: 'onboarding.rankings.nationalDesc' }, { icon: '📍', titleKey: 'onboarding.rankings.regional', descKey: 'onboarding.rankings.regionalDesc' }]
    : [{ icon: '🌐', titleKey: 'onboarding.rankings.global', descKey: 'onboarding.rankings.globalDesc' }, { icon: '🏳️', titleKey: 'onboarding.rankings.national', descKey: 'onboarding.rankings.nationalDesc' }, { icon: '🏢', titleKey: 'onboarding.rankings.clinic', descKey: 'onboarding.rankings.clinicDesc' }];

  const monthlyPrizes = [
    { position: 2, prizeKey: 'onboarding.rankings.prize2', color: '#C0C0C0' },
    { position: 1, prizeKey: 'onboarding.rankings.prize1', color: '#FFD700' },
    { position: 3, prizeKey: 'onboarding.rankings.prize3', color: '#CD7F32' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
      <h2 className="font-gaming text-xl md:text-2xl text-gaming-gold mb-4 flex items-center gap-2">{t('onboarding.rankingsTitle')}</h2>

      <div className="flex items-end justify-center gap-1 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: '#C0C0C0' }}>2º</span>
          <div className="w-12 h-14 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#C0C0C0' }}><span className="text-xl">🥈</span></div>
        </div>
        <div className="flex flex-col items-center">
          <Trophy className="w-5 h-5 mb-1" style={{ color: '#FFD700' }} />
          <span className="text-lg font-bold" style={{ color: '#FFD700' }}>1º</span>
          <div className="w-14 h-20 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}><span className="text-2xl">🥇</span></div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold" style={{ color: '#CD7F32' }}>3º</span>
          <div className="w-12 h-10 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#CD7F32' }}><span className="text-xl">🥉</span></div>
        </div>
      </div>

      <div className="w-full max-w-sm mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">{t('onboarding.rankingsTypes')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {rankingTypes.map((type, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <span className="text-xl">{type.icon}</span>
              <p className="text-xs font-semibold text-foreground mt-1">{t(type.titleKey)}</p>
              <p className="text-[10px] text-muted-foreground">{t(type.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">{t('onboarding.monthlyPrizes')}</h3>
        <div className="flex items-end justify-center gap-2">
          {monthlyPrizes.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-end p-2 rounded-xl border ${
                item.position === 1
                  ? 'flex-1 max-w-[140px] h-[110px]'
                  : item.position === 2
                  ? 'flex-1 max-w-[100px] h-[77px]'
                  : 'flex-1 max-w-[100px] h-[55px]'
              }`}
              style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}40` }}>
              <span className="text-lg font-bold" style={{ color: item.color }}>{item.position}º</span>
              <p className="text-[10px] text-center text-muted-foreground mt-1">{t(item.prizeKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm mb-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">{t('onboarding.annualHighlights')}</h3>
        <div className="p-3 rounded-xl border border-white/20" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌍</span>
            <span className="font-semibold text-foreground text-sm">{t('onboarding.rankings.annualGlobal')}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('onboarding.rankings.annualGlobalPrize')}</p>
        </div>
        <div className="p-3 rounded-xl border border-white/20" style={{ background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-foreground text-sm">{t('onboarding.rankings.annualNational')}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('onboarding.rankings.annualNationalPrize')}</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <span className="text-base">ℹ️</span>
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p>{t('onboarding.rankingsUpdate')}</p>
            <p>{t('onboarding.rankingsTiebreak')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};