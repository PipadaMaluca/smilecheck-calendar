import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Download, Calendar, CheckCircle2, XCircle, Star, TrendingUp } from 'lucide-react';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { UserRole } from '@/types/calendar';
import { ConfirmationsTab } from './ConfirmationsTab';
import { WaitingListTab } from './WaitingListTab';

type Period = 'today' | 'week' | 'month';
type SubTab = 'geral' | 'confirmacoes' | 'lista_espera';

const DEMO_DATE = new Date(2026, 0, 31);

interface StatisticsViewProps {
  userRole?: UserRole;
}

export function StatisticsView({ userRole = 'clinic' }: StatisticsViewProps) {
  const [period, setPeriod] = useState<Period>('today');
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('geral');

  const clinicDentists = useMemo(() => getDentistsForClinic('1'), []);

  // ===== Geral tab data =====
  const filteredConsultations = useMemo(() => {
    let cons = mockConsultations.filter(c => c.clinic.id === '1');
    if (period === 'today') cons = cons.filter(c => isSameDay(c.date, DEMO_DATE));
    if (selectedDentist !== 'all') cons = cons.filter(c => c.dentist.id === selectedDentist);
    return cons;
  }, [period, selectedDentist]);

  const totalConsultations = filteredConsultations.length;
  const confirmed = filteredConsultations.filter(c => c.status === 'confirmada' || c.status === 'visto' || c.status === 'em_consulta' || c.status === 'em_sala_espera').length;
  const faltas = filteredConsultations.filter(c => c.status === 'falta_justificada' || c.status === 'falta_nao_justificada').length;
  const confirmRate = totalConsultations > 0 ? Math.round((confirmed / totalConsultations) * 100) : 0;
  const faltaRate = totalConsultations > 0 ? Math.round((faltas / totalConsultations) * 100) : 0;
  const revenue = filteredConsultations.reduce((sum, c) => sum + c.price, 0);

  const dentistStats = useMemo(() => {
    return clinicDentists.map(d => {
      const dCons = filteredConsultations.filter(c => c.dentist.id === d.id);
      const dFaltas = dCons.filter(c => c.status === 'falta_justificada' || c.status === 'falta_nao_justificada').length;
      return { ...d, consultations: dCons.length, faltas: dFaltas, rating: (4 + Math.random() * 0.9).toFixed(1) };
    }).filter(d => d.consultations > 0).sort((a, b) => b.consultations - a.consultations);
  }, [filteredConsultations, clinicDentists]);

  const topPatients = useMemo(() => {
    const map = new Map<string, { name: string; count: number; rating: number }>();
    filteredConsultations.forEach(c => {
      const existing = map.get(c.patient.id);
      if (existing) existing.count++;
      else map.set(c.patient.id, { name: c.patient.name, count: 1, rating: c.patient.rating });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredConsultations]);

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'geral', label: 'Geral' },
    { id: 'confirmacoes', label: 'Confirmações' },
    { id: 'lista_espera', label: 'Lista de Espera' },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Sub-tab bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
            {SUB_TABS.map(t => (
              <button
                key={t.id}
                data-subtab={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeSubTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period filters - only on Geral */}
          {activeSubTab === 'geral' && (
            <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
              {([
                { id: 'today' as Period, label: 'Hoje' },
                { id: 'week' as Period, label: 'Esta semana' },
                { id: 'month' as Period, label: 'Este mês' },
              ]).map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    period === p.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Dentist dropdown - all tabs */}
          <Select value={selectedDentist} onValueChange={setSelectedDentist}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Todos os dentistas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dentistas</SelectItem>
              {clinicDentists.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Exportar Relatório
          </Button>
        </div>

        {/* Tab content */}
        {activeSubTab === 'geral' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Consultas</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{totalConsultations}</span>
                </CardContent>
              </Card>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Taxa Confirmação</span>
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
                    <span className="text-xs font-medium">Taxa de Faltas</span>
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
                    <span className="text-xs font-medium">Receita Estimada</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">€{revenue}</span>
                </CardContent>
              </Card>
            </div>

            {/* Per dentist table */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Por Dentista</h2>
              <Card className="bg-card/80 border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Dentista</TableHead>
                      <TableHead className="text-xs text-center">Consultas</TableHead>
                      <TableHead className="text-xs text-center">Faltas</TableHead>
                      <TableHead className="text-xs text-center">Rating</TableHead>
                      <TableHead className="text-xs">Desempenho</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dentistStats.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm font-medium">{d.name}</TableCell>
                        <TableCell className="text-sm text-center">{d.consultations}</TableCell>
                        <TableCell className="text-sm text-center">{d.faltas}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{d.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress value={(d.consultations / Math.max(totalConsultations, 1)) * 100} className="h-2" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Top patients */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Top Pacientes</h2>
              <Card className="bg-card/80 border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {topPatients.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.count} consultas</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs">{p.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSubTab === 'confirmacoes' && (
          <ConfirmationsTab selectedDentist={selectedDentist} userRole={userRole} />
        )}

        {activeSubTab === 'lista_espera' && (
          <WaitingListTab selectedDentist={selectedDentist} userRole={userRole} />
        )}
      </div>
    </ScrollArea>
  );
}
