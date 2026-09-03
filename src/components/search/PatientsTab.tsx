import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Calendar, MessageCircle, FolderOpen, AlertTriangle, Building2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MOCK_PATIENT_RESULTS, CLINIC_DENTIST_FILTER, PatientSearchResult } from '@/data/mockPatientSearch';
import { LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { UserRole } from '@/types/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientsTabProps {
  userRole: UserRole;
  onSendMessage?: (name: string) => void;
  onViewDossier?: (patientId: string) => void;
}

const STATUS_FILTERS = ['all', 'active', 'new', 'inactive'] as const;
const SORT_OPTIONS = ['lastConsultation', 'name', 'mostConsultations', 'bestRating'] as const;

export function PatientsTab({ userRole, onSendMessage, onViewDossier }: PatientsTabProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('lastConsultation');
  const [dentistFilter, setDentistFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...MOCK_PATIENT_RESULTS];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (userRole === 'clinic' && dentistFilter !== 'all') {
      list = list.filter(p => p.primaryDentistId === dentistFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'mostConsultations') return b.totalConsultations - a.totalConsultations;
      if (sortBy === 'bestRating') return (b.rating ?? 0) - (a.rating ?? 0);
      return b.lastConsultationDate.localeCompare(a.lastConsultationDate);
    });
    return list;
  }, [query, statusFilter, sortBy, dentistFilter, userRole]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.patientSearchPlaceholder')}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors min-h-[32px]',
              statusFilter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            {t(`search.patientFilter.${f}`)}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          {userRole === 'clinic' && (
            <Select value={dentistFilter} onValueChange={setDentistFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[180px] text-xs">
                <SelectValue placeholder={t('search.patientsFromDentist')} />
              </SelectTrigger>
              <SelectContent>
                {CLINIC_DENTIST_FILTER.map(d => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">
                    {d.id === 'all' ? t('search.allDentists') : d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-9 w-auto min-w-[170px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o} value={o} className="text-xs">
                  {t(`search.patientSort.${o}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t('search.resultsFound', { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('search.noPatientsFound')}</p>
          <p className="text-xs mt-1">{t('search.tryOtherTerms')}</p>
        </div>
      ) : (
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
          {filtered.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              userRole={userRole}
              onSendMessage={() => onSendMessage?.(p.name)}
              onViewDossier={() => onViewDossier?.(p.id)}
              getInitials={getInitials}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({
  patient: p, userRole, onSendMessage, onViewDossier, getInitials,
}: {
  patient: PatientSearchResult;
  userRole: UserRole;
  onSendMessage: () => void;
  onViewDossier: () => void;
  getInitials: (s: string) => string;
}) {
  const { t } = useTranslation();
  const levelCfg = LEVEL_CONFIG[p.level];
  const isMobile = useIsMobile();
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-colors duration-150" onClick={onViewDossier}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-base font-bold text-primary flex-shrink-0">
          {getInitials(p.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-foreground truncate">{p.name}</span>
            <span className="text-xs text-muted-foreground">({p.age} {t('search.yearsShort')})</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={cn('text-[11px] font-semibold px-1.5 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {t(levelCfg.labelKey)}
            </span>
            {p.rating !== null ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-warning" />
                {p.rating} · {t('search.reviewsCount', { count: p.reviewCount })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{t('search.noReviews')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground pl-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{t('search.lastConsultation')}: {p.lastConsultationDate} — {p.lastConsultationType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 flex-shrink-0" />
          <span>{t('search.totalConsultations', { count: p.totalConsultations })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{p.clinicName}</span>
        </div>
        {userRole === 'clinic' && p.primaryDentistName && (
          <div className="text-[11px] text-muted-foreground/80 italic truncate">
            {t('search.primaryDentist')}: {p.primaryDentistName}
          </div>
        )}
      </div>

      {p.alerts && p.alerts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.alerts.map(a => (
            <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-destructive/15 text-destructive border border-destructive/30">
              <AlertTriangle className="w-2.5 h-2.5" /> {a}
            </span>
          ))}
        </div>
      )}

      <div className={cn('gap-2 pt-1', isMobile ? 'flex flex-col' : 'flex')}>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSendMessage(); }}>
          <MessageCircle className="w-3 h-3" /> {t('search.sendMessage')}
        </Button>
        <Button size="sm" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onViewDossier(); }}>
          <FolderOpen className="w-3 h-3" /> {t('search.viewDossier')}
        </Button>
      </div>
    </div>
  );
}
