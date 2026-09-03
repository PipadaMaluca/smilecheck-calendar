import { useTranslation } from 'react-i18next';
import { Glyph } from '@/components/ui/glyph';
import { Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RewardProduct } from '@/data/rewardsData';

interface AllProductsListProps {
  products: RewardProduct[];
  userPoints: number;
  onRedeem: (product: RewardProduct) => void;
}

function getTier(points: number): number {
  if (points < 500) return 0;
  if (points < 2000) return 1;
  return 2;
}

export function AllProductsList({ products, userPoints, onRedeem }: AllProductsListProps) {
  const { t } = useTranslation();
  let lastTier = -1;

  const tierLabels = [
    `${t('store.upTo')} 500 pts`,
    '500 — 2 000 pts',
    `${t('store.moreThan')} 2 000 pts`,
  ];

  return (
    <div className="w-full max-w-[700px] mx-auto space-y-0">
      {products.map((product, idx) => {
        const tier = getTier(product.points);
        const showSeparator = tier !== lastTier;
        lastTier = tier;
        const canAfford = userPoints >= product.points;
        const missing = product.points - userPoints;

        return (
          <div key={product.id}>
            {showSeparator && (
              <div className="flex items-center gap-3 py-3 mt-2 first:mt-0">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {tierLabels[tier]}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            <button
              type="button"
              onClick={() => canAfford && onRedeem(product)}
              disabled={!canAfford}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg p-3 mb-2 text-left transition-colors duration-150',
                'bg-card border border-border/50',
                canAfford ? 'cursor-pointer hover:bg-accent/60 hover:shadow-md hover:border-primary/30 press' : 'opacity-50 cursor-not-allowed',
              )}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl shrink-0">
                <Glyph emoji={product.emoji} fallback={Gift} className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category}
                  {product.discount && (
                    <span className="ml-2 text-warning font-medium">{product.discount} {t('store.discount')}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs font-bold whitespace-nowrap">
                  {product.points.toLocaleString()} pts
                </Badge>
                <span className={cn(
                  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap min-w-[90px] text-center',
                  canAfford ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}>
                  {canAfford ? t('store.redeemBtn') : `${t('store.missing')} ${missing.toLocaleString()}`}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
