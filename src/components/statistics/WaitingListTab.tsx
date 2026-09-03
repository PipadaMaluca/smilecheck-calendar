import { useMemo, useState } from 'react';
import { AlertTriangle, BellRing, CalendarCheck, Loader2, Trash2, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDentistsForClinic } from '@/data/mockData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { ConsultationTypePill } from '@/components/ui/ConsultationTypePill';
import { cn } from '@/lib/utils';
import { UserRole, ConsultationCategory } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { getDentistInitials } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import { ListSkeleton } from '@/components/skeletons';
import { SEED_DENTIST_UUID_BY_ID } from '@/data/seedIds';
import { useAuth } from '@/contexts/AuthContext';
import {
  assignWaitingEntry,
  notifyWaitingEntry,
  removeWaitingEntry,
  upcomingSlotOptions,
  useWaitingList,
  type WaitingEntry,
} from '@/data/waitingListSource';

type Urgency = 'urgent' | 'normal';
type WlStatus = 'waiting' | 'notified' | 'confirmed';

interface PreferredSlot {
  day: string;   // display label, e.g. "Ter 3 Fev"
  time: string;  // e.g. "10:00"
  date?: string; // ISO yyyy-mm-dd, only for real DB entries
}

interface WaitlistEntry {
  id: string;
  name: string;
  category: ConsultationCategory;
  preferredSlots: PreferredSlot[];
  genericPrefs: string[];
  observation: string;
  urgency: Urgency;
  addedDaysAgo: number;
  status: WlStatus;
  real?: WaitingEntry;
}

interface WaitlistGroup {
  key: string;
  dentistName: string;
  entries: WaitlistEntry[];
}

const MOCK_WAITLIST: Record<string, Omit<WaitlistEntry, 'status'>[]> = {
  '1': [
    {
      id: 'wl-1', name: 'Rita Oliveira', category: 'endodontia', urgency: 'urgent', addedDaysAgo: 2,
      preferredSlots: [{ day: 'Ter 3 Fev', time: '09:00' }, { day: 'Qua 4 Fev', time: '08:30' }],
      genericPrefs: ['Manhãs'],
      observation: 'Dor intensa no dente 26, prefiro início da manhã',
    },
    {
      id: 'wl-2', name: 'Bruno Pereira', category: 'restauracao', urgency: 'normal', addedDaysAgo: 4,
      preferredSlots: [{ day: 'Seg 2 Fev', time: '15:30' }],
      genericPrefs: ['Seg/Qua', 'Tardes'],
      observation: 'Disponível segundas e quartas após 15h',
    },
    {
      id: 'wl-3', name: 'Sofia Lopes', category: 'destartarizacao', urgency: 'normal', addedDaysAgo: 6,
      preferredSlots: [],
      genericPrefs: ['Qualquer manhã'],
      observation: 'Qualquer manhã está bem',
    },
  ],
  '2': [
    {
      id: 'wl-4', name: 'André Gomes', category: 'cirurgia', urgency: 'urgent', addedDaysAgo: 1,
      preferredSlots: [{ day: 'Qui 5 Fev', time: '10:00' }],
      genericPrefs: [],
      observation: 'Pré-cirurgia, encaixar o quanto antes',
    },
    {
      id: 'wl-5', name: 'Helena Nunes', category: 'protese', urgency: 'normal', addedDaysAgo: 3,
      preferredSlots: [],
      genericPrefs: ['Tardes'],
      observation: 'Apenas tardes — trabalho de manhã',
    },
  ],
  '3': [
    {
      id: 'wl-6', name: 'Paulo Dias', category: 'urgencia', urgency: 'urgent', addedDaysAgo: 0,
      preferredSlots: [{ day: 'Hoje', time: '17:00' }],
      genericPrefs: [],
      observation: 'Dor aguda, primeira vaga disponível',
    },
    {
      id: 'wl-7', name: 'Teresa Martins', category: 'ortodontia', urgency: 'normal', addedDaysAgo: 5,
      preferredSlots: [{ day: 'Ter', time: '14:30' }, { day: 'Qui', time: '14:30' }],
      genericPrefs: ['Ter/Qui'],
      observation: 'Revisão de aparelho',
    },
    {
      id: 'wl-8', name: 'Beatriz Nunes', category: 'primeira_consulta', urgency: 'normal', addedDaysAgo: 8,
      preferredSlots: [],
      genericPrefs: ['Flexível'],
      observation: 'Nova paciente, flexível',
    },
  ],
};

const STATUS_STYLES: Record<WlStatus, string> = {
  waiting: 'bg-muted text-muted-foreground border-border',
  notified: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
};

const FREED_SLOTS: PreferredSlot[] = [
  { day: 'Ter 3 Fev', time: '09:00' },
  { day: 'Qua 4 Fev', time: '11:00' },
  { day: 'Qui 5 Fev', time: '15:00' },
  { day: 'Sex 6 Fev', time: '10:30' },
];

const DB_TYPE_TO_CATEGORY: Record<string, ConsultationCategory> = {
  primeira_consulta: 'primeira_consulta',
  destartarizacao: 'destartarizacao',
  cirurgia: 'cirurgia',
  endodontia: 'endodontia',
  odontopediatria: 'odontopediatria',
  ortodontia: 'ortodontia',
  protese: 'protese',
  restauracao: 'restauracao',
  urgencia: 'urgencia',
  teleconsulta: 'teleconsulta',
  avaliacao: 'outro',
};

const PERIOD_LABELS: Record<string, string> = { morning: 'Manhãs', afternoon: 'Tardes' };
const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatSlotDay(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('pt-PT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function daysSince(iso: string) {
  const created = new Date(iso).getTime();
  return Math.max(0, Math.floor((Date.now() - created) / 86400000));
}

function toUiEntry(entry: WaitingEntry): WaitlistEntry {
  const genericPrefs = [
    ...entry.genericPrefs.periods.map((p) => PERIOD_LABELS[p] ?? p),
    ...entry.genericPrefs.weekdays.map((w) => WEEKDAY_LABELS[w] ?? String(w)),
  ];
  return {
    id: entry.id,
    name: entry.patientName,
    category: DB_TYPE_TO_CATEGORY[entry.consultationType] ?? 'outro',
    preferredSlots: entry.preferredSlots.map((s) => ({
      day: formatSlotDay(s.date),
      time: s.time,
      date: s.date,
    })),
    genericPrefs,
    observation: entry.observation ?? '—',
    urgency: entry.urgency === 'urgente' ? 'urgent' : 'normal',
    addedDaysAgo: daysSince(entry.createdAt),
    status: entry.status === 'notificado' ? 'notified' : 'waiting',
    real: entry,
  };
}

interface WaitingListTabProps {
  selectedDentist: string;
  userRole: UserRole;
}

export function WaitingListTab({ selectedDentist, userRole }: WaitingListTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { entries: realEntries, loading, isDemo, refresh } = useWaitingList();
  const clinicDentists = useMemo(() => getDentistsForClinic('1'), []);

  const dentistsToShow = useMemo(() => {
    if (userRole === 'dentist') return clinicDentists.filter((d) => d.id === '1');
    if (selectedDentist !== 'all') return clinicDentists.filter((d) => d.id === selectedDentist);
    return clinicDentists;
  }, [clinicDentists, selectedDentist, userRole]);

  // Demo-only mutable mock state (status / removals).
  const [mockEntries, setMockEntries] = useState(MOCK_WAITLIST);
  const [statusMap, setStatusMap] = useState<Record<string, WlStatus>>({});
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ConsultationCategory>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Action modals
  const [assignTarget, setAssignTarget] = useState<{ entry: WaitlistEntry; dentistName: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ entry: WaitlistEntry; dentistId: string } | null>(null);
  const [removeReason, setRemoveReason] = useState<string>('external');
  const [autoMatch, setAutoMatch] = useState<
    { slot: PreferredSlot; entry: WaitlistEntry; dentistName: string; dentistId: string } | null
  >(null);

  const realSlotOptions = useMemo(
    () => upcomingSlotOptions().map((s) => ({ day: formatSlotDay(s.date), time: s.time, date: s.date })),
    []
  );

  const formatAdded = (days: number) => {
    if (days === 0) return t('waitingList.mgmt.today');
    if (days === 1) return t('waitingList.mgmt.yesterday');
    return t('waitingList.mgmt.daysAgo', { count: days });
  };

  const groups = useMemo<WaitlistGroup[]>(() => {
    if (isDemo) {
      return dentistsToShow.map((d) => ({
        key: d.id,
        dentistName: d.name,
        entries: (mockEntries[d.id] || []).map((e) => ({
          ...e,
          status: statusMap[e.id] ?? 'waiting',
        })),
      }));
    }

    // Real data: RLS already scopes the rows; apply the dentist selector on top.
    const wantedUuid =
      userRole === 'dentist'
        ? user?.id ?? null
        : selectedDentist !== 'all'
          ? SEED_DENTIST_UUID_BY_ID[selectedDentist] ?? null
          : null;

    const filtered = wantedUuid
      ? realEntries.filter((e) => e.dentistId === wantedUuid)
      : realEntries;

    const byDentist = new Map<string, WaitingEntry[]>();
    filtered.forEach((e) => {
      const key = e.dentistId ?? 'unassigned';
      const list = byDentist.get(key) ?? [];
      list.push(e);
      byDentist.set(key, list);
    });

    return [...byDentist.entries()].map(([key, list]) => ({
      key,
      dentistName: list[0].dentistName !== '—' ? list[0].dentistName : t('waitingList.mgmt.anyDentist', 'Sem dentista atribuído'),
      entries: list.map(toUiEntry),
    }));
  }, [isDemo, dentistsToShow, mockEntries, statusMap, realEntries, selectedDentist, userRole, user?.id, t]);

  const filterEntries = (list: WaitlistEntry[]) => {
    const filtered = list.filter((e) => {
      if (urgencyFilter === 'urgent' && e.urgency !== 'urgent') return false;
      if (typeFilter !== 'all' && e.category !== typeFilter) return false;
      return true;
    });
    // Urgent first, then oldest first.
    return [...filtered].sort((a, b) => {
      if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1;
      return b.addedDaysAgo - a.addedDaysAgo;
    });
  };

  const handleNotify = async (entry: WaitlistEntry) => {
    if (!entry.real) {
      setStatusMap((m) => ({ ...m, [entry.id]: 'notified' }));
      toast.success(t('waitingList.mgmt.notified'), { description: entry.name });
      return;
    }
    setBusyId(entry.id);
    try {
      await notifyWaitingEntry(
        entry.real,
        t('waitingList.mgmt.notifyMessage', 'Há uma vaga disponível para a sua consulta.')
      );
      toast.success(t('waitingList.mgmt.notified'), { description: entry.name });
      refresh();
    } catch (e) {
      toast.error(t('waitingList.mgmt.actionFailed', 'Não foi possível concluir a ação'));
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignConfirm = async (slot: PreferredSlot, entry: WaitlistEntry, dentistName: string) => {
    if (!entry.real) {
      setStatusMap((m) => ({ ...m, [entry.id]: 'confirmed' }));
      setAssignTarget(null);
      setAutoMatch(null);
      toast.success(
        t('waitingList.mgmt.assigned', { when: `${slot.day} · ${slot.time}` }),
        { description: `${entry.name} → ${dentistName}` },
      );
      return;
    }
    if (!slot.date) {
      toast.error(t('waitingList.mgmt.actionFailed', 'Não foi possível concluir a ação'));
      return;
    }
    setBusyId(entry.id);
    try {
      await assignWaitingEntry(
        entry.real,
        { date: slot.date, time: slot.time },
        userRole === 'dentist' ? user?.id ?? null : null,
        `${slot.day} · ${slot.time}`
      );
      setAssignTarget(null);
      setAutoMatch(null);
      toast.success(
        t('waitingList.mgmt.assigned', { when: `${slot.day} · ${slot.time}` }),
        { description: `${entry.name} → ${dentistName}` },
      );
      refresh();
    } catch (e) {
      toast.error(t('waitingList.mgmt.actionFailed', 'Não foi possível concluir a ação'));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    const { entry, dentistId } = removeTarget;
    if (!entry.real) {
      setMockEntries((e) => ({
        ...e,
        [dentistId]: (e[dentistId] || []).filter((x) => x.id !== entry.id),
      }));
      toast.success(t('waitingList.mgmt.removed'), { description: entry.name });
      setRemoveTarget(null);
      setRemoveReason('external');
      return;
    }
    setBusyId(entry.id);
    try {
      await removeWaitingEntry(entry.id);
      toast.success(t('waitingList.mgmt.removed'), { description: entry.name });
      setRemoveTarget(null);
      setRemoveReason('external');
      refresh();
    } catch (e) {
      toast.error(t('waitingList.mgmt.actionFailed', 'Não foi possível concluir a ação'));
    } finally {
      setBusyId(null);
    }
  };

  const simulateCancellation = () => {
    // Demo-only helper: picks a freed slot and the first matching waiting entry.
    const slot = FREED_SLOTS[Math.floor(Math.random() * FREED_SLOTS.length)];
    let matchEntry: WaitlistEntry | undefined;
    let matchGroup: WaitlistGroup | undefined;
    outer: for (const g of groups) {
      for (const e of g.entries) {
        if (e.status !== 'waiting') continue;
        const slotMatch = e.preferredSlots.some((s) => s.day === slot.day && s.time === slot.time);
        if (slotMatch || e.genericPrefs.length > 0 || e.urgency === 'urgent') {
          matchEntry = e;
          matchGroup = g;
          break outer;
        }
      }
    }
    if (!matchEntry || !matchGroup) {
      toast(t('waitingList.mgmt.autoMatchTitle'), { description: t('waitingList.noPatients') });
      return;
    }
    setAutoMatch({ slot, entry: matchEntry, dentistName: matchGroup.dentistName, dentistId: matchGroup.key });
  };

  // All category options present in current data
  const availableCategories = useMemo(() => {
    const set = new Set<ConsultationCategory>();
    groups.forEach((g) => g.entries.forEach((e) => set.add(e.category)));
    return Array.from(set);
  }, [groups]);

  if (!isDemo && loading) {
    return <ListSkeleton rows={4} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={urgencyFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setUrgencyFilter('all')}
        >
          {t('waitingList.mgmt.filterAll')}
        </Button>
        <Button
          variant={urgencyFilter === 'urgent' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => setUrgencyFilter('urgent')}
        >
          <Zap className="w-3 h-3" />
          {t('waitingList.mgmt.filterUrgent')}
        </Button>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="h-8 w-[180px] text-xs">
            <SelectValue placeholder={t('waitingList.mgmt.filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('waitingList.mgmt.filterAll')}</SelectItem>
            {availableCategories.map((c) => (
              <SelectItem key={c} value={c}>{t(`consultationTypes.${c}`, c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isDemo && (
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={simulateCancellation}>
              <AlertTriangle className="w-3 h-3" />
              {t('waitingList.mgmt.simulateCancel')}
            </Button>
          </div>
        )}
      </div>

      {groups.length === 0 && (
        <Card className="bg-card/80 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">{t('waitingList.mgmt.empty')}</p>
          </CardContent>
        </Card>
      )}

      {groups.map((group) => {
        const list = filterEntries(group.entries);
        const initials = getDentistInitials(group.dentistName);

        return (
          <Card key={group.key} className="bg-card/80 border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <ClickableDentistName name={group.dentistName} className="text-sm font-semibold text-foreground" />
                </div>
                <Badge variant="outline" className="text-[11px] self-start sm:self-auto">
                  {list.length} {t('waitingList.patients')}
                </Badge>
              </div>

              {list.length > 0 ? (
                <ul className="divide-y divide-border">
                  {list.map((entry) => {
                    const status = entry.status;
                    const busy = busyId === entry.id;
                    return (
                      <li key={entry.id} className="p-3 sm:p-4 space-y-2">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <ClickablePatientName name={entry.name} className="text-sm font-semibold text-foreground" />
                          <ConsultationTypePill category={entry.category} />
                          <span
                            className={cn(
                              'text-[11px] px-2 py-0.5 rounded-full border font-medium',
                              entry.urgency === 'urgent'
                                ? 'bg-red-500/15 text-red-500 border-red-500/30'
                                : 'bg-muted text-muted-foreground border-border',
                            )}
                          >
                            {entry.urgency === 'urgent'
                              ? t('waitingList.mgmt.urgent')
                              : t('waitingList.mgmt.normal')}
                          </span>
                          <span
                            className={cn(
                              'text-[11px] px-2 py-0.5 rounded-full border font-medium',
                              STATUS_STYLES[status],
                            )}
                          >
                            {t(`waitingList.mgmt.status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-auto">
                            {t('waitingList.mgmt.added')}: {formatAdded(entry.addedDaysAgo)}
                          </span>
                        </div>

                        {/* Preferred slots */}
                        {entry.preferredSlots.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {t('waitingList.mgmt.preferredSlots')}:
                            </span>{' '}
                            {entry.preferredSlots.map((s) => `${s.day} · ${s.time}`).join(', ')}
                          </div>
                        )}

                        {/* Generic prefs */}
                        {entry.genericPrefs.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {t('waitingList.mgmt.genericPrefs')}:
                            </span>{' '}
                            {entry.genericPrefs.join(' · ')}
                          </div>
                        )}

                        {/* Observation */}
                        <div className="text-xs text-foreground/90 italic">
                          <span className="not-italic font-semibold text-foreground">
                            {t('waitingList.mgmt.observation')}:
                          </span>{' '}
                          {entry.observation}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1"
                            disabled={status === 'confirmed' || busy}
                            onClick={() => setAssignTarget({ entry, dentistName: group.dentistName })}
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                            {t('waitingList.mgmt.assign')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            disabled={status !== 'waiting' || busy}
                            onClick={() => handleNotify(entry)}
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            {t('waitingList.mgmt.notify')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                            disabled={busy}
                            onClick={() => setRemoveTarget({ entry, dentistId: group.key })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('waitingList.mgmt.remove')}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">{t('waitingList.mgmt.empty')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Assign-slot dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          {assignTarget && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('waitingList.mgmt.assignTitle', { name: assignTarget.entry.name })}
                </DialogTitle>
                <DialogDescription>{t('waitingList.mgmt.pickSlot')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {assignTarget.entry.preferredSlots.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1.5">
                      {t('waitingList.mgmt.suggestedSlots')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {assignTarget.entry.preferredSlots.map((s, i) => (
                        <button
                          key={i}
                          className="px-3 py-2 rounded-md border border-primary/40 bg-primary/10 text-foreground text-xs font-medium hover:bg-primary/20 transition-colors text-left"
                          onClick={() => handleAssignConfirm(s, assignTarget.entry, assignTarget.dentistName)}
                        >
                          <div className="font-semibold">{s.day}</div>
                          <div className="text-muted-foreground">{s.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1.5">
                    {t('waitingList.mgmt.otherSlots')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(assignTarget.entry.real ? realSlotOptions : FREED_SLOTS).map((s, i) => (
                      <button
                        key={i}
                        className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs font-medium hover:bg-muted transition-colors text-left"
                        onClick={() => handleAssignConfirm(s, assignTarget.entry, assignTarget.dentistName)}
                      >
                        <div className="font-semibold">{s.day}</div>
                        <div className="text-muted-foreground">{s.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignTarget(null)}>
                  {t('waitingList.mgmt.cancel')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove confirm dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          {removeTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('waitingList.mgmt.removeTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('waitingList.mgmt.removeDesc', { name: removeTarget.entry.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t('waitingList.mgmt.reasonLabel')}
                </label>
                <Select value={removeReason} onValueChange={setRemoveReason}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">{t('waitingList.mgmt.reasonExternal')}</SelectItem>
                    <SelectItem value="gaveup">{t('waitingList.mgmt.reasonGaveUp')}</SelectItem>
                    <SelectItem value="other">{t('waitingList.mgmt.reasonOther')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('waitingList.mgmt.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveConfirm}>
                  {t('waitingList.mgmt.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-match alert dialog (simulated cancellation — demo only) */}
      <Dialog open={!!autoMatch} onOpenChange={(o) => !o && setAutoMatch(null)}>
        <DialogContent className="max-w-sm">
          {autoMatch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {t('waitingList.mgmt.autoMatchTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('waitingList.mgmt.autoMatchDesc', { name: autoMatch.entry.name })}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="font-semibold text-foreground">
                  {autoMatch.slot.day} · {autoMatch.slot.time}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{autoMatch.dentistName}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAutoMatch(null)}>
                  {t('waitingList.mgmt.ignore')}
                </Button>
                <Button
                  onClick={() =>
                    handleAssignConfirm(autoMatch.slot, autoMatch.entry, autoMatch.dentistName)
                  }
                >
                  {t('waitingList.mgmt.assign')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
