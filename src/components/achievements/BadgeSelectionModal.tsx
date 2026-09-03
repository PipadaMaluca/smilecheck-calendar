import { useState, useMemo } from 'react';
import { Check, Lock, Trophy, Plus } from 'lucide-react';
import { Glyph } from '@/components/ui/glyph';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Achievement, AchievementCategory, getBadgeTier, BADGE_TIER_STYLES } from './achievementData';
import { toast } from 'sonner';

interface BadgeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: AchievementCategory[];
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

export function BadgeSelectionModal({ open, onOpenChange, categories, selectedIds, onSave }: BadgeSelectionModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const handleOpenChange = (o: boolean) => {
    if (o) setSelected(selectedIds);
    onOpenChange(o);
  };

  const allAchievements = useMemo(() => categories.flatMap(c => c.achievements), [categories]);

  const toggle = (id: string) => {
    const ach = allAchievements.find(a => a.id === id);
    if (!ach?.unlocked) return;
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(x => x !== id));
    } else {
      if (selected.length >= 8) {
        toast.info(t('achievementData.removeFirst'));
        return;
      }
      setSelected(prev => [...prev, id]);
    }
  };

  const selectedAchievements = selected.map(id => allAchievements.find(a => a.id === id)).filter(Boolean) as Achievement[];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn('max-h-[90vh] flex flex-col', isMobile ? 'max-w-[95vw]' : 'max-w-2xl')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {t('achievementData.chooseShowcase')}
          </DialogTitle>
          <DialogDescription>{t('achievementData.selectUpTo8')}</DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/30 rounded-xl p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{t('common.preview')}</span>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', selected.length === 8 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
              {selected.length}/8 {t('common.selected')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => {
              const ach = selectedAchievements[i];
              return (
                <div key={i} className={cn('aspect-square rounded-xl flex items-center justify-center transition-colors',
                  ach ? 'bg-gradient-to-br ' + BADGE_TIER_STYLES[getBadgeTier(ach)].bgGradient + ' border ' + BADGE_TIER_STYLES[getBadgeTier(ach)].borderColor : 'border-2 border-dashed border-border/50')}>
                  {ach ? <Glyph emoji={ach.emoji} fallback={Trophy} className="w-5 h-5" /> : <Plus className="w-4 h-4 text-muted-foreground/40" />}
                </div>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[40vh]">
          <div className="space-y-4 pr-2">
            {categories.map(cat => {
              const hasUnlocked = cat.achievements.some(a => a.unlocked);
              if (!hasUnlocked && cat.achievements.every(a => a.secret)) return null;
              return (
                <div key={cat.title}>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">{cat.title}</h4>
                  <div className={cn('grid gap-2', isMobile ? 'grid-cols-2' : 'grid-cols-3')}>
                    {cat.achievements.map(ach => {
                      const isSelected = selected.includes(ach.id);
                      const isLocked = !ach.unlocked;
                      const tier = getBadgeTier(ach);
                      const tierStyle = BADGE_TIER_STYLES[tier];
                      return (
                        <button key={ach.id} onClick={() => toggle(ach.id)} disabled={isLocked}
                          className={cn('relative flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                            isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary/30' : isLocked ? 'border-border/30 opacity-40 cursor-not-allowed' : 'border-border hover:border-primary/40 hover:bg-secondary/50')}>
                          {isSelected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                          {isLocked && <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center"><Lock className="w-2.5 h-2.5 text-muted-foreground" /></div>}
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg border flex-shrink-0 bg-gradient-to-br', tierStyle.bgGradient, tierStyle.borderColor)}>
                            <Glyph emoji={ach.secret && !ach.unlocked ? '❓' : ach.emoji} fallback={Trophy} className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{ach.secret && !ach.unlocked ? '???' : ach.name}</p>
                            <p className="text-[11px] text-warning">+{ach.points} pts</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => { onSave(selected); handleOpenChange(false); toast.success(t('achievementData.showcaseUpdated')); }}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
