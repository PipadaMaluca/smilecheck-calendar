import { Star, User, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';

interface FavoritesViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewProfile: (dentist: DentistSearchResult) => void;
}

export function FavoritesView({ favorites, onToggleFavorite, onViewProfile }: FavoritesViewProps) {
  const isMobile = useIsMobile();
  const favoriteDentists = MOCK_DENTIST_RESULTS.filter(d => favorites.includes(d.id));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        <h2 className="text-lg font-bold text-foreground">Colegas Favoritos</h2>
        <span className="text-sm text-muted-foreground">({favoriteDentists.length})</span>
      </div>

      {favoriteDentists.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum colega favorito ainda.</p>
          <p className="text-xs mt-1">Adicione dentistas aos favoritos a partir da pesquisa ou dos perfis.</p>
        </div>
      ) : (
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
          {favoriteDentists.map(d => {
            const levelCfg = LEVEL_CONFIG[d.level];
            const initials = d.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('');
            return (
              <div key={d.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      <ClickableDentistName name={d.name} className="text-sm font-bold text-foreground" />
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{d.rating}</span>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>
                        {levelCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.specialties.join(', ')}</p>
                    {d.clinics[0] && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{d.clinics[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="flex-1 text-xs text-destructive hover:text-destructive" onClick={() => onToggleFavorite(d.id)}>
                    <X className="w-3 h-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
