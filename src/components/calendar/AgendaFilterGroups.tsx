import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  agendaFiltersStore,
  useAgendaFilters,
  ALL_PATIENT_STATUSES,
  ALL_CONSULTATION_CATEGORIES,
  PatientStatusKey,
  ConsultationCategoryKey,
} from '@/stores/agendaFiltersStore';
import { CATEGORY_COLORS } from '@/types/calendar';

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

type OpenGroup = 'agendas' | 'status' | 'types' | null;

interface AgendaFilterGroupsProps {
  /** Allow parent to keep "Agendas" group open by default in some layouts. */
  initialOpen?: OpenGroup;
  className?: string;
  compact?: boolean;
}

/**
 * Doctolib-style accordion filter groups: only one open at a time.
 * Renders Patient Status + Consultation Type groups.
 * The existing "Agendas" group is rendered separately by the sidebar — this
 * component coordinates state via `openGroup` only when controlled.
 */
export function AgendaFilterGroups({ className, compact }: AgendaFilterGroupsProps) {
  const { t } = useTranslation();
  const filters = useAgendaFilters();
  const [openGroup, setOpenGroup] = useState<'status' | 'types' | null>(null);

  const toggle = (g: 'status' | 'types') =>
    setOpenGroup((prev) => (prev === g ? null : g));

  const totalStatus = ALL_PATIENT_STATUSES.length;
  const selectedStatus = filters.patientStatuses.length;
  const totalCat = ALL_CONSULTATION_CATEGORIES.length;
  const selectedCat = filters.consultationCategories.length;

  const statusAllChecked = selectedStatus === totalStatus;
  const statusIndeterminate = selectedStatus > 0 && selectedStatus < totalStatus;
  const catAllChecked = selectedCat === totalCat;
  const catIndeterminate = selectedCat > 0 && selectedCat < totalCat;

  const padding = compact ? 'px-3 py-2.5' : 'px-4 py-3';
  const itemPadding = compact ? 'py-1.5 pl-6 pr-3' : 'py-2 pl-6 pr-4';
  const labelSize = compact ? 'text-xs' : 'text-[13px]';
  const headerSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex flex-col', className)}>
      {/* ============ Patient Status Group ============ */}
      <div className="border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <button
          type="button"
          onClick={() => toggle('status')}
          className={cn(
            'w-full flex items-center justify-between font-medium transition-colors hover:bg-[#F5F9FF] dark:hover:bg-[#1E3A5F]',
            padding,
            headerSize,
            openGroup === 'status' && 'text-[#2196F3]',
          )}
        >
          <span className="truncate">{t('agendaFilters.patientStatus')}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {selectedStatus}/{totalStatus}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                openGroup === 'status' ? 'rotate-0' : '-rotate-90',
              )}
            />
          </span>
        </button>
        {openGroup === 'status' && (
          <div className="pb-2">
            <FilterRow
              label={t('patientStatuses.all')}
              bold
              indent={false}
              checked={statusAllChecked}
              indeterminate={statusIndeterminate}
              onToggle={() => agendaFiltersStore.toggleAllPatientStatuses()}
              labelSize={labelSize}
              itemPadding={compact ? 'py-1.5 px-4' : 'py-2 px-4'}
            />
            {ALL_PATIENT_STATUSES.map((s) => (
              <FilterRow
                key={s}
                label={t(STATUS_I18N[s])}
                checked={filters.patientStatuses.includes(s)}
                onToggle={() => agendaFiltersStore.togglePatientStatus(s)}
                labelSize={labelSize}
                itemPadding={itemPadding}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============ Consultation Type Group ============ */}
      <div className="border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <button
          type="button"
          onClick={() => toggle('types')}
          className={cn(
            'w-full flex items-center justify-between font-medium transition-colors hover:bg-[#F5F9FF] dark:hover:bg-[#1E3A5F]',
            padding,
            headerSize,
            openGroup === 'types' && 'text-[#2196F3]',
          )}
        >
          <span className="truncate">{t('agendaFilters.consultationTypesGroup')}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {selectedCat}/{totalCat}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                openGroup === 'types' ? 'rotate-0' : '-rotate-90',
              )}
            />
          </span>
        </button>
        {openGroup === 'types' && (
          <div className="pb-2">
            <FilterRow
              label={t('patientStatuses.all')}
              bold
              indent={false}
              checked={catAllChecked}
              indeterminate={catIndeterminate}
              onToggle={() => agendaFiltersStore.toggleAllConsultationCategories()}
              labelSize={labelSize}
              itemPadding={compact ? 'py-1.5 px-4' : 'py-2 px-4'}
            />
            {ALL_CONSULTATION_CATEGORIES.map((c) => (
              <FilterRow
                key={c}
                label={t(CATEGORY_I18N[c])}
                colorDot={CATEGORY_COLORS[c]?.hex}
                checked={filters.consultationCategories.includes(c)}
                onToggle={() => agendaFiltersStore.toggleConsultationCategory(c)}
                labelSize={labelSize}
                itemPadding={itemPadding}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterRowProps {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  bold?: boolean;
  indent?: boolean;
  colorDot?: string;
  labelSize: string;
  itemPadding: string;
}

function FilterRow({
  label,
  checked,
  indeterminate,
  onToggle,
  bold,
  colorDot,
  labelSize,
  itemPadding,
}: FilterRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-2 transition-colors hover:bg-[#F5F9FF] dark:hover:bg-[#1E3A5F] text-left',
        itemPadding,
      )}
    >
      <Checkbox
        checked={indeterminate ? 'indeterminate' : checked}
        onCheckedChange={() => onToggle()}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 data-[state=checked]:bg-[#2196F3] data-[state=checked]:border-[#2196F3] border-[#D6E4F0]"
      />
      {colorDot && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: colorDot }}
        />
      )}
      <span className={cn(labelSize, 'truncate flex-1', bold && 'font-semibold')}>
        {label}
      </span>
    </button>
  );
}