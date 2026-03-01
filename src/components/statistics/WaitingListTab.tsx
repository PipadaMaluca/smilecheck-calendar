import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDentistsForClinic } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';

interface WaitlistPatient {
  id: string;
  name: string;
  consultationType: string;
  availability: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  requestDate: string;
}

const MOCK_WAITLIST: Record<string, WaitlistPatient[]> = {
  '1': [
    { id: 'wl1', name: 'Rui Fernandes', consultationType: 'Endodontia', availability: 'Manhãs', priority: 'Alta', requestDate: '28/01/2026' },
    { id: 'wl2', name: 'Sofia Lopes', consultationType: 'Destartarização', availability: 'Qualquer', priority: 'Baixa', requestDate: '25/01/2026' },
    { id: 'wl3', name: 'Bruno Pereira', consultationType: 'Restauração', availability: 'Tardes', priority: 'Média', requestDate: '27/01/2026' },
  ],
  '2': [
    { id: 'wl4', name: 'Ana Ferreira', consultationType: 'Cirurgia', availability: 'Manhãs', priority: 'Alta', requestDate: '29/01/2026' },
    { id: 'wl5', name: 'Carlos Santos', consultationType: 'Prótese', availability: 'Qualquer', priority: 'Média', requestDate: '26/01/2026' },
    { id: 'wl6', name: 'Helena Nunes', consultationType: '1ª Consulta', availability: 'Tardes', priority: 'Baixa', requestDate: '24/01/2026' },
  ],
  '3': [
    { id: 'wl7', name: 'Pedro Almeida', consultationType: 'Urgência', availability: 'Manhãs', priority: 'Alta', requestDate: '30/01/2026' },
    { id: 'wl8', name: 'Maria Silva', consultationType: 'Ortodontia', availability: 'Qualquer', priority: 'Média', requestDate: '23/01/2026' },
    { id: 'wl9', name: 'João Costa', consultationType: 'Restauração', availability: 'Tardes', priority: 'Baixa', requestDate: '22/01/2026' },
  ],
};

const priorityStyles: Record<string, string> = {
  Alta: 'bg-red-500/20 text-red-400 border-red-500/30',
  Média: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Baixa: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

interface WaitingListTabProps {
  selectedDentist: string;
  userRole: UserRole;
}

export function WaitingListTab({ selectedDentist, userRole }: WaitingListTabProps) {
  const clinicDentists = useMemo(() => getDentistsForClinic('1'), []);

  const dentistsToShow = useMemo(() => {
    if (userRole === 'dentist') return clinicDentists.filter(d => d.id === '1');
    if (selectedDentist !== 'all') return clinicDentists.filter(d => d.id === selectedDentist);
    return clinicDentists;
  }, [clinicDentists, selectedDentist, userRole]);

  return (
    <div className="space-y-4">
      {dentistsToShow.map(dentist => {
        const patients = MOCK_WAITLIST[dentist.id] || [];
        const initials = dentist.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase();

        return (
          <Card key={dentist.id} className="bg-card/80 border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <ClickableDentistName name={dentist.name} className="text-sm font-semibold text-foreground" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {patients.length} pacientes
                </Badge>
              </div>
              {patients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Paciente</TableHead>
                      <TableHead className="text-xs">Consulta Pretendida</TableHead>
                      <TableHead className="text-xs">Disponibilidade</TableHead>
                      <TableHead className="text-xs">Prioridade</TableHead>
                      <TableHead className="text-xs">Data Pedido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm font-medium"><ClickablePatientName name={p.name} className="text-sm font-medium" /></TableCell>
                        <TableCell className="text-sm">{p.consultationType}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {p.availability}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border', priorityStyles[p.priority])}>
                            {p.priority}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.requestDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Sem pacientes em lista de espera.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
