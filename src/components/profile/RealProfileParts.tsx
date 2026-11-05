import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedReviewBadge } from '@/components/feedback/VerifiedReviewBadge';
import { useFavorites } from '@/data/favoritesSource';
import { useReviews } from '@/data/publicProfiles';
import { formatDate, formatDecimal1 } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/** Verified reviews of a real dentist/clinic: average + count only from 3 reviews on. */
export function RealReviewsSection({ dentistId, clinicId }: { dentistId?: string; clinicId?: string }) {
  const { t } = useTranslation();
  const r = useReviews({ dentistId, clinicId }, true);
  return (
    <section className="space-y-3" data-testid="real-reviews">
      <h3 className="text-sm font-semibold text-foreground">{t('sweep.dentistProfile.recentReviews')}</h3>
      {r.loading ? (
        <Skeleton className="h-16 w-full" />
      ) : r.average === null ? (
        <p className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">{t('publicProfile.notEnoughReviews')}</p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-warning" aria-hidden />
            <span className="text-2xl font-bold text-foreground tabular-nums">{formatDecimal1(r.average)}</span>
            <span className="text-xs text-muted-foreground">{t('profile.reviews', { count: r.count })}</span>
          </div>
          <div className="space-y-2">
            {r.reviews.slice(0, 5).map((rv) => (
              <div key={rv.id} className="bg-secondary rounded-lg p-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{rv.author}</span>
                    <VerifiedReviewBadge />
                  </div>
                  <div className="flex gap-0.5" aria-label={t('publicProfile.starsLabel', { count: rv.rating })}>
                    {Array.from({ length: rv.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-warning" aria-hidden />)}
                  </div>
                </div>
                {rv.comment && <p className="text-xs text-muted-foreground">{rv.comment}</p>}
                <p className="text-2xs text-muted-foreground mt-1">{formatDate(rv.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/** Real favourite toggle (only renders for real accounts). */
export function RealFavoriteButton({ kind, id, className }: { kind: 'dentist' | 'clinic'; id: string; className?: string }) {
  const { t } = useTranslation();
  const fav = useFavorites();
  if (fav.isDemo) return null;
  const on = fav.isFavorite(kind, id);
  return (
    <Button
      type="button" variant="ghost" size="icon"
      aria-pressed={on}
      aria-label={on ? t('publicProfile.removeFavorite') : t('publicProfile.addFavorite')}
      onClick={(e) => { e.stopPropagation(); void fav.toggle(kind, id); }}
      className={className}
    >
      <Star className={cn('w-5 h-5', on ? 'fill-amber-400 text-warning' : 'text-muted-foreground')} />
    </Button>
  );
}
