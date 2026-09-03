import { cn } from '@/lib/utils';
import { Achievement, getBadgeTier, BADGE_TIER_STYLES, DEFAULT_SHOWCASED } from './achievementData';
import { Glyph } from '@/components/ui/glyph';
import { Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MiniBadgesProps {
  achievements: Achievement[];
  maxVisible?: number;
  className?: string;
}

export function MiniBadges({ achievements, maxVisible = 3, className }: MiniBadgesProps) {
  if (achievements.length === 0) return null;

  const visible = achievements.slice(0, maxVisible);
  const remaining = achievements.length - maxVisible;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {visible.map(ach => {
        const tier = getBadgeTier(ach);
        const style = BADGE_TIER_STYLES[tier];
        return (
          <Tooltip key={ach.id}>
            <TooltipTrigger asChild>
              <div className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center text-xs border bg-gradient-to-br cursor-default',
                style.bgGradient,
                style.borderColor,
              )}>
                <Glyph emoji={ach.emoji} fallback={Trophy} className="w-3.5 h-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              <p className="font-medium">{ach.name}</p>
              <p className="text-warning">+{ach.points} pts</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
      {remaining > 0 && (
        <span className="text-[11px] text-muted-foreground font-medium ml-0.5">+{remaining}</span>
      )}
    </div>
  );
}

// Helper: get showcased achievements for a role from flat list
export function getShowcasedAchievements(
  allAchievements: Achievement[],
  role: string,
  maxVisible?: number
): Achievement[] {
  const ids = DEFAULT_SHOWCASED[role] || [];
  const result = ids
    .map(id => allAchievements.find(a => a.id === id))
    .filter((a): a is Achievement => !!a && a.unlocked);
  return maxVisible ? result.slice(0, maxVisible) : result;
}
