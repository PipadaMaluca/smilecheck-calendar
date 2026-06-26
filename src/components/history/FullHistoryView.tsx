import { useState, useMemo } from 'react';
import { ArrowLeft, Trophy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockScoreHistory, mockDentistScoreHistory, mockClinicScoreHistory, ConsultationScore } from '@/types/scoring';
import { getDentistsForClinic } from '@/data/mockData';
import { UserRole } from '@/types/calendar';
import { PatientFeedbackModal } from '@/components/calendar/PatientFeedbackModal';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';
import { HistoryScoreCard } from '@/components/history/HistoryScoreCard';
import { format, subMonths, isAfter, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [feedbackScore, setFeedbackScore] = useState<ConsultationScore | null>(null);
  const initialScores = userRole === 'dentist' ? mockDentistScoreHistory : userRole === 'clinic' ? mockClinicScoreHistory : mockScoreHistory;
  const [scores, setScores] = useState(initialScores);
  const [currentPage, setCurrentPage] = useState(1);

  const filterDate = getFilterDate(period);
  const clinicDentistsList = useMemo(() => getDentistsForClinic('1'), []);

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
    if (userRole === 'clinic' && selectedDentist !== 'all') {
      items = items.filter(s => s.dentistName === clinicDentistsList.find(d => d.id === selectedDentist)?.name);
    }
    items.sort((a, b) => {
      const aExpired = a.feedbackStatus === 'expired';
      const bExpired = b.feedbackStatus === 'expired';
      if (aExpired && !bExpired) return -1;
      if (!aExpired && bExpired) return 1;
      if (aExpired && bExpired) return b.date.getTime() - a.date.getTime();
      const aIsToday = isSameDay(a.date, DEMO_DATE);
      const bIsToday = isSameDay(b.date, DEMO_DATE);
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      if (aIsToday && bIsToday) return (a.consultationTime || '').localeCompare(b.consultationTime || '');
      return b.date.getTime() - a.date.getTime();
    });
    return items;
  }, [scores, filterDate, searchQuery, userRole, selectedDentist, clinicDentistsList]);

  const handlePatientFeedback = (scoreId: string, rating: number, comment: string) => {
    setScores(prev => prev.map(s =>
      s.id === scoreId ? { ...s, feedbackStatus: 'completed' as const, patientFeedback: { rating, comment: comment || undefined, submittedAt: new Date() } } : s
    ));
    setFeedbackScore(null);
  };

  const totalPositive = filteredScores.filter(s => s.totalPoints > 0).reduce((sum, s) => sum + s.totalPoints, 0);
  const totalNegative = filteredScores.filter(s => s.totalPoints < 0).reduce((sum, s) => sum + s.totalPoints, 0);
  const totalPoints = totalPositive + totalNegative;

  const title = userRole === 'patient' ? t('history.consultationHistory') : userRole === 'dentist' ? t('history.consultationHistoryPoints') : t('history.patientHistoryPoints');

  const periodFilter = (
    <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
      <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('history.allPeriods')}</SelectItem>
        <SelectItem value="1month">{t('history.lastMonth')}</SelectItem>
        <SelectItem value="3months">{t('history.last3Months')}</SelectItem>
        <SelectItem value="6months">{t('history.last6Months')}</SelectItem>
        <SelectItem value="year">{t('history.thisYear')}</SelectItem>
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
    const pagedClinic = filteredScores.slice(0, currentPage * ITEMS_PER_PAGE);
    return (
      <HistoryShell title={title} onBack={onBack} inline={inline}>
        <div className="flex items-center gap-4 p-4 bg-card/80 rounded-xl border border-border">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-foreground">{totalPoints} pts</p>
            <p className="text-xs text-muted-foreground">{t('history.totalPoints')}</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-primary font-bold">+{totalPositive}</span>
            <span className="text-destructive font-bold">{totalNegative}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {periodFilter}
          <Select value={selectedDentist} onValueChange={setSelectedDentist}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs"><SelectValue placeholder={t('history.allDentists')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('history.allDentists')}</SelectItem>
              {clinicDentistsList.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {searchInput(t('history.searchPatient'))}
        </div>
        <div className="space-y-2">
          {pagedClinic.map(score => (
            <HistoryScoreCard
              key={score.id}
              score={score}
              userRole="clinic"
              isExpanded={expandedId === score.id}
              onToggle={() => setExpandedId(prev => prev === score.id ? null : score.id)}
              onContest={score.totalPoints < 0 ? () => {
                const event = new CustomEvent('smilecheck:navigate', { detail: 'contestacao' });
                window.dispatchEvent(event);
              } : undefined}
            />
          ))}
        </div>
        {pagedClinic.length < filteredScores.length && (
          <Button variant="outline" className="w-full text-xs" onClick={() => setCurrentPage(p => p + 1)}>{t('history.loadMore')} ({filteredScores.length - pagedClinic.length} {t('history.remaining')})</Button>
        )}
        {filteredScores.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('history.noResults')}</p>}
      </HistoryShell>
    );
  }

  // ===== PATIENT & DENTIST VIEW =====
  const paged = filteredScores.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <HistoryShell title={title} onBack={onBack} inline={inline}>
      <div className="flex items-center gap-4 p-4 bg-card/80 rounded-xl border border-border">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold text-foreground">{totalPoints} pts</p>
          <p className="text-xs text-muted-foreground">{t('history.totalPoints')}</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-primary font-bold">+{totalPositive}</span>
          <span className="text-destructive font-bold">{totalNegative}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {periodFilter}
        {searchInput(userRole === 'dentist' ? t('history.searchPatient') : t('history.searchDentistClinic'))}
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
            onContest={score.totalPoints < 0 ? () => {
              const event = new CustomEvent('smilecheck:navigate', { detail: 'contestacao' });
              window.dispatchEvent(event);
            } : undefined}
          />
        ))}
        {paged.length < filteredScores.length && (
          <Button variant="outline" className="w-full text-xs" onClick={() => setCurrentPage(p => p + 1)}>
            {t('history.loadMore')} ({filteredScores.length - paged.length} {t('history.remaining')})
          </Button>
        )}
        {filteredScores.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('history.noResults')}</p>}
      </div>

      <PatientFeedbackModal score={feedbackScore} isOpen={!!feedbackScore} onClose={() => setFeedbackScore(null)} onSubmit={handlePatientFeedback} />
    </HistoryShell>
  );
}

// ===== Shell wrapper =====
function HistoryShell({ title, onBack, inline, children }: { title: string; onBack: () => void; inline?: boolean; children: React.ReactNode }) {
  const { t } = useTranslation();
  if (inline) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> {t('history.back')}
          </Button>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {children}
        </div>
      </ScrollArea>
    );
  }

  return (
    <FullScreenMobileOverlay>
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">{children}</div>
      </ScrollArea>
    </FullScreenMobileOverlay>
  );
}