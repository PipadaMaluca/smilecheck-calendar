import { useState } from 'react';
import { Filter, X, Plus, ChevronDown, ChevronUp, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic, clinicDentists, mockDentists } from '@/data/mockData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { AgendaFilterGroups } from '@/components/calendar/AgendaFilterGroups';
import { getDentistInitials } from '@/lib/avatarUtils';

interface MobileAgendaFilterProps {
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  viewMode: ViewMode;
  /** When set, the matching dentist gets an "(Eu)" suffix in the panel. */
  currentDentistId?: string;
  /** Mobile single-dentist active key (clinicId-dentistId). Highlights the matching pill. */
  activeKey?: string;
  /** Called when user taps a pill to switch the active dentist. */
  onActivePillClick?: (key: string) => void;
}

/**
 * Mobile-only agenda filter: a chip row at the top with a Filter button +
 * pills of currently-selected dentists (with ✕ to remove), plus a "+ Adicionar"
 * button that opens a bottom sheet with the same clinic / dentist checkbox tree
 * used on desktop.
 */
export function MobileAgendaFilter({
  selectedDentistIds,
  onDentistToggle,
  onClinicToggle,
  viewMode,
  currentDentistId,
  activeKey,
  onActivePillClick,
}: MobileAgendaFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<string[]>(mockClinics.map(c => c.id));
  const isSingleMode = viewMode === 'three-day' || viewMode === 'list';

  const allClinicDentistKeys = mockClinics.flatMap(c =>
    getDentistsForClinic(c.id).map(d => `${c.id}-${d.id}`)
  );
  const allSelected =
    allClinicDentistKeys.length > 0 &&
    allClinicDentistKeys.every(k => selectedDentistIds.includes(k));

  const toggleClinicExpanded = (clinicId: string) =>
    setExpandedClinics(prev =>
      prev.includes(clinicId) ? prev.filter(id => id !== clinicId) : [...prev, clinicId]
    );

  // Build pill list from selected ids
  const pills = selectedDentistIds
    .map(key => {
      const [clinicId, ...rest] = key.split('-');
      const dentistId = rest.join('-');
      const clinic = mockClinics.find(c => c.id === clinicId);
      const dentist = mockDentists.find(d => d.id === dentistId);
      if (!clinic || !dentist) return null;
      const cleaned = dentist.name.replace(/^Dr\.?\s*/i, '').replace(/^Dra\.?\s*/i, '');
      const firstName = cleaned.split(' ')[0] ?? dentist.name;
      return {
        key,
        firstName,
        initials: getDentistInitials(dentist.name),
        clinicShort: clinic.name.replace('Clínica ', ''),
        dentistId: dentist.id,
        clinicId: clinic.id,
        isMe: !!currentDentistId && dentist.id === currentDentistId,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const CustomCheck = ({
    checked,
    radio,
    onChange,
  }: {
    checked: boolean;
    radio?: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={e => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0 border-2',
        radio ? 'rounded-full' : 'rounded',
        checked
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-muted-foreground/50 hover:border-primary'
      )}
    >
      {checked &&
        (radio ? (
          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ))}
    </button>
  );

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/40 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 flex-shrink-0 px-3 min-h-[36px] rounded-full text-xs font-semibold border border-border bg-background text-foreground hover:bg-muted transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('common.filter')}</span>
          {selectedDentistIds.length > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {selectedDentistIds.length}
            </span>
          )}
        </button>

        {pills.map(p => {
          const isActive = activeKey === p.key;
          return (
            <span
              key={p.key}
              className={cn(
                'flex items-center gap-1.5 flex-shrink-0 pl-1 pr-1 min-h-[36px] rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-primary/10 text-foreground border-primary/30'
              )}
            >
              <button
                onClick={() => onActivePillClick?.(p.key)}
                className="flex items-center gap-1.5 min-h-[32px]"
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isActive ? 'bg-primary-foreground/20' : 'bg-primary/20 text-foreground'
                  )}
                >
                  {p.initials}
                </span>
                <span className="truncate max-w-[90px]">
                  {p.firstName}
                  {p.isMe ? ` (${t('agenda.me')})` : ''}
                </span>
              </button>
              <button
                onClick={() => onDentistToggle(p.dentistId, true, p.clinicId)}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                  isActive ? 'hover:bg-primary-foreground/20' : 'hover:bg-primary/20'
                )}
                aria-label={`Remover ${p.firstName}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 flex-shrink-0 px-3 min-h-[36px] rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('common.add')}</span>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0 bg-card">
          <SheetHeader className="px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
            <SheetTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('common.filter')}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 py-1">
              <CustomCheck
                checked={allSelected}
                onChange={() => onDentistToggle('all', true)}
              />
              <button
                className="text-sm font-medium hover:text-primary"
                onClick={() => onDentistToggle('all', false)}
              >
                {t('agenda.allAgendas')}
              </button>
            </div>

            <div className="flex items-center gap-2 py-1">
              <button
                onClick={() => onDentistToggle(null, true)}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                {t('agenda.filterPresent')}
              </button>
            </div>

            {mockClinics.map(clinic => {
              const isExpanded = expandedClinics.includes(clinic.id);
              const dentistsInClinic = getDentistsForClinic(clinic.id);
              const allClinicSelected = dentistsInClinic.every(d =>
                selectedDentistIds.includes(`${clinic.id}-${d.id}`)
              );

              return (
                <div key={clinic.id}>
                  <div className="w-full flex items-center justify-between py-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <CustomCheck
                        checked={allClinicSelected}
                        onChange={() => onClinicToggle?.(clinic.id, true)}
                      />
                      <button
                        className="flex items-center gap-1.5 hover:text-primary"
                        onClick={() => onClinicToggle?.(clinic.id, false)}
                      >
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {clinic.name.replace('Clínica ', '')}
                        </span>
                      </button>
                    </div>
                    <button
                      onClick={() => toggleClinicExpanded(clinic.id)}
                      className="p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {isExpanded &&
                    dentistsInClinic.map(d => {
                      const dKey = `${clinic.id}-${d.id}`;
                      const dSelected = selectedDentistIds.includes(dKey);
                      const dWorks =
                        clinicDentists.find(
                          cd => cd.clinicId === clinic.id && cd.dentistId === d.id
                        )?.worksOnDemo ?? false;
                      const isMe = !!currentDentistId && d.id === currentDentistId;
                      return (
                        <div key={dKey} className="flex items-center gap-2 ml-6 py-1.5">
                          <CustomCheck
                            checked={dSelected}
                            radio={isSingleMode}
                            onChange={() =>
                              onDentistToggle(d.id, !isSingleMode, clinic.id)
                            }
                          />
                          <button
                            className={cn(
                              'text-sm hover:text-primary text-left',
                              !dWorks && 'text-muted-foreground/60'
                            )}
                            onClick={() => onDentistToggle(d.id, false, clinic.id)}
                          >
                            {d.name}
                            {isMe ? ` (${t('agenda.me')})` : ''}
                            {!dWorks && (
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                · {t('agenda.notWorkingToday')}
                              </span>
                            )}
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
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3">
            <Button className="w-full" onClick={() => setOpen(false)}>
              {t('common.apply')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}