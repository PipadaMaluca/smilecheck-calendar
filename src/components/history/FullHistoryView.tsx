import { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Star, Clock, CheckCircle, AlertCircle, Search, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { CATEGORY_LABELS, UserRole } from '@/types/calendar';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { PatientFeedbackModal } from '@/components/calendar/PatientFeedbackModal';
import { cn } from '@/lib/utils';
import { format, subMonths, isAfter, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';

type PeriodFilter = 'all' | '1month' | '3months' | '6months' | 'year';
const DEMO_DATE = new Date(2026, 0, 31);
const ITEMS_PER_PAGE = 10;

interface FullHistoryViewProps {
  userRole: UserRole;
  onBack: () => void;
  inline?: boolean;
}

function getFilterDate(period: PeriodFilter): Date | null {
  const now = DEMO_DATE;
  switch (period) {
    case '1month': return subMonths(now, 1);
    case '3months': return subMonths(now, 3);
    case '6months': return subMonths(now, 6);
    case 'year': return new Date(now.getFullYear(), 0, 1);
    default: return null;
  }
}

export function FullHistoryView({ userRole, onBack, inline }: FullHistoryViewProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [feedbackScore, setFeedbackScore] = useState<ConsultationScore | null>(null);
  const [scores, setScores] = useState(mockScoreHistory);
  const [currentPage, setCurrentPage] = useState(1);

  const filterDate = getFilterDate(period);
  const clinicDentistsList = useMemo(() => getDentistsForClinic('1'), []);

  // Patient/Dentist scores
  const filteredScores = useMemo(() => {
    let items = [...scores];
    if (filterDate) items = items.filter(s => isAfter(s.date, filterDate));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(s => s.dentistName.toLowerCase().includes(q) || s.clinicName.toLowerCase().includes(q));
    }
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [scores, filterDate, searchQuery]);

  // Clinic history
  const clinicHistory = useMemo(() => {
    let items = mockConsultations
      .filter(c => c.clinic.id === '1' && isSameDay(c.date, DEMO_DATE))
      .map(c => {
        const isCompleted = c.status === 'visto';
        const isFalta = c.status === 'falta_justificada' || c.status === 'falta_nao_justificada';
        const points = isCompleted ? Math.floor(Math.random() * 10) + 5 : isFalta ? -(Math.floor(Math.random() * 5) + 3) : 0;
        return { ...c, points, isCompleted, isFalta };
      });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c => c.patient.name.toLowerCase().includes(q));
    }
    if (selectedDentist !== 'all') {
      items = items.filter(c => c.dentist.id === selectedDentist);
    }
    return items;
  }, [searchQuery, selectedDentist]);

  const handlePatientFeedback = (scoreId: string, rating: number, comment: string) => {
    setScores(prev => prev.map(s =>
      s.id === scoreId ? { ...s, feedbackStatus: 'completed' as const, patientFeedback: { rating, comment: comment || undefined, submittedAt: new Date() } } : s
    ));
    setFeedbackScore(null);
  };

  const totalPositive = filteredScores.filter(s => s.totalPoints > 0).reduce((sum, s) => sum + s.totalPoints, 0);
  const totalNegative = filteredScores.filter(s => s.totalPoints < 0).reduce((sum, s) => sum + s.totalPoints, 0);
  const totalPoints = totalPositive + totalNegative;

  const title = userRole === 'patient' ? 'Histórico de Consultas' : userRole === 'dentist' ? 'Histórico de Consultas (e pontos)' : 'Histórico de Pacientes (e pontos)';

  const periodFilter = (
    <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
      <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas</SelectItem>
        <SelectItem value="1month">Último mês</SelectItem>
        <SelectItem value="3months">Últimos 3 meses</SelectItem>
        <SelectItem value="6months">Últimos 6 meses</SelectItem>
        <SelectItem value="year">Este ano</SelectItem>
      </SelectContent>
    </Select>
  );

  const searchInput = (placeholder: string) => (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder={placeholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-xs" />
    </div>
  );

  // ===== CLINIC VIEW =====
  if (userRole === 'clinic') {
    const pagedClinic = clinicHistory.slice(0, currentPage * ITEMS_PER_PAGE);
    return (
      <HistoryShell title={title} onBack={onBack} inline={inline}>
        <div className="flex flex-col sm:flex-row gap-3">
          {periodFilter}
          <Select value={selectedDentist} onValueChange={setSelectedDentist}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs"><SelectValue placeholder="Todos os dentistas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dentistas</SelectItem>
              {clinicDentistsList.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {searchInput('Pesquisar paciente...')}
        </div>
        <Card className="bg-card/80 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Paciente</TableHead>
                  <TableHead className="text-xs">Dentista</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Consulta</TableHead>
                  <TableHead className="text-xs text-center">Pontos</TableHead>
                  <TableHead className="text-xs text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedClinic.map(c => {
                  const initials = c.dentist.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs text-muted-foreground">{c.time}</TableCell>
                      <TableCell className="text-xs font-medium"><ClickablePatientName name={c.patient.name} patientId={c.patient.id} className="text-xs font-medium text-foreground" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0">{initials}</div>
                          <ClickableDentistName name={c.dentist.name} className="text-xs text-foreground truncate" />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{c.category ? CATEGORY_LABELS[c.category] : c.type}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold ${c.points > 0 ? 'text-primary' : c.points < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {c.points > 0 ? '+' : ''}{c.points}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] ${c.isCompleted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : c.isFalta ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'}`}>
                          {c.isCompleted ? 'Concluída' : c.isFalta ? 'Falta' : 'Pendente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
        {pagedClinic.length < clinicHistory.length && (
          <Button variant="outline" className="w-full text-xs" onClick={() => setCurrentPage(p => p + 1)}>Carregar mais ({clinicHistory.length - pagedClinic.length} restantes)</Button>
        )}
        {clinicHistory.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sem resultados.</p>}
      </HistoryShell>
    );
  }

  // ===== PATIENT & DENTIST VIEW =====
  const paged = filteredScores.slice(0, currentPage * ITEMS_PER_PAGE);
  const showPatientName = userRole === 'dentist';

  return (
    <HistoryShell title={title} onBack={onBack} inline={inline}>
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-card/80 rounded-xl border border-border">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-foreground">{totalPoints} pts</p>
          <p className="text-xs text-muted-foreground">Total de pontos</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-primary font-bold">+{totalPositive}</span>
          <span className="text-destructive font-bold">{totalNegative}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {periodFilter}
        {searchInput(showPatientName ? 'Pesquisar paciente...' : 'Pesquisar dentista ou clínica...')}
      </div>

      <div className="space-y-2">
        {paged.map(score => (
          <ScoreCard
            key={score.id}
            score={score}
            isExpanded={expandedId === score.id}
            onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
            onGiveFeedback={() => setFeedbackScore(score)}
            showPatientName={showPatientName}
          />
        ))}
        {paged.length < filteredScores.length && (
          <Button variant="outline" className="w-full text-xs" onClick={() => setCurrentPage(p => p + 1)}>
            Carregar mais ({filteredScores.length - paged.length} restantes)
          </Button>
        )}
        {filteredScores.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sem resultados.</p>}
      </div>

      <PatientFeedbackModal score={feedbackScore} isOpen={!!feedbackScore} onClose={() => setFeedbackScore(null)} onSubmit={handlePatientFeedback} />
    </HistoryShell>
  );
}

// ===== Shell wrapper =====
function HistoryShell({ title, onBack, inline, children }: { title: string; onBack: () => void; inline?: boolean; children: React.ReactNode }) {
  if (inline) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {children}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">{children}</div>
      </ScrollArea>
    </div>
  );
}

// ===== Score Card =====
function ScoreCard({ score, isExpanded, onToggle, onGiveFeedback, showPatientName }: {
  score: ConsultationScore; isExpanded: boolean; onToggle: () => void; onGiveFeedback: () => void; showPatientName?: boolean;
}) {
  const isPositive = score.totalPoints > 0;
  const isNegative = score.totalPoints < 0;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const isPending = score.feedbackStatus === 'pending';
  const isExpired = score.feedbackStatus === 'expired';

  return (
    <Card className={cn('cursor-pointer transition-colors border-border hover:border-primary/30', isExpanded && 'border-primary/40', isPending && 'border-amber-500/20')} onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isPositive ? 'bg-primary/10' : isNegative ? 'bg-destructive/10' : 'bg-muted')}>
            <Icon className={cn('w-5 h-5', isPositive ? 'text-primary' : isNegative ? 'text-destructive' : 'text-muted-foreground')} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {format(score.date, "d MMM", { locale: pt })} — {showPatientName ? score.dentistName : <ClickableDentistName name={score.dentistName} className="text-sm font-medium text-foreground" />}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{score.clinicName}</p>
              {isPending && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-500/10"><Clock className="w-2.5 h-2.5 mr-0.5" /> Pendente</Badge>}
              {score.feedbackStatus === 'completed' && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/10"><CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Concluído</Badge>}
              {isExpired && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground bg-muted"><AlertCircle className="w-2.5 h-2.5 mr-0.5" /> Expirado</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className={cn('text-xs font-bold border-0', isPending ? 'bg-amber-500/10 text-amber-600' : isPositive ? 'bg-primary/10 text-primary' : isNegative ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground')}>
              {score.totalPoints >= 0 ? '+' : ''}{score.totalPoints} pts
            </Badge>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-border space-y-3">
            <div className="space-y-2">
              {score.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn('font-medium', item.points > 0 ? 'text-primary' : item.points < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                    {item.points >= 0 ? '+' : ''}{item.points}
                  </span>
                </div>
              ))}
            </div>
            {score.patientFeedback && (
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Avaliação</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn('w-3.5 h-3.5', s <= score.patientFeedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
                  ))}
                </div>
                {score.patientFeedback.comment && <p className="text-xs text-muted-foreground italic">"{score.patientFeedback.comment}"</p>}
              </div>
            )}
            {isPending && (
              <Button size="sm" className="w-full h-8 text-xs" onClick={(e) => { e.stopPropagation(); onGiveFeedback(); }}>
                <Star className="w-3.5 h-3.5 mr-1" /> Dar Feedback para receber pontos
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
