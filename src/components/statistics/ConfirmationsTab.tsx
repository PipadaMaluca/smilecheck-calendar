import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { UserRole } from '@/types/calendar';

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

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    primeira_consulta: '1ª Consulta', restauracao: 'Restauração', destartarizacao: 'Destartarização',
    endodontia: 'Endodontia', cirurgia: 'Cirurgia', protese: 'Prótese', ortodontia: 'Ortodontia',
    urgencia: 'Urgência', teleconsulta: 'Teleconsulta', odontopediatria: 'Odontopediatria',
    implante: 'Implante', branqueamento: 'Branqueamento', followup: 'Follow-up',
  };
  return labels[cat] || cat;
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

interface ConfirmationsTabProps {
  selectedDentist: string;
  userRole: UserRole;
}

export function ConfirmationsTab({ selectedDentist, userRole }: ConfirmationsTabProps) {
  const clinicDentists = useMemo(() => getDentistsForClinic('1'), []);

  const dentistsToShow = useMemo(() => {
    if (userRole === 'dentist') return clinicDentists.filter(d => d.id === '1'); // logged-in dentist
    if (selectedDentist !== 'all') return clinicDentists.filter(d => d.id === selectedDentist);
    return clinicDentists;
  }, [clinicDentists, selectedDentist, userRole]);

  const todayConsultations = useMemo(() =>
    mockConsultations.filter(c => c.clinic.id === '1' && isSameDay(c.date, DEMO_DATE)),
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

        const initials = dentist.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase();

        return (
          <Card key={dentist.id} className="bg-card/80 border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{dentist.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400">✓ {confirmed} confirmados</span>
                  <span className="text-orange-400">● {pending} pendentes</span>
                  <span className="text-red-400">✗ {cancelled} cancelados</span>
                </div>
              </div>
              {displayCons.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Hora</TableHead>
                      <TableHead className="text-xs">Paciente</TableHead>
                      <TableHead className="text-xs">Tipo de Consulta</TableHead>
                      <TableHead className="text-xs text-center">24h</TableHead>
                      <TableHead className="text-xs text-center">1h</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayCons.map(c => {
                      const s24 = get24hStatus(c.status);
                      const s1 = get1hStatus(s24, c.status);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium">{c.time}</TableCell>
                          <TableCell className="text-sm">{c.patient.name}</TableCell>
                          <TableCell className="text-sm">{getCategoryLabel(c.category)}</TableCell>
                          <TableCell className="text-center">{statusBadge(s24)}</TableCell>
                          <TableCell className="text-center">{statusBadge(s1)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Sem consultas hoje.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
