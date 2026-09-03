import { cn } from '@/lib/utils';
import { HelpCircle, Trophy } from 'lucide-react';
import { Glyph } from '@/components/ui/glyph';
import { Achievement, getBadgeTier, BADGE_TIER_STYLES } from './achievementData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeFrameProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BadgeFrame({ achievement, size = 'md', showName = false, onClick, className }: BadgeFrameProps) {
  const tier = getBadgeTier(achievement);
  const style = BADGE_TIER_STYLES[tier];
  const isSecret = achievement.secret && achievement.unlocked;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const badge = (
    <div
      className={cn(
        'flex flex-col items-center gap-1 group cursor-pointer press',
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        'relative flex items-center justify-center rounded-xl border-2 transition-[transform,background-color,border-color,color,box-shadow] duration-300',
        'bg-gradient-to-br',
        style.bgGradient,
        style.borderColor,
        sizeClasses[size],
        'hover:scale-110',
        // Glow effect
        tier === 'legendary' && 'animate-pulse shadow-lg',
        tier === 'expert' && 'shadow-md',
        tier !== 'legendary' && tier !== 'expert' && 'shadow-sm',
        style.glowColor,
      )}>
        {/* Decorative wings/stars for higher tiers */}
        {(tier === 'expert' || tier === 'legendary') && size !== 'sm' && (
          <>
            <Glyph emoji="⭐" className="w-5 h-5 absolute -top-1 -right-1 text-[11px]" />
            {tier === 'legendary' && <Glyph emoji="⭐" className="w-5 h-5 absolute -top-1 -left-1 text-[11px]" />}
          </>
        )}

        {/* Shine sweep for gold+ */}
        {(tier === 'expert' || tier === 'legendary') && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Icon */}
        {!isSecret && achievement.secret ? (
          <HelpCircle className={cn(
            'text-success/60',
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
          )} />
        ) : (
          <Glyph
            emoji={achievement.emoji}
            fallback={Trophy}
            className={cn(
              'relative z-10',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
            )}
          />
        )}

      </div>

      {showName && (
        <span className="text-[11px] text-muted-foreground text-center max-w-20 leading-snug whitespace-normal break-words">
          {achievement.secret && !achievement.unlocked ? '???' : achievement.name}
        </span>
      )}
    </div>
  );

  // Wrap in tooltip for non-sm sizes
  if (size !== 'sm') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-48">
          <p className="font-semibold text-xs">{achievement.secret && !achievement.unlocked ? '???' : achievement.name}</p>
          <p className="text-[11px] text-muted-foreground">{achievement.secret && !achievement.unlocked ? 'Conquista secreta' : achievement.description}</p>
          <p className="text-[11px] font-medium text-warning mt-0.5">+{achievement.points} pts</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
