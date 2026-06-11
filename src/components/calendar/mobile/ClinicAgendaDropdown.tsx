import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic, clinicDentists } from '@/data/mockData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ViewMode } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { AgendaFilterGroups } from '@/components/calendar/AgendaFilterGroups';

interface ClinicAgendaDropdownProps {
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  viewMode: ViewMode;
}

export function ClinicAgendaDropdown({
  selectedDentistIds,
  onDentistToggle,
  onClinicToggle,
  viewMode,
}: ClinicAgendaDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);
  const [filterPresentes, setFilterPresentes] = useState(false);
  const isSingleMode = viewMode === 'three-day' || viewMode === 'list';
  const allClinicDentistKeys = mockClinics.flatMap(c => getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`));
  const allSelected = allClinicDentistKeys.length > 0 && allClinicDentistKeys.every(k => selectedDentistIds.includes(k));

  const toggleClinicExpanded = (clinicId: string) => {
    setExpandedClinics(prev =>
      prev.includes(clinicId)
        ? prev.filter(id => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  const getLabel = () => {
    if (allSelected) return t('agenda.allAgendas');
    if (selectedDentistIds.length === 1) {
      const parts = selectedDentistIds[0].split('-');
      const clinicId = parts[0];
      const dentistId = parts[1];
      const clinic = mockClinics.find(c => c.id === clinicId);
      const dentists = getDentistsForClinic(clinicId);
      const dentist = dentists.find(d => d.id === dentistId);
      if (dentist && clinic) return `${dentist.name} — ${clinic.name.replace('Clínica ', '')}`;
    }
    return `${selectedDentistIds.length} ${t('agenda.agendasSelected')}`;
  };

  const CustomCheck = ({ checked, radio, onChange }: { checked: boolean; radio?: boolean; onChange: () => void }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={cn(
        'w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0 border-2 rounded-full',
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
        <div className="flex items-center gap-2 py-1">
          <CustomCheck
            checked={allSelected}
            onChange={() => { setFilterPresentes(false); onDentistToggle('all', true); }}
          />
          <button
            className="text-xs font-medium hover:text-primary"
            onClick={() => { setFilterPresentes(false); onDentistToggle('all', false); }}
          >
            {t('agenda.allAgendas')}
          </button>
        </div>

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
            {t('agenda.filterPresent')}
          </button>
        </div>

        {mockClinics.map(clinic => {
          const isExpanded = expandedClinics.includes(clinic.id);
          const dentistsInClinic = getDentistsForClinic(clinic.id);
          const visibleDentists = dentistsInClinic;
          const allClinicSelected = visibleDentists.every(d => selectedDentistIds.includes(`${clinic.id}-${d.id}`));

          const handleClinicCheckbox = () => {
            if (onClinicToggle) {
              onClinicToggle(clinic.id, true);
            }
          };

          const handleClinicName = () => {
            if (onClinicToggle) {
              onClinicToggle(clinic.id, false);
            }
          };

          return (
            <div key={clinic.id}>
              <div className="w-full flex items-center justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <CustomCheck
                    checked={allClinicSelected}
                    onChange={handleClinicCheckbox}
                  />
                  <button
                    className="flex items-center gap-1.5 hover:text-primary"
                    onClick={handleClinicName}
                  >
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold">{clinic.name.replace('Clínica ', '')}</span>
                  </button>
                </div>
                <button onClick={() => toggleClinicExpanded(clinic.id)} className="p-0.5">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              {isExpanded && visibleDentists.map(d => {
                const dKey = `${clinic.id}-${d.id}`;
                const dSelected = selectedDentistIds.includes(dKey);
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

        <div className="-mx-4 mt-2 border-t border-border">
          <AgendaFilterGroups compact />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
