import { useState, useMemo } from 'react';
import { ArrowLeft, Trophy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockScoreHistory, ConsultationScore } from '@/types/scoring';
import { mockConsultations, getDentistsForClinic } from '@/data/mockData';
import { CATEGORY_LABELS, UserRole } from '@/types/calendar';
import { PatientFeedbackModal } from '@/components/calendar/PatientFeedbackModal';
import { HistoryScoreCard } from '@/components/history/HistoryScoreCard';
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
      items = items.filter(s =>
        s.dentistName.toLowerCase().includes(q) ||
        s.clinicName.toLowerCase().includes(q) ||
        (s.patientName && s.patientName.toLowerCase().includes(q))
      );
    }
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [scores, filterDate, searchQuery]);

  // Clinic history — convert consultations to ConsultationScore format
  const clinicScores = useMemo(() => {
    let items: ConsultationScore[] = mockConsultations
      .filter(c => c.clinic.id === '1' && isSameDay(c.date, DEMO_DATE))
      .map(c => {
        const isCompleted = c.status === 'visto';
        const isFalta = c.status === 'falta_justificada' || c.status === 'falta_nao_justificada';
        const points = isCompleted ? Math.floor(Math.random() * 10) + 5 : isFalta ? -(Math.floor(Math.random() * 5) + 3) : 0;
        const breakdown = isCompleted
          ? [
              { label: 'Compareceu', points: 5 },
              { label: 'Pontualidade', points: Math.floor(Math.random() * 3) },
              { label: 'Colaboração', points: Math.floor(Math.random() * 3) },
            ]
          : isFalta
          ? [{ label: 'Falta', points: -points }]
          : [{ label: 'Pendente', points: 0 }];
        return {
          id: c.id,
          consultationId: c.id,
          date: c.date,
          dentistName: c.dentist.name,
          clinicName: c.clinic.name,
          patientName: c.patient.name,
          category: c.category,
          consultationTime: c.time,
          totalPoints: points,
          breakdown,
          feedbackStatus: (isCompleted ? 'completed' : isFalta ? 'completed' : 'pending') as 'completed' | 'pending',
        };
      })
      .sort((a, b) => (a.consultationTime || '').localeCompare(b.consultationTime || '') || a.dentistName.localeCompare(b.dentistName));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c => c.patientName?.toLowerCase().includes(q));
    }
    if (selectedDentist !== 'all') {
      items = items.filter(c => {
        const dentist = mockConsultations.find(mc => mc.id === c.id)?.dentist;
        return dentist?.id === selectedDentist;
      });
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
    const pagedClinic = clinicScores.slice(0, currentPage * ITEMS_PER_PAGE);
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
        <div className="space-y-2">
          {pagedClinic.map(score => (
            <HistoryScoreCard
              key={score.id}
              score={score}
              userRole="clinic"
              isExpanded={expandedId === score.id}
              onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
            />
          ))}
        </div>
        {pagedClinic.length < clinicScores.length && (
          <Button variant="outline" className="w-full text-xs" onClick={() => setCurrentPage(p => p + 1)}>Carregar mais ({clinicScores.length - pagedClinic.length} restantes)</Button>
        )}
        {clinicScores.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Sem resultados.</p>}
      </HistoryShell>
    );
  }

  // ===== PATIENT & DENTIST VIEW =====
  const paged = filteredScores.slice(0, currentPage * ITEMS_PER_PAGE);

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
        {searchInput(userRole === 'dentist' ? 'Pesquisar paciente...' : 'Pesquisar dentista ou clínica...')}
      </div>

      <div className="space-y-2">
        {paged.map(score => (
          <HistoryScoreCard
            key={score.id}
            score={score}
            userRole={userRole}
            isExpanded={expandedId === score.id}
            onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
            onGiveFeedback={() => setFeedbackScore(score)}
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
