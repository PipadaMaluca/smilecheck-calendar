import { UserRole } from '@/types/calendar';
import { Glyph } from '@/components/ui/glyph';
import { useTranslation } from 'react-i18next';

interface SlideRankingsProps { isActive: boolean; userRole: UserRole; }

export const SlideRankings = ({ isActive, userRole }: SlideRankingsProps) => {
  const { t } = useTranslation();

  const rankingTypes = userRole === 'clinic'
    ? [{ icon: '🌐', titleKey: 'onboarding.rankings.global', descKey: 'onboarding.rankings.globalDesc' }, { icon: '🏳️', titleKey: 'onboarding.rankings.national', descKey: 'onboarding.rankings.nationalDesc' }, { icon: '📍', titleKey: 'onboarding.rankings.regional', descKey: 'onboarding.rankings.regionalDesc' }]
    : [{ icon: '🌐', titleKey: 'onboarding.rankings.global', descKey: 'onboarding.rankings.globalDesc' }, { icon: '🏳️', titleKey: 'onboarding.rankings.national', descKey: 'onboarding.rankings.nationalDesc' }, { icon: '🏢', titleKey: 'onboarding.rankings.clinic', descKey: 'onboarding.rankings.clinicDesc' }];

  const sectionTitle = "text-[13px] font-bold text-center text-foreground mt-4 mb-2";

  return (
    <div className="h-full w-full overflow-y-auto px-4 pb-4 pt-2">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Title */}
        <h2 className="w-full text-[16px] font-bold text-center text-gaming-gold mb-3 px-12">
<Glyph emoji="🏆" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{t('onboarding.rankingsTitle')}
        </h2>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-1 w-full max-w-[280px] items-end mb-2">
          {/* 2º */}
          <div className="flex flex-col items-center">
            <Glyph emoji="🥈" className="w-6 h-6 mb-1" />
            <div className="w-full h-14 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#C0C0C0' }}>
              <span className="text-base font-bold text-black">2º</span>
            </div>
          </div>
          {/* 1º */}
          <div className="flex flex-col items-center">
            <Glyph emoji="🥇" className="w-7 h-7 mb-1" />
            <div className="w-full h-20 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#FFD700' }}>
              <span className="text-lg font-bold text-black">1º</span>
            </div>
          </div>
          {/* 3º */}
          <div className="flex flex-col items-center">
            <Glyph emoji="🥉" className="w-6 h-6 mb-1" />
            <div className="w-full h-10 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#CD7F32' }}>
              <span className="text-base font-bold text-black">3º</span>
            </div>
          </div>
        </div>

        {/* Ranking Types */}
        <h3 className={sectionTitle}>{t('onboarding.rankingsTypes')}</h3>
        <div className="grid grid-cols-3 gap-2 w-full">
          {rankingTypes.map((type, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center" style={{ padding: '12px 4px' }}>
              <Glyph emoji={type.icon} className="w-6 h-6" />
              <p className="text-[12px] font-bold text-foreground mt-1">{t(type.titleKey)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t(type.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Monthly Prizes */}
        <h3 className={sectionTitle}>{t('onboarding.monthlyPrizes')}</h3>
        <div className="grid grid-cols-3 gap-2 w-full items-stretch">
          {/* 2º */}
          <div className="rounded-xl border flex flex-col items-center justify-center text-center p-2" style={{ backgroundColor: '#C0C0C015', borderColor: '#C0C0C040' }}>
            <span className="text-[14px] font-bold" style={{ color: '#C0C0C0' }}>2º</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{t('onboarding.rankings.prize2')}</p>
          </div>
          {/* 1º */}
          <div className="rounded-xl border-2 flex flex-col items-center justify-center text-center p-2" style={{ backgroundColor: '#FFD70015', borderColor: '#2196F3' }}>
            <span className="text-[14px] font-bold" style={{ color: '#FFD700' }}>1º</span>
            <p className="text-[11px] text-foreground mt-1 leading-tight font-semibold">{t('onboarding.rankings.prize1')}</p>
          </div>
          {/* 3º */}
          <div className="rounded-xl border flex flex-col items-center justify-center text-center p-2" style={{ backgroundColor: '#CD7F3215', borderColor: '#CD7F3240' }}>
            <span className="text-[14px] font-bold" style={{ color: '#CD7F32' }}>3º</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{t('onboarding.rankings.prize3')}</p>
          </div>
        </div>

        {/* Annual Highlights */}
        <h3 className={sectionTitle}>{t('onboarding.annualHighlights')}</h3>
        <div className="w-full flex flex-col gap-2">
          <div className="rounded-xl border border-white/20 flex items-center gap-3" style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
            <Glyph emoji="🌍" className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-foreground text-[13px]">{t('onboarding.rankings.annualGlobal')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('onboarding.rankings.annualGlobalPrize')}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/20 flex items-center gap-3" style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)' }}>
            <Glyph emoji="🏆" className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-foreground text-[13px]">{t('onboarding.rankings.annualNational')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t('onboarding.rankings.annualNationalPrize')}</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="w-full rounded-[10px] text-center mt-4" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', padding: '12px 16px' }}>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('onboarding.rankingsUpdate')}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
            {t('onboarding.rankingsTiebreak')}
          </p>
        </div>
      </div>
    </div>
  );
};