import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics, mockDentists, getDentistsForClinic, clinicDentists } from '@/data/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ViewMode } from '@/types/calendar';

interface DentistAgendaDropdownProps {
  currentDentistId: string;
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  viewMode: ViewMode;
}

export function DentistAgendaDropdown({
  currentDentistId,
  selectedDentistIds,
  onDentistToggle,
  onClinicToggle,
  viewMode,
}: DentistAgendaDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filterPresentes, setFilterPresentes] = useState(false);
  const currentDentist = mockDentists.find(d => d.id === currentDentistId);
  const isSingleMode = viewMode === 'three-day' || viewMode === 'list';
  const allClinicDentistKeys = mockClinics.flatMap(c => getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`));
  const allSelected = allClinicDentistKeys.length > 0 && allClinicDentistKeys.every(k => selectedDentistIds.includes(k));

  // Clinics where this dentist works
  const dentistClinics = clinicDentists
    .filter(cd => cd.dentistId === currentDentistId)
    .map(cd => ({
      clinic: mockClinics.find(c => c.id === cd.clinicId)!,
      worksOnDemo: cd.worksOnDemo,
    }))
    .filter(item => item.clinic);

  const getLabel = () => {
    if (!currentDentist) return 'Agenda';
    const allSelected = selectedDentistIds.length === 0 || selectedDentistIds.includes('all');
    if (allSelected) return `${currentDentist.name} (Eu) — Todas`;
    const selectedKeys = selectedDentistIds.filter(id => id.includes(`-${currentDentistId}`));
    if (selectedKeys.length === 1) {
      const clinicId = selectedKeys[0].split('-')[0];
      const clinic = mockClinics.find(c => c.id === clinicId);
      return `${currentDentist.name} (Eu) — ${clinic?.name.replace('Clínica ', '') || ''}`;
    }
    if (selectedKeys.length > 1) return `${currentDentist.name} (Eu) — ${selectedKeys.length} clínicas`;
    return `${currentDentist.name} (Eu)`;
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
        {/* Todas as Agendas */}
        <div className="flex items-center gap-2 py-1">
          <CustomCheck
            checked={allSelected}
            onChange={() => { setFilterPresentes(false); onDentistToggle('all', true); }}
          />
          <button
            className="text-xs font-medium hover:text-primary"
            onClick={() => { setFilterPresentes(false); onDentistToggle('all', false); }}
          >
            Todas as Agendas
          </button>
        </div>

        {/* Filtrar Presentes */}
        <div className="flex items-center gap-2 py-1">
          <button
            onClick={() => {
              const newVal = !filterPresentes;
              setFilterPresentes(newVal);
              if (newVal) {
                onDentistToggle(null, true);
              } else {
                onDentistToggle('all', true);
              }
            }}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors',
              filterPresentes
                ? 'bg-primary text-primary-foreground'
                : 'hover:text-primary text-muted-foreground'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Filtrar Presentes
          </button>
        </div>

        {dentistClinics.map(({ clinic, worksOnDemo }) => {
          const allDentistsInClinic = getDentistsForClinic(clinic.id);
          
          const visibleDentists = allDentistsInClinic;
          
          // When filterPresentes is active, show all dentists but uncheck non-working ones

          const otherDentists = visibleDentists.filter(d => d.id !== currentDentistId);
          const currentVisible = visibleDentists.some(d => d.id === currentDentistId);
          
          const key = `${clinic.id}-${currentDentistId}`;
          const isSelected = allSelected || selectedDentistIds.includes(key);

          const allClinicSelected = allSelected || visibleDentists.every(d => selectedDentistIds.includes(`${clinic.id}-${d.id}`));

          // CHECKMARK: Toggle all dentists of this clinic
          const handleClinicCheckbox = () => {
            if (onClinicToggle) {
              onClinicToggle(clinic.id, true);
            }
          };

          // NAME: Exclusive select all dentists of this clinic
          const handleClinicName = () => {
            if (onClinicToggle) {
              onClinicToggle(clinic.id, false);
            }
          };

          return (
            <div key={clinic.id}>
              <div className="flex items-center gap-2 py-1">
                <CustomCheck
                  checked={allClinicSelected}
                  onChange={handleClinicCheckbox}
                />
                <button
                  className="flex items-center gap-1.5 hover:text-primary"
                  onClick={handleClinicName}
                >
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-semibold text-foreground">{clinic.name.replace('Clínica ', '')}</span>
                </button>
                {!worksOnDemo && <span className="text-[10px] text-muted-foreground">(não trabalha hoje)</span>}
              </div>
              {/* Own agenda at this clinic */}
              {currentVisible && (
                <div className="flex items-center gap-2 ml-5 py-1">
                  <CustomCheck
                    checked={isSelected}
                    radio={isSingleMode}
                    onChange={() => onDentistToggle(currentDentistId, !isSingleMode, clinic.id)}
                  />
                  <button
                    className="text-xs hover:text-primary"
                    onClick={() => onDentistToggle(currentDentistId, false, clinic.id)}
                  >
                    {currentDentist?.name} (Eu)
                  </button>
                </div>
              )}
              {/* Other dentists */}
              {otherDentists.map(d => {
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
