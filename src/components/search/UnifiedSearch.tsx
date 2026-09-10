import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Star, User, Building2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { MOCK_DENTIST_RESULTS, DentistSearchResult } from '@/data/mockDentistSearch';
import { getDentistInitials } from '@/lib/avatarUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedSearchProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onViewDentistProfile?: (dentist: DentistSearchResult) => void;
  onViewClinicProfile?: (clinicId: string) => void;
  favorites?: string[];
  onToggleFavorite?: (dentistId: string) => void;
  inline?: boolean;
}

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Maria Silva', age: 34, lastConsultation: '15 Jan 2026', phone: '+351 912 000 002' },
  { id: 'p2', name: 'João Costa', age: 28, lastConsultation: '10 Jan 2026', phone: '+351 933 333 333' },
  { id: 'p3', name: 'Ana Ferreira', age: 51, lastConsultation: '8 Jan 2026', phone: '+351 944 444 444' },
  { id: 'p4', name: 'Carlos Santos', age: 39, lastConsultation: '5 Jan 2026', phone: '+351 955 555 555' },
  { id: 'p5', name: 'Pedro Almeida', age: 34, lastConsultation: '3 Jan 2026', phone: '+351 911 111 111' },
  { id: 'p6', name: 'Rita Oliveira', age: 45, lastConsultation: '28 Dez 2025', phone: '+351 966 666 666' },
  { id: 'p7', name: 'Sofia Lopes', age: 27, lastConsultation: '22 Dez 2025', phone: '+351 920 202 020' },
  { id: 'p8', name: 'Bruno Pereira', age: 31, lastConsultation: '20 Dez 2025', phone: '+351 910 101 010' },
];

const MOCK_CLINIC_SEARCH = [
  { id: '1', name: 'Clínica SmileCheck', address: 'Av. da Liberdade 123, Lisboa', rating: 4.9, reviewCount: 312, distance: 2.5 },
  { id: '2', name: 'Clínica Mitry-Mory', address: 'Rue de Paris 45, Mitry-Mory', rating: 4.7, reviewCount: 185, distance: 4.2 },
  { id: '3', name: 'Clínica Montfermeil', address: 'Avenue Jean Jaurès 78, Montfermeil', rating: 4.6, reviewCount: 143, distance: 6.0 },
  { id: '4', name: 'Dental Studio Lisboa', address: 'Rua Garrett 50, Lisboa', rating: 4.8, reviewCount: 256, distance: 3.1 },
  { id: '5', name: 'OralMed Cascais', address: 'Av. 25 de Abril, Cascais', rating: 4.5, reviewCount: 98, distance: 15.0 },
];

export function UnifiedSearch({ userRole, isOpen, onClose, onViewDentistProfile, onViewClinicProfile, favorites = [], onToggleFavorite, inline }: UnifiedSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'patients' | 'dentists' | 'clinics'>('all');
  const isMobile = useIsMobile();

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return MOCK_PATIENTS.slice(0, 3);
    return MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const filteredDentists = useMemo(() => {
    if (!query.trim()) return MOCK_DENTIST_RESULTS.slice(0, 3);
    return MOCK_DENTIST_RESULTS.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  const filteredClinics = useMemo(() => {
    if (!query.trim()) return MOCK_CLINIC_SEARCH.slice(0, 3);
    return MOCK_CLINIC_SEARCH.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.address.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const showPatients = activeFilter === 'all' || activeFilter === 'patients';
  const showDentists = activeFilter === 'all' || activeFilter === 'dentists';
  const showClinics = activeFilter === 'all' || activeFilter === 'clinics';

  const filterLabels: Record<string, string> = {
    all: t('search.all'),
    patients: t('search.patients'),
    dentists: t('search.dentistsTab'),
    clinics: t('search.clinicsTab'),
  };

  const content = (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.searchAllPlaceholder')}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setQuery('')} className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {(['all', 'patients', 'dentists', 'clinics'] as const).map(f => (
            <Button
              key={f}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={activeFilter === f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'h-auto px-3 py-1.5 text-xs font-medium rounded-full border-transparent tap-target',
                activeFilter === f
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {filterLabels[f]}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {showPatients && filteredPatients.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('search.patients')} ({filteredPatients.length})
                </h3>
                {activeFilter === 'all' && (
                  <Button type="button" variant="link" onClick={() => setActiveFilter('patients')} className="h-auto p-0 text-xs text-primary flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredPatients.slice(0, 3) : filteredPatients).map(p => (
                  <Button key={p.id} type="button" variant="ghost" className="w-full h-auto justify-start flex items-center gap-3 p-2.5 rounded-lg font-normal">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={p.name}>{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate" title={`${p.age} ${t('search.yearsOld')} · ${t('search.lastConsultation')}: ${p.lastConsultation}`}>{p.age} {t('search.yearsOld')} · {t('search.lastConsultation')}: {p.lastConsultation}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {showDentists && filteredDentists.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('search.dentistsTab')} ({filteredDentists.length})
                </h3>
                {activeFilter === 'all' && (
                  <Button type="button" variant="link" onClick={() => setActiveFilter('dentists')} className="h-auto p-0 text-xs text-primary flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredDentists.slice(0, 3) : filteredDentists).map(d => {
                  const isFav = favorites.includes(d.id);
                  return (
                    <Button
                      key={d.id}
                      type="button"
                      variant="ghost"
                      className="w-full h-auto justify-start flex items-center gap-3 p-2.5 rounded-lg font-normal"
                      onClick={() => onViewDentistProfile?.(d)}
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {getDentistInitials(d.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isFav && <Star className="w-3 h-3 fill-amber-400 text-warning flex-shrink-0" />}
                          <span className="text-sm font-medium text-foreground truncate min-w-0" title={d.name}>{d.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={`${d.specialties.join(', ')} · ${d.rating}`}>
                          {d.specialties.join(', ')} · <Star className="w-3 h-3 inline fill-amber-400 text-warning" />{d.rating}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-auto w-auto p-1"
                        onClick={e => { e.stopPropagation(); onToggleFavorite?.(d.id); }}
                      >
                        <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-warning' : 'text-muted-foreground')} />
                      </Button>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {showClinics && filteredClinics.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('search.clinicsTab')} ({filteredClinics.length})
                </h3>
                {activeFilter === 'all' && (
                  <Button type="button" variant="link" onClick={() => setActiveFilter('clinics')} className="h-auto p-0 text-xs text-primary flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredClinics.slice(0, 3) : filteredClinics).map(c => (
                  <Button
                    key={c.id}
                    type="button"
                    variant="ghost"
                    className="w-full h-auto justify-start flex items-center gap-3 p-2.5 rounded-lg font-normal"
                    onClick={() => onViewClinicProfile?.(c.id)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={c.name}>{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate" title={`${c.address} · ${c.rating}`}>
                        {c.address} · <Star className="w-3 h-3 inline fill-amber-400 text-warning" />{c.rating}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{c.distance} km</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {query && filteredPatients.length === 0 && filteredDentists.length === 0 && filteredClinics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('search.noResultsFor', { query })}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (inline) {
    if (!isOpen) return null;
    return content;
  }

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <FullScreenMobileOverlay>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold">{t('search.searchTitle')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        {content}
      </FullScreenMobileOverlay>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0 gap-0 max-h-[80vh]">
        {content}
      </DialogContent>
    </Dialog>
  );
}
