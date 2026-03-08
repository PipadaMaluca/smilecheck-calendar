import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, User, Stethoscope, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mockConsultations, mockClinics, mockDentists } from '@/data/mockData';
import { MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';

interface SearchResult {
  type: 'patient' | 'dentist' | 'clinic';
  id: string;
  name: string;
  subtitle: string;
  extra?: string;
}

interface AgendaSearchBarProps {
  onNavigateSearch?: () => void;
}

export function AgendaSearchBar({ onNavigateSearch }: AgendaSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useProfileNavigation();

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Build unique patients from consultations
  const allPatients = useMemo(() => {
    const seen = new Map<string, SearchResult>();
    mockConsultations.forEach((c) => {
      if (!seen.has(c.patient.id)) {
        seen.set(c.patient.id, {
          type: 'patient',
          id: c.patient.id,
          name: c.patient.name,
          subtitle: c.patient.age ? `${c.patient.age} anos` : '',
          extra: c.patient.phone,
        });
      }
    });
    return Array.from(seen.values());
  }, []);

  const allDentists = useMemo<SearchResult[]>(() =>
    MOCK_DENTIST_RESULTS.map((d) => ({
      type: 'dentist' as const,
      id: d.id,
      name: d.name,
      subtitle: d.specialties[0] || '',
      extra: d.clinics[0]?.name || '',
    })),
  []);

  const allClinics = useMemo<SearchResult[]>(() =>
    mockClinics.map((c) => ({
      type: 'clinic' as const,
      id: c.id,
      name: c.name,
      subtitle: c.address,
    })),
  []);

  const results = useMemo(() => {
    if (query.length < 2) return { patients: [], dentists: [], clinics: [] };
    const q = query.toLowerCase();
    const match = (r: SearchResult) =>
      r.name.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      (r.extra && r.extra.toLowerCase().includes(q));

    return {
      patients: allPatients.filter(match).slice(0, 5),
      dentists: allDentists.filter(match).slice(0, 5),
      clinics: allClinics.filter(match).slice(0, 5),
    };
  }, [query, allPatients, allDentists, allClinics]);

  const hasResults = results.patients.length + results.dentists.length + results.clinics.length > 0;
  const showDropdown = isOpen && query.length >= 2;

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setIsFocused(false);
    if (result.type === 'patient' && nav) {
      nav.openPatientProfile(result.id);
    } else if (result.type === 'dentist' && nav) {
      const d = MOCK_DENTIST_RESULTS.find((dr) => dr.id === result.id);
      if (d) nav.openDentistProfile(d);
    } else if (result.type === 'clinic' && nav) {
      nav.openClinicProfile(result.id);
    }
  };

  const highlightMatch = (text: string) => {
    if (query.length < 2) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const renderGroup = (title: string, icon: React.ReactNode, items: SearchResult[]) => {
    if (items.length === 0) return null;
    return (
      <div className="py-1">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {icon}
          {title}
        </div>
        {items.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
            onClick={() => handleResultClick(item)}
          >
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className={cn(
                'text-[10px] font-medium',
                item.type === 'patient' && 'bg-primary/10 text-primary',
                item.type === 'dentist' && 'bg-emerald-500/10 text-emerald-400',
                item.type === 'clinic' && 'bg-amber-500/10 text-amber-400',
              )}>
                {item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {highlightMatch(item.name)}
                {item.subtitle && (
                  <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                    {highlightMatch(item.subtitle)}
                  </span>
                )}
              </p>
              {item.extra && (
                <p className="text-xs text-muted-foreground truncate">
                  {highlightMatch(item.extra)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder="Pesquisar pacientes, dentistas ou clínicas"
          className={cn(
            'pl-9 pr-8 h-9 w-80 text-sm transition-all',
            isFocused && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
          )}
        />
        {query && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-[100] overflow-hidden">
          {hasResults ? (
            <div className="max-h-[360px] overflow-y-auto">
              {renderGroup('Pacientes', <User className="w-3 h-3" />, results.patients)}
              {results.patients.length > 0 && results.dentists.length > 0 && <div className="h-px bg-border mx-2" />}
              {renderGroup('Dentistas', <Stethoscope className="w-3 h-3" />, results.dentists)}
              {(results.patients.length > 0 || results.dentists.length > 0) && results.clinics.length > 0 && <div className="h-px bg-border mx-2" />}
              {renderGroup('Clínicas', <Building2 className="w-3 h-3" />, results.clinics)}
              <div className="border-t border-border">
                <button
                  className="w-full px-3 py-2 text-xs text-primary hover:bg-accent/50 transition-colors text-center font-medium"
                  onClick={() => { setIsOpen(false); setQuery(''); onNavigateSearch?.(); }}
                >
                  Ver todos os resultados →
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
