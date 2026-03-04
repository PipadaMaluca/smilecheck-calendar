import { useState, useMemo } from 'react';
import { ArrowLeft, Stethoscope, SlidersHorizontal, X, Flag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { DentistFilters } from './DentistFilters';
import { DentistCard } from './DentistCard';
import { DentistProfileModal } from './DentistProfileModal';
import { MOCK_DENTIST_RESULTS, DentistSearchResult, getAvailabilityForDentist } from '@/data/mockDentistSearch';
import smileCheckIcon from '@/assets/smilecheck-icon.png';
import { TriageData, TRIAGE_SYMPTOMS } from '@/types/triage';

interface SearchDentistViewProps {
  onBack: () => void;
  onGoHome?: () => void;
  triageData?: TriageData;
  onQuickBook?: (dentist: DentistSearchResult, dayLabel: string, slot: string) => void;
}

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function SearchDentistView({ onBack, onGoHome, triageData, onQuickBook }: SearchDentistViewProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const [distance, setDistance] = useState(0);
  const [availability, setAvailability] = useState('Qualquer Dia');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(null);
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const triageSummary = triageData
    ? triageData.symptoms.map(id => TRIAGE_SYMPTOMS.find(s => s.id === id)?.label).filter(Boolean).join(', ')
    : null;

  const filteredDentists = useMemo(() => {
    let results = [...MOCK_DENTIST_RESULTS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) || d.specialties.some(s => s.toLowerCase().includes(q))
      );
    }

    if (specialty && specialty !== 'Todas') {
      results = results.filter(d => d.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase())));
    }

    if (distance > 0) {
      results = results.filter(d => d.distance <= distance);
    }

    if (maxPrice < 50) {
      results = results.filter(d => d.teleconsultaPrice <= maxPrice);
    }

    // Sort: Premium first, then Pro, then Free. Within each group, by distance then availability.
    const planOrder = { premium: 0, pro: 1, free: 2 };
    results.sort((a, b) => {
      const pa = planOrder[a.plan];
      const pb = planOrder[b.plan];
      if (pa !== pb) return pa - pb;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return 0;
    });

    // Override with selected sort
    if (sortBy === 'distance') results.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price') results.sort((a, b) => a.teleconsultaPrice - b.teleconsultaPrice);

    return results;
  }, [searchQuery, specialty, distance, sortBy, maxPrice, acceptsNewPatients, selectedLanguages]);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  };

  const renderAdvancedFilters = () => (
    <div className="space-y-4">
      {/* Accept new patients */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Aceita novos pacientes</span>
        <Switch checked={acceptsNewPatients} onCheckedChange={setAcceptsNewPatients} />
      </div>

      {/* Max teleconsulta price */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Preço máx. teleconsulta</span>
          <span className="text-sm font-medium text-primary">€{maxPrice}</span>
        </div>
        <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} min={5} max={50} step={5} />
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <span className="text-sm">Idiomas</span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedLanguages.includes(lang.code)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-muted-foreground border-border hover:bg-accent'
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={smileCheckIcon} alt="" className="w-[60vw] max-w-[500px] opacity-[0.05]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Dentistas Disponíveis
              </h1>
              <p className="text-xs text-muted-foreground">
                Baseado na sua triagem{triageSummary ? ` — ${triageSummary}` : ''}
              </p>
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

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop sidebar filters */}
        {!isMobile && (
          <div className="w-64 border-r border-border p-4 overflow-y-auto shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Filtros Avançados</h3>
            {renderAdvancedFilters()}
          </div>
        )}

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6 pb-28">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {filteredDentists.length} dentista{filteredDentists.length !== 1 ? 's' : ''} encontrado{filteredDentists.length !== 1 ? 's' : ''}
              </p>
              {isMobile && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowMobileFilters(true)}>
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
                </Button>
              )}
            </div>

            {filteredDentists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum dentista encontrado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Tente ajustar os filtros ou alargar a distância</p>
              </div>
            ) : (
              <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'grid grid-cols-2')}>
                {filteredDentists.map(dentist => (
                  <DentistCard key={dentist.id} dentist={dentist} onViewProfile={setSelectedDentist} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Filters Modal */}
      {isMobile && showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-6 z-50 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Filtros Avançados</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {renderAdvancedFilters()}
            <Button className="w-full" onClick={() => setShowMobileFilters(false)}>Aplicar Filtros</Button>
          </div>
        </>
      )}

      {/* Profile Modal */}
      {selectedDentist && (
        <DentistProfileModal
          dentist={selectedDentist}
          onClose={() => setSelectedDentist(null)}
          onGoHome={onGoHome}
        />
      )}
    </div>
  );
}
