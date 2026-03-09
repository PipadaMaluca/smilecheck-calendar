import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic, clinicDentists } from '@/data/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ViewMode } from '@/types/calendar';

interface ClinicAgendaDropdownProps {
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  viewMode: ViewMode;
}

export function ClinicAgendaDropdown({
  selectedDentistIds,
  onDentistToggle,
  viewMode,
}: ClinicAgendaDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);
  const isSingleMode = viewMode === 'three-day' || viewMode === 'list';
  const allSelected = selectedDentistIds.length === 0 || selectedDentistIds.includes('all');

  const toggleClinicExpanded = (clinicId: string) => {
    setExpandedClinics(prev =>
      prev.includes(clinicId)
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  // Build display label
  const getLabel = () => {
    if (allSelected) return 'Todas as Agendas';
    if (selectedDentistIds.length === 1) {
      const parts = selectedDentistIds[0].split('-');
      const clinicId = parts[0];
      const dentistId = parts[1];
      const clinic = mockClinics.find(c => c.id === clinicId);
      const dentists = getDentistsForClinic(clinicId);
      const dentist = dentists.find(d => d.id === dentistId);
      if (dentist && clinic) return `${dentist.name} — ${clinic.name.replace('Clínica ', '')}`;
    }
    return `${selectedDentistIds.length} agendas selecionadas`;
  };

  const CustomCheck = ({ checked, radio, onChange }: { checked: boolean; radio?: boolean; onChange: () => void }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={cn(
        'w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0 border-2',
        radio ? 'rounded-full' : 'rounded',
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-muted-foreground/50 hover:border-primary'
      )}
    >
      {checked && (radio
        ? <div className="w-2 h-2 rounded-full bg-primary-foreground" />
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
      )}
    </button>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 bg-card/60 border-b border-border">
        <span className="text-xs font-medium text-foreground truncate">{getLabel()}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-card/80 border-b border-border px-4 py-2 space-y-2">
        {/* Todos */}
        <div className="flex items-center gap-2 py-1">
          <CustomCheck
            checked={allSelected}
            onChange={() => onDentistToggle('all', true)}
          />
          <button
            className="text-xs font-medium hover:text-primary"
            onClick={() => onDentistToggle('all', false)}
          >
            Todos
          </button>
        </div>
        {/* Filtrar Presentes */}
        <div className="flex items-center gap-2 py-1">
          <CustomCheck
            checked={!allSelected && selectedDentistIds.length === clinicDentists.filter(cd => cd.worksOnDemo).length}
            onChange={() => {
              const isCurrentlyFiltered = !allSelected && selectedDentistIds.length === clinicDentists.filter(cd => cd.worksOnDemo).length;
              if (isCurrentlyFiltered) {
                onDentistToggle('all', true);
              } else {
                onDentistToggle(null, true);
              }
            }}
          />
          <button
            className="text-xs hover:text-primary"
            onClick={() => {
              const isCurrentlyFiltered = !allSelected && selectedDentistIds.length === clinicDentists.filter(cd => cd.worksOnDemo).length;
              if (isCurrentlyFiltered) {
                onDentistToggle('all', false);
              } else {
                onDentistToggle(null, false);
              }
            }}
          >
            Filtrar Presentes
          </button>
        </div>

        {mockClinics.map(clinic => {
          const isExpanded = expandedClinics.includes(clinic.id);
          const dentistsInClinic = getDentistsForClinic(clinic.id);

          return (
            <div key={clinic.id}>
              <button
                className="w-full flex items-center justify-between py-1 text-sm hover:text-primary"
                onClick={() => toggleClinicExpanded(clinic.id)}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold">{clinic.name.replace('Clínica ', '')}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              {isExpanded && dentistsInClinic.map(d => {
                const dKey = `${clinic.id}-${d.id}`;
                const dSelected = allSelected || selectedDentistIds.includes(dKey);
                const dWorks = clinicDentists.find(cd => cd.clinicId === clinic.id && cd.dentistId === d.id)?.worksOnDemo ?? false;

                return (
                  <div key={dKey} className="flex items-center gap-2 ml-5 py-1">
                    <CustomCheck
                      checked={dSelected}
                      radio={isSingleMode}
                      onChange={() => onDentistToggle(d.id, !isSingleMode, clinic.id)}
                    />
                    <button
                      className={cn("text-xs hover:text-primary", !dWorks && "text-muted-foreground/60")}
                      onClick={() => onDentistToggle(d.id, false, clinic.id)}
                    >
                      {d.name}{!dWorks ? ' •' : ''}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
