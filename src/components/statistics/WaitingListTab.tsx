import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDentistsForClinic } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { cn } from '@/lib/utils';
import { UserRole, getCategoryBadgeStyle } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface WaitlistPatient {
  id: string;
  name: string;
  consultationTypeKey: string;
  availabilityKey: string;
  priorityKey: 'high' | 'medium' | 'low';
  requestDate: string;
  colorHex: string;
}

const MOCK_WAITLIST: Record<string, WaitlistPatient[]> = {
  '1': [
    { id: 'wl1', name: 'Rui Fernandes', consultationTypeKey: 'endodontics', availabilityKey: 'mornings', priorityKey: 'high', requestDate: '28/01/2026', colorHex: '#E91E63' },
    { id: 'wl2', name: 'Sofia Lopes', consultationTypeKey: 'scaling', availabilityKey: 'any', priorityKey: 'low', requestDate: '25/01/2026', colorHex: '#9C27B0' },
    { id: 'wl3', name: 'Bruno Pereira', consultationTypeKey: 'restoration', availabilityKey: 'afternoons', priorityKey: 'medium', requestDate: '27/01/2026', colorHex: '#2196F3' },
  ],
  '2': [
    { id: 'wl4', name: 'Ana Ferreira', consultationTypeKey: 'surgery', availabilityKey: 'mornings', priorityKey: 'high', requestDate: '29/01/2026', colorHex: '#212121' },
    { id: 'wl5', name: 'Carlos Santos', consultationTypeKey: 'prosthetics', availabilityKey: 'any', priorityKey: 'medium', requestDate: '26/01/2026', colorHex: '#2E7D32' },
    { id: 'wl6', name: 'Helena Nunes', consultationTypeKey: 'firstConsultation', availabilityKey: 'afternoons', priorityKey: 'low', requestDate: '24/01/2026', colorHex: '#FDD835' },
  ],
  '3': [
    { id: 'wl7', name: 'Pedro Almeida', consultationTypeKey: 'emergency', availabilityKey: 'mornings', priorityKey: 'high', requestDate: '30/01/2026', colorHex: '#F44336' },
    { id: 'wl8', name: 'Maria Silva', consultationTypeKey: 'orthodontics', availabilityKey: 'any', priorityKey: 'medium', requestDate: '23/01/2026', colorHex: '#8BC34A' },
    { id: 'wl9', name: 'João Costa', consultationTypeKey: 'restoration', availabilityKey: 'afternoons', priorityKey: 'low', requestDate: '22/01/2026', colorHex: '#2196F3' },
  ],
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

interface WaitingListTabProps {
  selectedDentist: string;
  userRole: UserRole;
}

export function WaitingListTab({ selectedDentist, userRole }: WaitingListTabProps) {
  const { t } = useTranslation();
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
        const initials = dentist.name.split(' ').filter(n => !['dr.','dr','dra.','dra'].includes(n.toLowerCase())).filter((_,i,a) => i===0||i===a.length-1).map(n => n[0]).join('').toUpperCase();

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
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 self-start sm:self-auto">
                  {patients.length} {t('waitingList.patients')}
                </Badge>
              </div>
              {patients.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('waitingList.patient')}</TableHead>
                        <TableHead className="text-xs">{t('waitingList.consultation')}</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">{t('waitingList.availability')}</TableHead>
                        <TableHead className="text-xs">{t('waitingList.priority')}</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">{t('waitingList.requestDate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm font-medium"><ClickablePatientName name={p.name} className="text-sm font-medium" /></TableCell>
                          <TableCell className="text-sm">
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full inline-block" style={getCategoryBadgeStyle(p.colorHex)}>
                              {t(`consultationTypes.${p.consultationTypeKey}`)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {t(`waitingList.${p.availabilityKey}`)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full border whitespace-nowrap', priorityStyles[p.priorityKey])}>
                              {t(`waitingList.${p.priorityKey}`)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{p.requestDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">{t('waitingList.noPatients')}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
