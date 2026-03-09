import { useState } from 'react';
import { Plus, Pencil, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Achievement, AchievementCategory, getBadgeTier, BADGE_TIER_STYLES, DEFAULT_SHOWCASED } from './achievementData';
import { BadgeFrame } from './BadgeFrame';
import { BadgeSelectionModal } from './BadgeSelectionModal';
import { UserRole } from '@/types/calendar';

interface BadgeShowcaseProps {
  userRole: UserRole;
  categories: AchievementCategory[];
  isOwnProfile?: boolean;
  onViewCollection?: () => void;
  className?: string;
}

export function BadgeShowcase({ userRole, categories, isOwnProfile = false, onViewCollection, className }: BadgeShowcaseProps) {
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [showcasedIds, setShowcasedIds] = useState<string[]>(DEFAULT_SHOWCASED[userRole] || []);

  const allAchievements = categories.flatMap(c => c.achievements);
  const showcasedAchievements = showcasedIds
    .map(id => allAchievements.find(a => a.id === id))
    .filter(Boolean) as Achievement[];

  // For visitors: only show filled badges
  const displaySlots = isOwnProfile ? 8 : showcasedAchievements.length;

  if (!isOwnProfile && showcasedAchievements.length === 0) return null;

  return (
    <div className={cn('bg-card/50 border border-border rounded-xl p-5 md:p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          🏆 Conquistas em Destaque
        </h4>
        {isOwnProfile && (
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" /> Editar
          </button>
        )}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: displaySlots }).map((_, i) => {
          const ach = showcasedAchievements[i];

          if (!ach && isOwnProfile) {
            return (
              <button
                key={`empty-${i}`}
                onClick={() => setShowModal(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <Plus className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </button>
            );
          }

          if (!ach) return null;

          return (
            <div key={ach.id} className="flex justify-center">
              <BadgeFrame
                achievement={ach}
                size="md"
                showName
                onClick={isOwnProfile ? () => setShowModal(true) : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* Ver Coleção */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1.5"
        onClick={onViewCollection}
      >
        <Trophy className="w-3.5 h-3.5" /> Ver Coleção
      </Button>

      {/* Selection Modal */}
      <BadgeSelectionModal
        open={showModal}
        onOpenChange={setShowModal}
        categories={categories}
        selectedIds={showcasedIds}
        onSave={setShowcasedIds}
      />
    </div>
  );
}
