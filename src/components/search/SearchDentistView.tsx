import { formatCurrency } from '@/lib/formatters';
import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfessionalSearch, mapAvailability, isRealResult } from '@/data/searchSource';
import { Input } from '@/components/ui/input';
import { chequesForClinic } from '@/lib/cheques';
import { ArrowLeft, Stethoscope, SlidersHorizontal, X, List, Map as MapIcon, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getDentistInitials } from '@/lib/avatarUtils';

// Leaflet is only downloaded when the user switches to the map view.
const DentistMapView = lazy(() => import('./DentistMapView'));
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { DentistFilters } from './DentistFilters';
import { DentistCard } from './DentistCard';
import { DentistProfileModal } from './DentistProfileModal';
import { MOCK_DENTIST_RESULTS, DentistSearchResult } from '@/data/mockDentistSearch';
import smileCheckIcon from '@/assets/smilecheck-icon.webp';
import { TriageData } from '@/types/triage';
import { useTranslation } from 'react-i18next';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { CardGridSkeleton } from '@/components/skeletons';

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isLoading = useSimulatedLoading(800, 'search-dentists');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const [distance, setDistance] = useState(0);
  const [availability, setAvailability] = useState('any');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDentist, setSelectedDentist] = useState<DentistSearchResult | null>(null);
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(false);
  const [chequeDentista, setChequeDentista] = useState(false);
  const [chequeProtese, setChequeProtese] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const { demoMode } = useAuth();
  const isReal = !demoMode;
  const [cityOrPostal, setCityOrPostal] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!isReal || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords(null),
      { maximumAge: 600000, timeout: 8000 },
    );
  }, [isReal]);
  const real = useProfessionalSearch({
    q: searchQuery,
    kind: 'dentist',
    specialty: specialty !== 'Todas' ? specialty : null,
    cityOrPostal,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    maxKm: distance > 0 ? distance : null,
    language: selectedLanguages[0] ?? null,
    available: mapAvailability(availability),
    sort: sortBy === 'name' || !coords ? 'name' : 'distance',
  }, isReal);

  const SYMPTOM_KEY_MAP: Record<string, string> = {
    dor_dente: 'triage.symptoms.toothache', sensibilidade: 'triage.symptoms.sensitivity',
    sangramento: 'triage.symptoms.bleedingGums', mau_halito: 'triage.symptoms.badBreath',
    inchaco: 'triage.symptoms.swelling', dente_abanar: 'triage.symptoms.looseToothLabel',
    dente_partido: 'triage.symptoms.brokenTooth', manchas: 'triage.symptoms.stains',
    outro: 'triage.symptoms.other',
  };

  const triageSummary = triageData
    ? triageData.symptoms.map(id => SYMPTOM_KEY_MAP[id] ? t(SYMPTOM_KEY_MAP[id]) : id).filter(Boolean).join(', ')
    : null;

  const mockDentists = useMemo(() => {
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
    if (chequeDentista) results = results.filter(d => d.clinics.some(c => chequesForClinic(c.id).dentista));
    if (chequeProtese) results = results.filter(d => d.clinics.some(c => chequesForClinic(c.id).protese));
    // Neutral order only (P2B): distance, then price. Never by rating, level or plan; no paid highlight.
    results.sort((a, b) => a.distance - b.distance);
    if (sortBy === 'price') results.sort((a, b) => a.teleconsultaPrice - b.teleconsultaPrice || a.distance - b.distance);
    return results;
  }, [searchQuery, specialty, distance, sortBy, maxPrice, acceptsNewPatients, selectedLanguages, chequeDentista, chequeProtese]);
  const filteredDentists = isReal ? real.items : mockDentists;
  const resultCount = isReal ? real.total : mockDentists.length;
  const mapDentists = filteredDentists.filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng));
  // Cheque filters only make sense when the search covers clinics in Portugal.
  const searchIncludesPortugal = !isReal && MOCK_DENTIST_RESULTS.some(d => d.clinics.some(c => chequesForClinic(c.id).country === 'PT'));

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => isReal ? (prev.includes(code) ? [] : [code]) : prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  };

  const renderAdvancedFilters = () => (
    <div className="space-y-4">
      {isReal && (
        <>
          <div className="space-y-2">
            <label htmlFor="search-city" className="text-sm">{t('search.real.cityOrPostal')}</label>
            <Input id="search-city" value={cityOrPostal} onChange={(e) => setCityOrPostal(e.target.value)} placeholder={t('search.real.cityOrPostal')} className="h-11" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">{t('search.real.teleconsultFilter')}</span>
            <span className="flex items-center gap-2">
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">{t('common.soon')}</span>
              <Switch aria-label={`${t('search.real.teleconsultFilter')} — ${t('common.soon')}`} checked={false} disabled />
            </span>
          </div>
        </>
      )}
      {!isReal && (<>
      <div className="flex items-center justify-between">
        <span className="text-sm">{t('search.acceptsNew')}</span>
        <Switch aria-label={t('search.acceptsNew')} checked={acceptsNewPatients} onCheckedChange={setAcceptsNewPatients} />
      </div>
      {searchIncludesPortugal && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('cheques.filterDentista')}</span>
            <Switch aria-label={t('cheques.filterDentista')} checked={chequeDentista} onCheckedChange={setChequeDentista} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('cheques.filterProtese')}</span>
            <Switch aria-label={t('cheques.filterProtese')} checked={chequeProtese} onCheckedChange={setChequeProtese} />
          </div>
        </>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('search.maxTeleconsultPrice')}</span>
          <span className="text-sm font-medium text-primary">{formatCurrency(maxPrice)}</span>
        </div>
        <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} min={5} max={50} step={5} />
      </div>
      </>)}
      <div className="space-y-2">
        <span className="text-sm">{t('search.languages')}</span>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <Button
              key={lang.code}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={selectedLanguages.includes(lang.code)}
              onClick={() => toggleLanguage(lang.code)}
              className={cn(
                'flex items-center gap-1.5 h-auto px-2.5 py-1.5 rounded-full text-xs font-medium tap-target',
                selectedLanguages.includes(lang.code)
                  ? 'bg-primary-solid text-primary-foreground hover:bg-primary-solid/90 border-primary hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground border-border hover:bg-accent'
              )}
            >
              <span>{lang.flag}</span>
              <span>{t(`i18nB.language_${lang.code}`)}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={smileCheckIcon} alt="" className="w-[60vw] max-w-[500px] opacity-[0.025]" />
      </div>
      <div className="relative z-10 p-4 md:p-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Button aria-label={t('a11y.back')} type="button" variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                {t('search.availableDentists')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('search.basedOnTriage')}{triageSummary ? ` — ${triageSummary}` : ''}
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
            sortOptions={isReal ? [{ labelKey: 'search.sort.distance', value: 'distance' }, { labelKey: 'search.real.sortName', value: 'name' }] : undefined}
          />
          <div role="tablist" aria-label={t('search.viewModeLabel')} className="mt-3 inline-flex rounded-lg border border-border bg-secondary p-1">
            {([
              { key: 'list', icon: List, label: t('search.viewList') },
              { key: 'map', icon: MapIcon, label: t('search.viewMap') },
            ] as const).map(opt => (
              <Button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={viewMode === opt.key}
                variant={viewMode === opt.key ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 min-h-11 px-4"
                onClick={() => setViewMode(opt.key)}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {viewMode === 'map' ? (
        <div className="flex-1 flex min-h-0 relative z-10">
          {!isMobile && (
            <div className="w-80 shrink-0 border-r border-border flex flex-col min-h-0">
              <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
                <p className="text-xs text-muted-foreground">{t('search.dentistsFound', { count: resultCount })}</p>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs min-h-11" onClick={() => setShowMobileFilters(true)}>
                  <SlidersHorizontal className="w-3.5 h-3.5" /> {t('search.filterTitle')}
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <ul className="p-2 space-y-1">
                  {filteredDentists.map(d => (
                    <li key={d.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-pressed={focusedId === d.id}
                        onClick={() => setFocusedId(d.id)}
                        className={cn('w-full h-auto min-h-11 justify-start gap-3 p-2 font-normal', focusedId === d.id && 'bg-accent')}
                      >
                        <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary shrink-0">{getDentistInitials(d.name)}</span>
                        <span className="flex-1 min-w-0 text-left">
                          <span className="block text-sm font-medium truncate">{d.name}</span>
                          <span className="block text-xs text-muted-foreground truncate">{d.specialties.join(', ')}</span>
                        </span>
                        {!isRealResult(d) && <span className="flex items-center gap-1 text-xs shrink-0"><Star className="w-3.5 h-3.5 fill-amber-400 text-warning" />{d.rating}</span>}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            {isMobile && (
              <Button variant="outline" size="sm" className="absolute top-3 right-3 z-20 gap-1.5 text-xs min-h-11 bg-card" onClick={() => setShowMobileFilters(true)}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> {t('search.filterTitle')} ({resultCount})
              </Button>
            )}
            <Suspense fallback={<Skeleton className="h-full w-full rounded-none" />}>
              <DentistMapView dentists={mapDentists} onViewProfile={setSelectedDentist} focusedId={focusedId} />
            </Suspense>
          </div>
        </div>
      ) : (
      <div className="flex-1 flex overflow-hidden relative z-10">
        {!isMobile && (
          <div className="w-64 border-r border-border p-4 overflow-y-auto shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">{t('search.advancedFilters')}</h3>
            {renderAdvancedFilters()}
          </div>
        )}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6 pb-28">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                {t('search.dentistsFound', { count: resultCount })}
              </p>
              {isMobile && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowMobileFilters(true)}>
                  <SlidersHorizontal className="w-3.5 h-3.5" /> {t('search.filterTitle')}
                </Button>
              )}
            </div>
            {(isReal ? real.loading && filteredDentists.length === 0 : isLoading) ? (
              <CardGridSkeleton cards={isMobile ? 3 : 6} columns={isMobile ? 'grid-cols-1' : 'grid-cols-2'} />
            ) : isReal && real.error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <p className="text-sm text-muted-foreground max-w-xs">{t('search.real.loadError')}</p>
                <Button variant="outline" onClick={() => real.retry()}>{t('common.retry', { defaultValue: t('search.applyFilters') })}</Button>
              </div>
            ) : filteredDentists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-base font-bold text-foreground mb-1">{t('emptyStates.searchTitle')}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{t('emptyStates.searchDesc')}</p>
              </div>
            ) : (
              <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'grid grid-cols-2 items-stretch')}>
                {filteredDentists.map(dentist => (
                  <DentistCard
                    key={dentist.id}
                    dentist={dentist}
                    onViewProfile={setSelectedDentist}
                    onQuickBook={onQuickBook ? (d, day, slot) => onQuickBook(d, day, slot) : undefined}
                  />
                ))}
              </div>
            )}
            {isReal && real.hasMore && filteredDentists.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={real.loadMore} disabled={real.loading}>{t('search.real.loadMore')}</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      )}
      {showMobileFilters && (isMobile || viewMode === 'map') && (
        <>
          <div className="fixed inset-0 scrim z-modal" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-6 z-modal space-y-4 max-h-[70vh] overflow-y-auto md:left-auto md:right-6 md:bottom-6 md:w-96 md:rounded-2xl md:border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{t('search.advancedFilters')}</h3>
              <Button aria-label={t('a11y.close')} variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {renderAdvancedFilters()}
            <Button className="w-full" onClick={() => setShowMobileFilters(false)}>{t('search.applyFilters')}</Button>
          </div>
        </>
      )}
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
