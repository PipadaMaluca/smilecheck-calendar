import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Star, MapPin, User, Building2, Stethoscope, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';
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
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {(['all', 'patients', 'dentists', 'clinics'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                activeFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {filterLabels[f]}
            </button>
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
                  <button onClick={() => setActiveFilter('patients')} className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredPatients.slice(0, 3) : filteredPatients).map(p => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.age} {t('search.yearsOld')} · {t('search.lastConsultation')}: {p.lastConsultation}</p>
                    </div>
                  </button>
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
                  <button onClick={() => setActiveFilter('dentists')} className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredDentists.slice(0, 3) : filteredDentists).map(d => {
                  const levelCfg = LEVEL_CONFIG[d.level];
                  const isFav = favorites.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      onClick={() => onViewDentistProfile?.(d)}
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {d.name.split(' ').filter(n => !['dr.','dr','dra.','dra'].includes(n.toLowerCase())).filter((_,i,a) => i===0||i===a.length-1).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isFav && <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                          <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {d.specialties.join(', ')} · <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />{d.rating}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onToggleFavorite?.(d.id); }}
                        className="p-1"
                      >
                        <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      </button>
                    </button>
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
                  <button onClick={() => setActiveFilter('clinics')} className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t('search.viewAll')} <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(activeFilter === 'all' ? filteredClinics.slice(0, 3) : filteredClinics).map(c => (
                  <button
                    key={c.id}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    onClick={() => onViewClinicProfile?.(c.id)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.address} · <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />{c.rating}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.distance} km</span>
                  </button>
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
      <div className="fixed inset-0 bg-background z-[60] flex flex-col pb-[60px]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold">{t('search.searchTitle')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        {content}
      </div>
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
