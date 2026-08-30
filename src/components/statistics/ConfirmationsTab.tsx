import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { UserRole, CATEGORY_COLORS, ConsultationCategory, getCategoryBadgeStyle, getCategoryLabel } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { getDentistInitials } from '@/lib/avatarUtils';

const DEMO_DATE = new Date(2026, 0, 31);

type BadgeStatus = 'confirmed' | 'cancelled' | 'pending' | 'irrelevant';

const statusBadge = (status: BadgeStatus) => {
  const styles: Record<BadgeStatus, string> = {
    confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    irrelevant: 'bg-muted text-muted-foreground border-border',
  };
  const icons: Record<BadgeStatus, string> = {
    confirmed: '✓',
    cancelled: '✗',
    pending: '●',
    irrelevant: '—',
  };
  return (
    <span className={cn('inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold', styles[status])}>
      {icons[status]}
    </span>
  );
};

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
                  <span className="text-emerald-400">✓ {confirmed}</span>
                  <span className="text-orange-400">● {pending}</span>
                  <span className="text-red-400">✗ {cancelled}</span>
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
                            <TableCell className="text-center">{statusBadge(s24)}</TableCell>
                            <TableCell className="text-center">{statusBadge(s1)}</TableCell>
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
