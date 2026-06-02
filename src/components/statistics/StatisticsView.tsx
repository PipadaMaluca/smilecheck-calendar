import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Download, Calendar, CheckCircle2, XCircle, Star, TrendingUp } from 'lucide-react';
import { mockConsultations, getDentistsForClinic, mockClinics, clinicDentists, mockDentists } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { UserRole } from '@/types/calendar';
import { ConfirmationsTab } from './ConfirmationsTab';
import { WaitingListTab } from './WaitingListTab';
import { ExportReportModal } from './ExportReportModal';
import { useTranslation } from 'react-i18next';

type Period = 'today' | 'week' | 'month';
type SubTab = 'geral' | 'confirmacoes' | 'lista_espera';

const DEMO_DATE = new Date(2026, 0, 31);

interface StatisticsViewProps {
  userRole?: UserRole;
}

export function StatisticsView({ userRole = 'clinic' }: StatisticsViewProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('today');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('geral');
  const [showExportModal, setShowExportModal] = useState(false);

  const availableDentists = useMemo(() => {
    if (selectedClinic === 'all') return mockDentists;
    return getDentistsForClinic(selectedClinic);
  }, [selectedClinic]);

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinic(clinicId);
    setSelectedDentist('all');
  };

  const filteredConsultations = useMemo(() => {
    let cons = mockConsultations.filter((c) => {
      if (selectedClinic !== 'all' && c.clinic.id !== selectedClinic) return false;
      return true;
    });
    if (period === 'today') cons = cons.filter((c) => isSameDay(c.date, DEMO_DATE));
    if (selectedDentist !== 'all') cons = cons.filter((c) => c.dentist.id === selectedDentist);
    return cons;
  }, [period, selectedDentist, selectedClinic]);

  const totalConsultations = filteredConsultations.length;
  const confirmed = filteredConsultations.filter((c) => c.status === 'confirmada' || c.status === 'visto' || c.status === 'em_consulta' || c.status === 'em_sala_espera').length;
  const faltas = filteredConsultations.filter((c) => c.status === 'falta_justificada' || c.status === 'falta_nao_justificada').length;
  const confirmRate = totalConsultations > 0 ? Math.round(confirmed / totalConsultations * 100) : 0;
  const faltaRate = totalConsultations > 0 ? Math.round(faltas / totalConsultations * 100) : 0;
  const revenue = filteredConsultations.reduce((sum, c) => sum + c.price, 0);

  const clinicDentistsList = useMemo(() => getDentistsForClinic('1'), []);

  const dentistStats = useMemo(() => {
    const dentistsToUse = selectedClinic === 'all' ? clinicDentistsList : getDentistsForClinic(selectedClinic);
    return dentistsToUse.map((d) => {
      const dCons = filteredConsultations.filter((c) => c.dentist.id === d.id);
      const dFaltas = dCons.filter((c) => c.status === 'falta_justificada' || c.status === 'falta_nao_justificada').length;
      const dTele = dCons.filter((c) => c.type === 'teleconsulta').length;
      const dPres = dCons.filter((c) => c.type === 'presencial').length;
      const clinicName = dCons[0]?.clinic?.name?.replace('Clínica ', '') ?? '';
      return { ...d, consultations: dCons.length, faltas: dFaltas, tele: dTele, pres: dPres, clinicName, rating: (4 + Math.random() * 0.9).toFixed(1) };
    }).filter((d) => d.consultations > 0).sort((a, b) => b.consultations - a.consultations);
  }, [filteredConsultations, clinicDentistsList, selectedClinic]);

  const topPatients = useMemo(() => {
    const map = new Map<string, {name: string;count: number;rating: number;}>();
    filteredConsultations.forEach((c) => {
      const existing = map.get(c.patient.id);
      if (existing) existing.count++;else
      map.set(c.patient.id, { name: c.patient.name, count: 1, rating: c.patient.rating });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredConsultations]);

  const SUB_TABS: {id: SubTab;label: string;}[] = [
    { id: 'geral', label: t('statistics.general') },
    { id: 'confirmacoes', label: t('statistics.confirmations') },
    { id: 'lista_espera', label: t('statistics.waitingList') },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit min-w-full sm:min-w-0">
            {SUB_TABS.map((tab) =>
              <button
                key={tab.id}
                data-subtab={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex-1 sm:flex-none',
                  activeSubTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {tab.label}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          {activeSubTab === 'geral' &&
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
                {[
                  { id: 'today' as Period, label: t('statistics.today') },
                  { id: 'week' as Period, label: t('statistics.thisWeek') },
                  { id: 'month' as Period, label: t('statistics.thisMonth') },
                ].map((p) =>
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
                      period === p.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}>
                    {p.label}
                  </button>
                )}
              </div>
            </div>
          }

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <Select value={selectedClinic} onValueChange={handleClinicChange}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                <SelectValue placeholder={t('statistics.allClinics')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('statistics.allClinics')}</SelectItem>
                {mockClinics.map((c) =>
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={selectedDentist} onValueChange={setSelectedDentist}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                <SelectValue placeholder={t('statistics.allDentists')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('statistics.allDentists')}</SelectItem>
                {selectedClinic === 'all' ?
                  mockClinics.map((clinic) => {
                    const dentists = getDentistsForClinic(clinic.id);
                    return (
                      <SelectGroup key={clinic.id}>
                        <SelectLabel className="text-xs text-muted-foreground">{clinic.name}</SelectLabel>
                        {dentists.map((d) =>
                          <SelectItem key={`${clinic.id}-${d.id}`} value={d.id}>{d.name}</SelectItem>
                        )}
                      </SelectGroup>
                    );
                  }) :
                  availableDentists.map((d) =>
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  )
                }
              </SelectContent>
            </Select>
          </div>

          <div className="hidden sm:flex flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs w-full sm:w-auto"
            onClick={() => setShowExportModal(true)}>
            <Download className="w-3.5 h-3.5" /> {t('statistics.exportReport')}
          </Button>
        </div>

        {activeSubTab === 'geral' &&
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('statistics.totalConsultations')}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{totalConsultations}</span>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('statistics.confirmationRate')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{confirmRate}%</span>
                    <Progress value={confirmRate} className="h-2 flex-1" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('statistics.absenceRate')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{faltaRate}%</span>
                    <Progress value={faltaRate} className="h-2 flex-1" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">{t('statistics.estimatedRevenue')}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">€{revenue}</span>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">{t('statistics.byDentist')}</h2>
              {/* Desktop / tablet table (>= 500px) */}
              <Card className="bg-card/80 border-border overflow-hidden max-[499px]:hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t('statistics.dentist')}</TableHead>
                        <TableHead className="text-xs text-center">{t('statistics.consultations')}</TableHead>
                        <TableHead className="text-xs text-center">{t('statistics.absences')}</TableHead>
                        <TableHead className="text-xs text-center">{t('statistics.rating')}</TableHead>
                        <TableHead className="text-xs hidden sm:table-cell">{t('statistics.performance')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dentistStats.map((d) =>
                        <TableRow key={d.id}>
                          <TableCell className="text-sm font-medium"><ClickableDentistName name={d.name} className="text-sm font-medium" /></TableCell>
                          <TableCell className="text-sm text-center">{d.consultations}</TableCell>
                          <TableCell className="text-sm text-center">{d.faltas}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-[5px]">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm">{d.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Progress value={d.consultations / Math.max(totalConsultations, 1) * 100} className="h-2" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Mobile list (< 500px) */}
              <Card className="bg-card/80 border-border overflow-hidden hidden max-[499px]:block">
                <ul>
                  {dentistStats.map((d, i) => {
                    const parts = d.name.split(' ');
                    let shortName = d.name;
                    if (parts.length > 2) {
                      // "Dr. Alexandre Bernardo" -> "Dr. Alexandre B."
                      shortName = `${parts[0]} ${parts[1]} ${parts[parts.length - 1][0]}.`;
                    }
                    return (
                      <li
                        key={d.id}
                        className={cn(
                          'flex items-center gap-2 px-2 py-2.5',
                          i > 0 && 'border-t border-white/[0.06]'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            <ClickableDentistName name={shortName} className="text-[11px] font-bold" />
                            {d.clinicName && (
                              <span className="ml-1 text-[9px] font-normal text-muted-foreground">
                                ({d.clinicName})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-center" style={{ width: 50 }}>
                          <div className="text-[11px] font-bold" style={{ color: '#2196F3' }}>{d.tele}</div>
                          <div className="text-[9px] text-muted-foreground leading-none">tele</div>
                        </div>
                        <div className="flex-shrink-0 text-center" style={{ width: 50 }}>
                          <div className="text-[11px] font-bold" style={{ color: '#10B981' }}>{d.pres}</div>
                          <div className="text-[9px] text-muted-foreground leading-none">pres</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">{t('statistics.topPatients')}</h2>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {topPatients.map((p, i) =>
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground"><ClickablePatientName name={p.name} className="text-sm font-medium text-foreground" /></p>
                          <p className="text-xs text-muted-foreground">{p.count} {t('statistics.consultations').toLowerCase()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs">{p.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        }

        {activeSubTab === 'confirmacoes' &&
          <ConfirmationsTab selectedDentist={selectedDentist} userRole={userRole} />
        }

        {activeSubTab === 'lista_espera' &&
          <WaitingListTab selectedDentist={selectedDentist} userRole={userRole} />
        }
      </div>

      <ExportReportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} userRole={userRole} />
    </ScrollArea>
  );
}