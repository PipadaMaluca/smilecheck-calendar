import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, User, Stethoscope, Building2, Phone, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mockConsultations, mockClinics } from '@/data/mockData';
import { MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';

interface PatientResult {
  type: 'patient';
  id: string;
  name: string;
  gender: 'M' | 'F';
  dob: string;
  phone: string;
  dentistName: string;
  scheduledCount: number;
  totalCount: number;
}

interface DentistResult {
  type: 'dentist';
  id: string;
  name: string;
  specialties: string;
  clinicName: string;
}

interface ClinicResult {
  type: 'clinic';
  id: string;
  name: string;
  address: string;
}

type SearchResult = PatientResult | DentistResult | ClinicResult;

interface AgendaSearchBarProps {
  onNavigateSearch?: () => void;
}

export function AgendaSearchBar({ onNavigateSearch }: AgendaSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useProfileNavigation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
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

  const allPatients = useMemo(() => {
    const seen = new Map<string, PatientResult>();
    mockConsultations.forEach((c) => {
      if (!seen.has(c.patient.id)) {
        const patientConsults = mockConsultations.filter(mc => mc.patient.id === c.patient.id);
        const scheduled = patientConsults.filter(mc => mc.status === 'agendada' || mc.status === 'confirmada').length;
        seen.set(c.patient.id, {
          type: 'patient',
          id: c.patient.id,
          name: c.patient.name,
          gender: Math.random() > 0.5 ? 'M' : 'F',
          dob: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${1960 + Math.floor(Math.random() * 40)}`,
          phone: c.patient.phone || '+351 912 345 678',
          dentistName: c.dentist.name,
          scheduledCount: Math.max(1, scheduled),
          totalCount: patientConsults.length,
        });
      }
    });
    return Array.from(seen.values());
  }, []);

  const allDentists = useMemo<DentistResult[]>(() =>
    MOCK_DENTIST_RESULTS.map((d) => ({
      type: 'dentist' as const,
      id: d.id,
      name: d.name,
      specialties: d.specialties.join(', ') || 'Generalista',
      clinicName: d.clinics[0]?.name || '',
    })),
  []);

  const allClinics = useMemo<ClinicResult[]>(() =>
    mockClinics.map((c) => ({
      type: 'clinic' as const,
      id: c.id,
      name: c.name,
      address: c.address,
    })),
  []);

  const results = useMemo(() => {
    if (query.length < 2) return { patients: [], dentists: [], clinics: [] };
    const q = query.toLowerCase();

    const matchPatient = (r: PatientResult) =>
      r.name.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q) || r.dob.includes(q);
    const matchDentist = (r: DentistResult) =>
      r.name.toLowerCase().includes(q) || r.specialties.toLowerCase().includes(q) || r.clinicName.toLowerCase().includes(q);
    const matchClinic = (r: ClinicResult) =>
      r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);

    return {
      patients: allPatients.filter(matchPatient).slice(0, 5),
      dentists: allDentists.filter(matchDentist).slice(0, 5),
      clinics: allClinics.filter(matchClinic).slice(0, 5),
    };
  }, [query, allPatients, allDentists, allClinics]);

  const hasResults = results.patients.length + results.dentists.length + results.clinics.length > 0;
  const showDropdown = isOpen && query.length >= 2;

  useEffect(() => {
    if (!showDropdown) return;

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showDropdown, query]);

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

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={containerRef} className="relative w-[560px]">
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
          placeholder={t('search.placeholder')}
          className={cn(
            'pl-9 pr-8 h-9 w-full text-sm transition-all',
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

      {showDropdown && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="fixed mt-0 bg-card border border-border rounded-lg shadow-2xl overflow-hidden pointer-events-auto"
          style={{
            zIndex: 9999,
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            backgroundColor: 'hsl(var(--card))',
          }}
        >
          {hasResults ? (
            <div className="max-h-[460px] overflow-y-auto">
              {/* Patients */}
              {results.patients.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Pacientes
                  </div>
                  {results.patients.map((p) => (
                    <button
                      key={`patient-${p.id}`}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left group"
                      onClick={() => handleResultClick(p)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getInitials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {highlightMatch(p.name)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {p.gender}, {highlightMatch(p.dob)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {highlightMatch(p.phone)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Stethoscope className="w-3 h-3" /> {p.dentistName}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right flex items-center gap-2">
                        <div className="text-[11px] text-muted-foreground leading-tight">
                          <div className="text-primary font-medium">{p.scheduledCount} agendada{p.scheduledCount !== 1 ? 's' : ''}</div>
                          <div>{p.totalCount} total</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 cursor-pointer">
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.patients.length > 0 && results.dentists.length > 0 && <div className="h-px bg-border mx-2" />}

              {/* Dentists */}
              {results.dentists.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-3 h-3" /> Dentistas
                  </div>
                  {results.dentists.map((d) => (
                    <button
                      key={`dentist-${d.id}`}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
                      onClick={() => handleResultClick(d)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          {getInitials(d.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {highlightMatch(d.name)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{highlightMatch(d.specialties)}</span>
                          {d.clinicName && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {highlightMatch(d.clinicName)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(results.patients.length > 0 || results.dentists.length > 0) && results.clinics.length > 0 && <div className="h-px bg-border mx-2" />}

              {/* Clinics */}
              {results.clinics.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Clínicas
                  </div>
                  {results.clinics.map((c) => (
                    <button
                      key={`clinic-${c.id}`}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
                      onClick={() => handleResultClick(c)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 text-xs font-medium">
                          {getInitials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {highlightMatch(c.name)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {highlightMatch(c.address)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Show all results link */}
              <div className="border-t border-border">
                <button
                  className="w-full px-3 py-2.5 text-xs text-primary hover:bg-accent/50 transition-colors text-center font-medium"
                  onClick={() => { setIsOpen(false); setQuery(''); onNavigateSearch?.(); }}
                >
                  Mostrar todos os resultados →
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
