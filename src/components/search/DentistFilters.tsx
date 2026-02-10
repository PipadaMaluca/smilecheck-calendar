import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  SPECIALTIES,
  DISTANCE_FILTERS,
  AVAILABILITY_FILTERS,
  SORT_OPTIONS,
} from '@/data/mockDentistSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface DentistFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  specialty: string;
  onSpecialtyChange: (s: string) => void;
  distance: number;
  onDistanceChange: (d: number) => void;
  availability: string;
  onAvailabilityChange: (a: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
}

export function DentistFilters({
  searchQuery,
  onSearchChange,
  specialty,
  onSpecialtyChange,
  distance,
  onDistanceChange,
  availability,
  onAvailabilityChange,
  sortBy,
  onSortChange,
}: DentistFiltersProps) {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nome ou especialidade..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-secondary border-border h-11"
        />
      </div>

      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      )}

      {/* Filters */}
      {showFilters && (
        <div className={cn(
          'gap-2',
          isMobile ? 'flex flex-col' : 'flex flex-wrap items-center'
        )}>
          {/* Distance */}
          <Select value={String(distance)} onValueChange={(v) => onDistanceChange(Number(v))}>
            <SelectTrigger className="w-auto min-w-[130px] bg-secondary border-border h-9 text-sm">
              <SelectValue placeholder="Distância" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {DISTANCE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Specialty */}
          <Select value={specialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger className="w-auto min-w-[150px] bg-secondary border-border h-9 text-sm">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability */}
          {!isMobile ? (
            <ScrollArea className="max-w-[400px]">
              <div className="flex gap-1.5">
                {AVAILABILITY_FILTERS.map((a) => (
                  <button
                    key={a}
                    onClick={() => onAvailabilityChange(a)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                      availability === a
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:bg-accent'
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <Select value={availability} onValueChange={onAvailabilityChange}>
              <SelectTrigger className="w-auto min-w-[140px] bg-secondary border-border h-9 text-sm">
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {AVAILABILITY_FILTERS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-[150px] bg-secondary border-border h-9 text-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
