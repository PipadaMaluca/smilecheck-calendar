import { Star, Sparkles } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface SlideRatingProps { isActive: boolean; userRole: UserRole; }

export const SlideRating = ({ isActive, userRole }: SlideRatingProps) => {
  const { t } = useTranslation();
  const isClinic = userRole === 'clinic';

  const ratingLegend = [
    { stars: '1-2★', labelKey: 'onboarding.ratingProblematic', color: '#F44336' },
    { stars: '3★', labelKey: 'onboarding.ratingAttention', color: '#FF9800' },
    { stars: '4-5★', labelKey: 'onboarding.ratingGood', color: '#4CAF50' },
    { stars: '5★', labelKey: 'onboarding.ratingSpecial', color: '#FFD700', special: true },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <h2 className="font-gaming text-2xl md:text-3xl text-gaming-gold mb-8 flex items-center gap-2">
        {isClinic ? t('onboarding.ratingTitleClinic') : t('onboarding.ratingTitleYou')}
      </h2>

      <div className={`glass-card-strong p-8 mb-8 glow-green ${isActive ? 'animate-pulse-glow' : ''}`}>
        <div className="flex items-center gap-3">
          <Star className="w-10 h-10 text-gaming-gold fill-current" style={{ color: 'hsl(45, 100%, 50%)' }} />
          <span className="font-gaming text-5xl" style={{ color: '#4CAF50' }}>4.7</span>
        </div>
        <div className="flex gap-1 mt-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-current' : 'opacity-50'}`} style={{ color: 'hsl(45, 100%, 50%)' }} />
          ))}
        </div>
      </div>

      <div className="glass-card p-5 w-full max-w-sm space-y-3">
        <p className="text-muted-foreground text-sm text-center mb-4">{t('onboarding.ratingLegend')}</p>
        {ratingLegend.map((item, index) => (
          <div key={index}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.special ? 'border' : 'bg-secondary/30'}`}
            style={item.special ? { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.4)', boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)' } : {}}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: item.special ? `0 0 8px ${item.color}` : 'none' }} />
            <span className="text-sm" style={{ color: item.color }}>{item.stars}</span>
            <span className="font-medium ml-auto flex items-center" style={{ color: item.color }}>
              {t(item.labelKey)}
              {item.special && <Sparkles className="inline-block w-4 h-4 ml-1 animate-sparkle" style={{ color: item.color }} />}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-muted-foreground text-center text-sm max-w-xs">
        {isClinic ? t('onboarding.ratingBottomClinic') : t('onboarding.ratingBottomYou')}{' '}
        <span className="text-gaming-diamond font-semibold underline">{isClinic ? t('onboarding.ratingPriorityClinic') : t('onboarding.ratingPriority')}</span>{' '}
        {t('onboarding.ratingInSearches')}
      </p>
    </div>
  );
};