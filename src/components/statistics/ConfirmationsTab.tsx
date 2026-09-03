import { useMemo } from 'react';
import { CheckCircle, Check, X, Circle, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { UserRole, CATEGORY_COLORS, getCategoryBadgeStyle, getCategoryLabel } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { getDentistInitials } from '@/lib/avatarUtils';

const DEMO_DATE = new Date(2026, 0, 31);

type BadgeStatus = 'confirmed' | 'cancelled' | 'pending' | 'irrelevant';

const STATUS_STYLES: Record<BadgeStatus, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-500 border-red-500/30',
  pending: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  irrelevant: 'bg-muted text-muted-foreground border-border',
};

const STATUS_ICONS: Record<BadgeStatus, LucideIcon> = {
  confirmed: Check,
  cancelled: X,
  pending: Circle,
  irrelevant: Minus,
};

const STATUS_LABEL_KEYS: Record<BadgeStatus, string> = {
  confirmed: 'confirmations.confirmed',
  cancelled: 'confirmations.cancelled',
  pending: 'confirmations.pending',
  irrelevant: 'confirmations.irrelevant',
};

const LEGEND_ORDER: BadgeStatus[] = ['confirmed', 'pending', 'cancelled', 'irrelevant'];

function StatusBadge({ status, label }: { status: BadgeStatus; label: string }) {
  const Icon = STATUS_ICONS[status];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={label}
          className={cn(
            'inline-flex items-center justify-center w-7 h-7 rounded-md border cursor-default',
            STATUS_STYLES[status]
          )}
        >
          <Icon className={cn('w-3.5 h-3.5', status === 'pending' && 'fill-current')} strokeWidth={2.5} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[11px]">{label}</TooltipContent>
    </Tooltip>
  );
}


function get24hStatus(status?: string): BadgeStatus {
  if (!status) return 'pending';
  if (status === 'falta_justificada' || status === 'falta_nao_justificada') return 'cancelled';
  if (status === 'confirmada' || status === 'visto' || status === 'em_consulta' || status === 'em_sala_espera') return 'confirmed';
  return 'pending';
}

function get1hStatus(s24h: BadgeStatus, status?: string): BadgeStatus {
  if (s24h === 'cancelled') return 'irrelevant';
  if (status === 'em_sala_espera' || status === 'em_consulta' || status === 'visto') return 'confirmed';
  if (status === 'confirmada') return 'pending';
  return 'pending';
}

const abbreviateName = (name: string) => {
  const parts = name.split(' ');
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

interface ConfirmationsTabProps {
  selectedDentist: string;
  userRole: UserRole;
}

export function ConfirmationsTab({ selectedDentist, userRole }: ConfirmationsTabProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const clinicDentists = useMemo(() => getDentistsForClinic('1'), []);

  const dentistsToShow = useMemo(() => {
    if (userRole === 'dentist') return clinicDentists.filter(d => d.id === '1');
    if (selectedDentist !== 'all') return clinicDentists.filter(d => d.id === selectedDentist);
    return clinicDentists;
  }, [clinicDentists, selectedDentist, userRole]);

  const todayConsultations = useMemo(() =>
    mockConsultations.filter(c => c.clinic.id === '1' && isSameDay(c.date, DEMO_DATE))
      .filter(c => !c.status || c.status === 'agendada' || c.status === 'confirmada'),
  []);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('confirmations.legend')}
        </span>
        {LEGEND_ORDER.map(status => {
          const Icon = STATUS_ICONS[status];
          return (
            <span key={status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-md border', STATUS_STYLES[status])}>
                <Icon className={cn('w-3 h-3', status === 'pending' && 'fill-current')} strokeWidth={2.5} />
              </span>
              {t(STATUS_LABEL_KEYS[status])}
            </span>
          );
        })}
      </div>

      {dentistsToShow.map(dentist => {
        const dCons = todayConsultations
          .filter(c => c.dentist.id === dentist.id)
          .sort((a, b) => a.time.localeCompare(b.time));

        const displayCons = userRole === 'clinic' ? dCons.slice(0, 5) : dCons;
        const confirmed = dCons.filter(c => get24hStatus(c.status) === 'confirmed').length;
        const cancelled = dCons.filter(c => get24hStatus(c.status) === 'cancelled').length;
        const pending = dCons.filter(c => get24hStatus(c.status) === 'pending').length;

        const initials = getDentistInitials(dentist.name);

        return (
          <Card key={dentist.id} className="bg-card/80 border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <ClickableDentistName name={dentist.name} className="text-sm font-semibold text-foreground" />
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <span className="flex items-center gap-1 text-emerald-500"><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> {confirmed}</span>
                  <span className="flex items-center gap-1 text-orange-500"><Circle className="w-3 h-3 fill-current" /> {pending}</span>
                  <span className="flex items-center gap-1 text-red-500"><X className="w-3.5 h-3.5" strokeWidth={2.5} /> {cancelled}</span>
                </div>

              </div>
              {displayCons.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('confirmations.time')}</TableHead>
                        <TableHead className="text-xs">{t('waitingList.patient')}</TableHead>
                        <TableHead className="text-xs">{t('confirmations.type')}</TableHead>
                        <TableHead className="text-xs text-center">{t('confirmations.h24')}</TableHead>
                        <TableHead className="text-xs text-center">{t('confirmations.h1')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayCons.map(c => {
                        const s24 = get24hStatus(c.status);
                        const s1 = get1hStatus(s24, c.status);
                        const catColor = c.category ? CATEGORY_COLORS[c.category] : null;
                        const catLabel = c.category ? getCategoryLabel(t, c.category) : '';
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="text-sm font-medium">{c.time}</TableCell>
                            <TableCell className="text-sm">
                              <ClickablePatientName name={isMobile ? abbreviateName(c.patient.name) : c.patient.name} patientId={c.patient.id} className="text-sm" />
                            </TableCell>
                            <TableCell>
                              <span
                                className="inline-flex items-center text-[11px] font-bold leading-none rounded-full whitespace-nowrap"
                                style={{ ...getCategoryBadgeStyle(catColor?.hex || ''), padding: '2px 10px' }}
                              >
                                {catLabel}
                              </span>
                            </TableCell>
                            <TableCell className="text-center"><StatusBadge status={s24} label={t(STATUS_LABEL_KEYS[s24])} /></TableCell>
                            <TableCell className="text-center"><StatusBadge status={s1} label={t(STATUS_LABEL_KEYS[s1])} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-base font-bold text-foreground mb-1">{t('emptyStates.confirmationsTitle')}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{t('emptyStates.confirmationsDesc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
