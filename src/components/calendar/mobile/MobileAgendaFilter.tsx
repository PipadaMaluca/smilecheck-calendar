import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics, getDentistsForClinic, clinicDentists, mockDentists } from '@/data/mockData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ViewMode, CATEGORY_COLORS } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { getDentistInitials } from '@/lib/avatarUtils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { DentistColumn } from '@/components/calendar/MultiDentistGrid';
import {
  agendaFiltersStore,
  useAgendaFilters,
  ALL_PATIENT_STATUSES,
  ALL_CONSULTATION_CATEGORIES,
  PatientStatusKey,
  ConsultationCategoryKey,
} from '@/stores/agendaFiltersStore';

interface MobileAgendaFilterProps {
  selectedDentistIds: string[];
  onDentistToggle: (dentistId: string | null, isCheckbox: boolean, clinicId?: string) => void;
  onClinicToggle?: (clinicId: string, isCheckbox: boolean) => void;
  viewMode: ViewMode;
  /** When set, the matching dentist gets an "(Eu)" suffix in the panel. */
  currentDentistId?: string;
  /** Currently-visible dentist columns (used for Row 3 name + Row 4 initial pills). */
  columns: DentistColumn[];
  /** Mobile single-dentist active key (clinicId-dentistId). */
  activeKey?: string;
  /** Called when user taps an initial pill to switch the active dentist. */
  onActiveKeyChange?: (key: string) => void;
}

const STATUS_I18N: Record<PatientStatusKey, string> = {
  a_chegar: 'patientStatuses.upcoming',
  em_sala_espera: 'patientStatuses.inWaitingRoom',
  em_consulta: 'patientStatuses.inConsultation',
  visto: 'patientStatuses.seen',
  falta_nao_justificada: 'patientStatuses.noShowUnexcused',
  falta_justificada: 'patientStatuses.noShowExcused',
  a_remarcar: 'patientStatuses.toReschedule',
};

const CATEGORY_I18N: Record<ConsultationCategoryKey, string> = {
  primeira_consulta: 'consultationTypes.firstConsultation',
  destartarizacao: 'consultationTypes.scaling',
  cirurgia: 'consultationTypes.surgery',
  endodontia: 'consultationTypes.endodontics',
  odontopediatria: 'consultationTypes.pediatric',
  ortodontia: 'consultationTypes.orthodontics',
  protese: 'consultationTypes.prosthetics',
  restauracao: 'consultationTypes.restoration',
  urgencia: 'consultationTypes.emergency',
  teleconsulta: 'consultationTypes.teleconsultation',
};

/**
 * Mobile-only agenda header (rows 3-5 of the spec):
 *  - Row 3: active dentist name + clinic (centered, single line, blue).
 *  - Row 4: horizontally-scrollable initial pills (one per selected dentist),
 *    tap to switch the active dentist.
 *  - Row 5: a single centered outline "Filtrar" button that opens a bottom
 *    sheet containing three sections (Patient States, Consultation Types,
 *    Dentists grouped by clinic) plus Reset / Apply buttons.
 */
export function MobileAgendaFilter({
  selectedDentistIds,
  onDentistToggle,
  onClinicToggle,
  viewMode,
  currentDentistId,
  columns,
  activeKey,
  onActiveKeyChange,
}: MobileAgendaFilterProps) {
  const { t } = useTranslation();
  const filters = useAgendaFilters();
  const [open, setOpen] = useState(false);
  const [expandedClinics, setExpandedClinics] = useState<string[]>(mockClinics.map(c => c.id));
  const [statusOpen, setStatusOpen] = useState(true);
  const [typesOpen, setTypesOpen] = useState(false);
  const [dentistsOpen, setDentistsOpen] = useState(false);
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

  // Resolve active dentist column for Row 3.
  const active =
    columns.find(c => `${c.clinic.id}-${c.dentist.id}` === activeKey) || columns[0];

  const resetFilters = () => {
    agendaFiltersStore.setPatientStatuses([...ALL_PATIENT_STATUSES]);
    agendaFiltersStore.setConsultationCategories([...ALL_CONSULTATION_CATEGORIES]);
    onDentistToggle('all', true);
  };

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
        'w-5 h-5 flex items-center justify-center transition-colors flex-shrink-0 border-2 rounded-full',
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

  const SectionHeader = ({
    label,
    open: o,
    onClick,
    count,
  }: { label: string; open: boolean; onClick: () => void; count?: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40"
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {count && <span className="tabular-nums">{count}</span>}
        {o ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </span>
    </button>
  );

  return (
    <>
      {/* ROW 3: Active dentist name + clinic */}
      {active && (
        <div className="px-4 pt-1.5 pb-0 text-center">
          <p className="text-[13px] leading-tight truncate text-[#2196F3] font-medium">
            <ClickableDentistName name={active.dentist.name} className="text-[13px] font-medium text-[#2196F3]" />
            <span className="mx-1 text-[#2196F3]/70 font-normal">—</span>
            <ClickableClinicName
              name={active.clinic.name.replace('Clínica ', '')}
              clinicId={active.clinic.id}
              className="text-[13px] font-medium text-[#2196F3]"
            />
          </p>
        </div>
      )}

      {/* ROW 4: Initial pills (switcher) */}
      {columns.length > 0 && (
        <div
          className="flex items-center justify-center gap-1.5 px-3 pt-1 pb-0 overflow-x-auto py-[10px]"
          style={{ scrollbarWidth: 'none' }}
        >
          {columns.map(c => {
            const k = `${c.clinic.id}-${c.dentist.id}`;
            const isActive = k === (activeKey ?? `${columns[0].clinic.id}-${columns[0].dentist.id}`);
            const hasAppointments = c.slots.some(s => s.consultation);
            return (
              <button
                key={k}
                onClick={() => onActiveKeyChange?.(k)}
                aria-label={c.dentist.name}
                className={cn(
                  'flex-shrink-0 flex items-center justify-center transition-colors text-[11px] font-bold',
                  isActive
                    ? 'bg-[#2196F3] text-white'
                    : hasAppointments
                      ? 'bg-white/10 text-[#94A3B8] hover:bg-white/20'
                      : 'bg-white/10 text-[#4A5568] opacity-50 hover:opacity-75'
                )}
                style={{ width: 34, height: 28, borderRadius: 14 }}
              >
                {getDentistInitials(c.dentist.name)}
              </button>
            );
          })}
        </div>
      )}

      {/* ROW 5: Centered "Filtrar" button */}
      <div className="flex items-center justify-center pt-2 pb-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[20px] text-xs font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('common.filter')}</span>
          {selectedDentistIds.length > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
              {selectedDentistIds.length}
            </span>
          )}
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

          {/* ---- Section 1: Patient States ---- */}
          <div className="border-b border-border">
            <SectionHeader
              label={t('agendaFilters.patientStatus')}
              open={statusOpen}
              onClick={() => setStatusOpen(o => !o)}
              count={`${filters.patientStatuses.length}/${ALL_PATIENT_STATUSES.length}`}
            />
            {statusOpen && (
              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => agendaFiltersStore.toggleAllPatientStatuses()}
                  className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-muted/40 text-left"
                >
                  <Checkbox
                    checked={
                      filters.patientStatuses.length === ALL_PATIENT_STATUSES.length
                        ? true
                        : filters.patientStatuses.length === 0
                          ? false
                          : 'indeterminate'
                    }
                    onCheckedChange={() => agendaFiltersStore.toggleAllPatientStatuses()}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-sm font-semibold">{t('patientStatuses.all')}</span>
                </button>
                {ALL_PATIENT_STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => agendaFiltersStore.togglePatientStatus(s)}
                    className="w-full flex items-center gap-2 pl-8 pr-4 py-1.5 hover:bg-muted/40 text-left"
                  >
                    <Checkbox
                      checked={filters.patientStatuses.includes(s)}
                      onCheckedChange={() => agendaFiltersStore.togglePatientStatus(s)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="text-[13px]">{t(STATUS_I18N[s])}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- Section 2: Consultation Types ---- */}
          <div className="border-b border-border">
            <SectionHeader
              label={t('agendaFilters.consultationTypesGroup')}
              open={typesOpen}
              onClick={() => setTypesOpen(o => !o)}
              count={`${filters.consultationCategories.length}/${ALL_CONSULTATION_CATEGORIES.length}`}
            />
            {typesOpen && (
              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => agendaFiltersStore.toggleAllConsultationCategories()}
                  className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-muted/40 text-left"
                >
                  <Checkbox
                    checked={
                      filters.consultationCategories.length === ALL_CONSULTATION_CATEGORIES.length
                        ? true
                        : filters.consultationCategories.length === 0
                          ? false
                          : 'indeterminate'
                    }
                    onCheckedChange={() => agendaFiltersStore.toggleAllConsultationCategories()}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-sm font-semibold">{t('patientStatuses.all')}</span>
                </button>
                {ALL_CONSULTATION_CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => agendaFiltersStore.toggleConsultationCategory(c)}
                    className="w-full flex items-center gap-2 pl-8 pr-4 py-1.5 hover:bg-muted/40 text-left"
                  >
                    <Checkbox
                      checked={filters.consultationCategories.includes(c)}
                      onCheckedChange={() => agendaFiltersStore.toggleConsultationCategory(c)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[c]?.hex }}
                    />
                    <span className="text-[13px]">{t(CATEGORY_I18N[c])}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- Section 3: Dentists (grouped by clinic) ---- */}
          <div>
            <SectionHeader
              label={t('agenda.dentists', { defaultValue: 'Dentistas' })}
              open={dentistsOpen}
              onClick={() => setDentistsOpen(o => !o)}
              count={`${selectedDentistIds.length}/${allClinicDentistKeys.length}`}
            />
            {dentistsOpen && (
              <div className="px-4 pb-3 space-y-1">
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
                        <button onClick={() => toggleClinicExpanded(clinic.id)} className="p-1">
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
                                  <span className="ml-1 text-[11px] text-muted-foreground">
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
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3 flex items-center gap-2">
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              {t('common.reset')}
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              {t('common.apply')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}