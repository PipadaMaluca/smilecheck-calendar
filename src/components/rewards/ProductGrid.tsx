import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RewardProduct } from '@/data/rewardsData';

interface ProductGridProps {
  products: RewardProduct[];
  userPoints: number;
  onRedeem: (product: RewardProduct) => void;
  groupBySubcategory?: boolean;
}

export function ProductGrid({ products, userPoints, onRedeem, groupBySubcategory = false }: ProductGridProps) {
  if (groupBySubcategory) {
    const groups: Record<string, RewardProduct[]> = {};
    products.forEach(p => {
      const key = p.subcategory || 'Geral';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    return (
      <div className="space-y-6">
        {Object.entries(groups).map(([subcategory, items]) => (
          <div key={subcategory}>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{subcategory}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(product => (
                <ProductCard key={product.id} product={product} userPoints={userPoints} onRedeem={onRedeem} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map(product => (
        <ProductCard key={product.id} product={product} userPoints={userPoints} onRedeem={onRedeem} />
      ))}
    </div>
  );
}

function ProductCard({ product, userPoints, onRedeem }: { product: RewardProduct; userPoints: number; onRedeem: (p: RewardProduct) => void }) {
  const canAfford = userPoints >= product.points;
  const missing = product.points - userPoints;

  return (
    <Card className={cn('transition-all duration-200', !canAfford && 'opacity-60')}>
      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
          canAfford ? 'bg-primary/20' : 'bg-secondary'
        )}>
          {product.emoji || '🎁'}
        </div>
        <h4 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h4>
        {product.discount && (
          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
            {product.discount} desconto
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs font-bold">
          {product.points.toLocaleString()} pts
        </Badge>
        <Button
          size="sm"
          className="w-full text-xs mt-1"
          disabled={!canAfford}
          onClick={() => onRedeem(product)}
        >
          {canAfford ? 'Resgatar' : `Faltam ${missing.toLocaleString()} pts`}
        </Button>
      </CardContent>
    </Card>
  );
}
