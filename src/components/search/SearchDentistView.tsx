import { useState, useMemo } from 'react';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { DentistFilters } from './DentistFilters';
import { DentistCard } from './DentistCard';
import { DentistProfileModal } from './DentistProfileModal';
import { MOCK_DENTIST_RESULTS, DentistSearchResult } from '@/data/mockDentistSearch';
import smileCheckIcon from '@/assets/smilecheck-icon.png';

interface SearchDentistViewProps {
  onBack: () => void;
}

export function SearchDentistView({ onBack }: SearchDentistViewProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const [distance, setDistance] = useState(0);
  const [availability, setAvailability] = useState('Qualquer Dia');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(null);

  const filteredDentists = useMemo(() => {
    let results = [...MOCK_DENTIST_RESULTS];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Specialty filter
    if (specialty && specialty !== 'Todas') {
      results = results.filter((d) =>
        d.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    // Distance filter
    if (distance > 0) {
      results = results.filter((d) => d.distance <= distance);
    }

    // Sort
    switch (sortBy) {
      case 'distance':
        results.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        results.sort((a, b) => a.teleconsultaPrice - b.teleconsultaPrice);
        break;
      case 'recommended':
      default:
        // Priority: previous patient > distance > plan
        const planOrder = { premium: 0, pro: 1, free: 2 };
        results.sort((a, b) => {
          if (a.previousPatient !== b.previousPatient) return a.previousPatient ? -1 : 1;
          if (a.distance !== b.distance) return a.distance - b.distance;
          return planOrder[a.plan] - planOrder[b.plan];
        });
        break;
    }

    return results;
  }, [searchQuery, specialty, distance, sortBy]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src={smileCheckIcon}
          alt=""
          className="w-[60vw] max-w-[500px] opacity-[0.05]"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Dentistas Disponíveis
              </h1>
              <p className="text-xs text-muted-foreground">Baseado na sua triagem</p>
            </div>
          </div>

          <DentistFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            specialty={specialty}
            onSpecialtyChange={setSpecialty}
            distance={distance}
            onDistanceChange={setDistance}
            availability={availability}
            onAvailabilityChange={setAvailability}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto p-4 md:p-6 pb-28">
          <p className="text-xs text-muted-foreground mb-4">
            {filteredDentists.length} dentista{filteredDentists.length !== 1 ? 's' : ''} encontrado{filteredDentists.length !== 1 ? 's' : ''}
          </p>

          {filteredDentists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Stethoscope className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum dentista encontrado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div
              className={cn(
                'gap-4',
                isMobile
                  ? 'flex flex-col'
                  : 'grid grid-cols-2 lg:grid-cols-3'
              )}
            >
              {filteredDentists.map((dentist) => (
                <DentistCard
                  key={dentist.id}
                  dentist={dentist}
                  onViewProfile={setSelectedDentist}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Profile Modal */}
      {selectedDentist && (
        <DentistProfileModal
          dentist={selectedDentist}
          onClose={() => setSelectedDentist(null)}
        />
      )}
    </div>
  );
}
