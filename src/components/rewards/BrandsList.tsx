import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Brand, RewardProduct } from '@/data/rewardsData';

interface BrandsListProps {
  brands: Brand[];
  userPoints: number;
  onRedeem: (product: RewardProduct) => void;
}

export function BrandsList({ brands, userPoints, onRedeem }: BrandsListProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  if (selectedBrand) {
    const sorted = [...selectedBrand.products].sort((a, b) => a.points - b.points);
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedBrand(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {selectedBrand.name}
        </Button>
        <div className="space-y-2">
          {sorted.map(product => {
            const canAfford = userPoints >= product.points;
            const missing = product.points - userPoints;
            return (
              <Card key={product.id} className={cn('transition-all', !canAfford && 'opacity-60')}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl shrink-0">
                    {product.emoji || '🎁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold shrink-0">
                    {product.points.toLocaleString()} pts
                  </Badge>
                  <Button
                    size="sm"
                    className="text-xs shrink-0"
                    disabled={!canAfford}
                    onClick={() => onRedeem(product)}
                  >
                    {canAfford ? 'Resgatar' : `−${missing.toLocaleString()}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {brands.map(brand => (
        <Card
          key={brand.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setSelectedBrand(brand)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {brand.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{brand.name}</p>
              <p className="text-xs text-muted-foreground">{brand.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
