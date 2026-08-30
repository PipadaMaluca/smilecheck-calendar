import { useState, useMemo } from 'react';
import { ArrowLeft, Briefcase, MapPin, Star, Clock, MessageCircle, Users, Send, ChevronRight, ChevronLeft, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDentistInitials, getClinicInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { UserRole } from '@/types/calendar';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Mock job data - clinic offers (seen by dentists)
const MOCK_CLINIC_OFFERS = [
  {
    id: 'co1', clinicId: '1', clinicName: 'Clínica SmileCheck', rating: 4.9, level: 'ouro' as const,
    location: 'Av. da Liberdade 123, Lisboa', distance: 2.5,
    contractType: 'fullTime', schedule: 'Seg-Qua-Sex 09:00-13:00',
    salary: '35% por consulta + Bónus teleconsulta €5', specialties: ['generalDentistry', 'cosmeticDentistry'],
    benefits: ['continuousTraining', 'materialIncluded'], publishedAgo: '2days',
  },
  {
    id: 'co2', clinicId: '2', clinicName: 'Clínica Mitry-Mory', rating: 4.6, level: 'prata' as const,
    location: 'Rue de Paris 45, Mitry-Mory', distance: 4.2,
    contractType: 'fullTime', schedule: 'Seg-Sex 09:00-19:00',
    salary: '€3.200/mês', specialties: ['oralSurgery', 'endodontics'],
    benefits: ['healthInsurance', 'parking', 'conferences'], publishedAgo: '5days',
  },
  {
    id: 'co3', clinicId: '3', clinicName: 'Clínica Montfermeil', rating: 4.8, level: 'ouro' as const,
    location: 'Avenue Jean Moulin 12, Montfermeil', distance: 6.0,
    contractType: 'freelancer', schedule: 'Sáb 09:00-14:00',
    salary: '€30/consulta', specialties: ['orthodontics', 'implantology'],
    benefits: ['materialIncluded'], publishedAgo: '1week',
  },
];

// Mock dentist availability (seen by clinics)
const MOCK_DENTIST_AVAILABILITY = [
  {
    id: 'da1', dentistId: '6', name: 'Dr. Fábio Lobo', rating: 4.8, level: 'prata' as const,
    specialties: ['oralSurgery', 'prosthodontics', 'implantology'],
    availability: 'partTime', availabilityDetail: 'afternoons_mon_thu',
    schedule: 'Seg-Qui 14:00-20:00', experience: 12,
    teleconsultas: true, salary: 'A partir de €2.800/mês', publishedAgo: '3days',
    availableDate: '1 Mar 2026',
  },
  {
    id: 'da2', dentistId: '7', name: 'Dra. Catarina Fernandes', rating: 4.7, level: 'ouro' as const,
    specialties: ['orthodontics', 'pediatricDentistry'],
    availability: 'freelancer', availabilityDetail: 'saturdays_full',
    schedule: 'Sáb 09:00-18:00', experience: 6,
    teleconsultas: true, salary: '€28/consulta', publishedAgo: '1week',
    availableDate: '15 Mar 2026',
  },
  {
    id: 'da3', dentistId: '4', name: 'Dr. Frederico Cardoso', rating: 4.6, level: 'prata' as const,
    specialties: ['oralSurgery', 'prosthodontics'],
    availability: 'fullTime', availabilityDetail: 'mon_fri_available',
    schedule: 'Seg-Sex 09:00-19:00', experience: 15,
    teleconsultas: false, salary: 'Negociável (mín. €3.000/mês)', publishedAgo: '2days',
    availableDate: '1 Abr 2026',
  },
];

const CONTRACT_TYPE_KEYS = ['allTypes', 'fullTime', 'partTime', 'freelancer', 'replacement'];
const BENEFITS_KEYS = ['healthInsurance', 'continuousTraining', 'conferences', 'materialIncluded', 'parking', 'meals'];
const JOB_TYPE_KEYS = ['fullTime', 'partTime', 'freelancer', 'replacement'];
const JOB_PERIOD_KEYS = ['mornings', 'afternoons', 'evenings', 'weekends'];
const SPECIALTY_KEYS = [
  'generalDentistry', 'orthodontics', 'implantology', 'endodontics',
  'oralSurgery', 'prosthodontics', 'cosmeticDentistry', 'pediatricDentistry',
];
const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TIME_PERIOD_KEYS = ['morning', 'afternoon', 'night'];

interface JobMarketViewProps {
  userRole: UserRole;
  onBack: () => void;
  onSendMessage?: (name: string) => void;
}

// Manage availability panel for dentists
function DentistManagePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [teleconsultas, setTeleconsultas] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [salary, setSalary] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [note, setNote] = useState('');

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> {t('jobs.manageAvailability')}</DialogTitle>
          <DialogDescription>{t('jobs.configureAvailability')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('jobs.availableForWork')}</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          {enabled && (
            <div className="space-y-4 pl-2 border-l-2 border-primary/20 ml-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">{t('jobs.preferredType')}</Label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPE_KEYS.map(k => <Badge key={k} variant={jobTypes.includes(k) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(jobTypes, setJobTypes, k)}>{t(`jobs.${k}`)}</Badge>)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">{t('jobs.timeAvailability')}</Label>
                <div className="flex flex-wrap gap-2">
                  {JOB_PERIOD_KEYS.map(k => <Badge key={k} variant={periods.includes(k) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(periods, setPeriods, k)}>{t(`jobs.${k}`)}</Badge>)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('agenda.teleconsultation')}</span>
                <Switch checked={teleconsultas} onCheckedChange={setTeleconsultas} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('jobs.showSalaryExpectation')}</span>
                <Switch checked={showSalary} onCheckedChange={setShowSalary} />
              </div>
              {showSalary && (
                <div>
                  <Label className="text-xs">{t('jobs.salaryExpectation')}</Label>
                  <Input type="number" placeholder="Ex: 2500" value={salary} onChange={e => setSalary(e.target.value)} />
                </div>
              )}
              <div>
                <Label className="text-xs">{t('jobs.availableDate')}</Label>
                <Input type="date" value={availableDate} onChange={e => setAvailableDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t('jobs.additionalNote')}</Label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={t('jobs.additionalInfo')} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={() => { toast.success(t('jobs.availabilityUpdated')); onClose(); }}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Publish vacancy panel for clinics
function ClinicPublishPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(true);
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');
  const [salaryValue, setSalaryValue] = useState('');
  const [salaryType, setSalaryType] = useState('monthly');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> {t('jobs.publishVacancy')}</DialogTitle>
          <DialogDescription>{t('jobs.publishVacancyDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('jobs.contractTypeLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_KEYS.map(k => <Badge key={k} variant={contractTypes.includes(k) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(contractTypes, setContractTypes, k)}>{t(`jobs.${k}`)}</Badge>)}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('jobs.soughtSpecialties')}</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_KEYS.map(k => <Badge key={k} variant={specialties.includes(k) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(specialties, setSpecialties, k)}>{t(`specialties.${k}`)}</Badge>)}
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('jobs.schedules')}</Label>
            <Input placeholder={t('jobs.schedulePlaceholder')} value={schedule} onChange={e => setSchedule(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t('jobs.remuneration')}</Label>
              <Input type="number" placeholder={t('jobs.valuePlaceholder')} value={salaryValue} onChange={e => setSalaryValue(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('jobs.salaryType')}</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('jobs.perMonth')}</SelectItem>
                  <SelectItem value="perConsult">{t('jobs.perConsultation')}</SelectItem>
                  <SelectItem value="percent">{t('jobs.percentPerConsult')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-2 block">{t('jobs.benefits')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {BENEFITS_KEYS.map(k => (
                <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={benefits.includes(k)} onCheckedChange={() => toggle(benefits, setBenefits, k)} />
                  {t(`jobs.benefit_${k}`)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('jobs.startDateLabel')}</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{t('jobs.vacancyDescription')}</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t('jobs.describeOpportunity')} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={() => { toast.success(t('jobs.vacancyPublished')); onClose(); }}>{t('jobs.publish')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function JobMarketView({ userRole, onBack, onSendMessage }: JobMarketViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [contractFilter, setContractFilter] = useState('allTypes');
  const [sortBy, setSortBy] = useState('recent');
  const [showManagePanel, setShowManagePanel] = useState(false);

  // Proposal flow state (clinic sending to dentist)
  const [proposalTarget, setProposalTarget] = useState<typeof MOCK_DENTIST_AVAILABILITY[0] | null>(null);
  const [proposalStep, setProposalStep] = useState(1);
  const [proposalData, setProposalData] = useState({
    contractType: '',
    startDate: '',
    duration: 'indefinite',
    durationOther: '',
    weekSchedule: WEEKDAY_KEYS.map(d => ({ day: d, morning: false, afternoon: false, night: false })),
    includesTeleconsultas: false,
    consultasPerDay: '',
    salaryMonthly: '',
    salaryPercentage: '',
    salaryFixed: '',
    bonusTeleconsulta: '',
    benefits: [] as string[],
    notes: '',
    message: '',
  });

  // Apply flow state (dentist applying to clinic)
  const [applyTarget, setApplyTarget] = useState<typeof MOCK_CLINIC_OFFERS[0] | null>(null);

  const filteredOffers = useMemo(() => {
    let results = [...MOCK_CLINIC_OFFERS];
    if (contractFilter !== 'allTypes') results = results.filter(o => o.contractType === contractFilter);
    return results;
  }, [contractFilter]);

  const filteredDentists = useMemo(() => {
    let results = [...MOCK_DENTIST_AVAILABILITY];
    if (contractFilter !== 'allTypes') results = results.filter(d => d.availability === contractFilter);
    return results;
  }, [contractFilter]);

  const resetProposal = () => {
    setProposalTarget(null);
    setProposalStep(1);
    setProposalData({
      contractType: '', startDate: '', duration: 'indefinite', durationOther: '',
      weekSchedule: WEEKDAY_KEYS.map(d => ({ day: d, morning: false, afternoon: false, night: false })),
      includesTeleconsultas: false, consultasPerDay: '', salaryMonthly: '', salaryPercentage: '',
      salaryFixed: '', bonusTeleconsulta: '', benefits: [], notes: '',
      message: '',
    });
  };

  const handleSendProposal = () => {
    toast.success(t('jobs.proposalSent', { name: proposalTarget?.name }));
    resetProposal();
  };

  const handleApply = () => {
    toast.success(t('jobs.applicationSent', { name: applyTarget?.clinicName }));
    setApplyTarget(null);
  };

  // =================== DENTIST VIEW (sees clinic offers) ===================
  if (userRole === 'dentist') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> {t('jobs.title')}
              </h2>
              <p className="text-xs text-muted-foreground">{t('jobs.clinicsLookingForDentists')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowManagePanel(true)}>
            <Settings className="w-3.5 h-3.5" /> {t('jobs.manageAvailability')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={contractFilter} onValueChange={setContractFilter}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder={t('jobs.contractTypeLabel')} /></SelectTrigger>
            <SelectContent>{CONTRACT_TYPE_KEYS.map(k => <SelectItem key={k} value={k}>{t(`jobs.${k}`)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('jobs.mostRecent')}</SelectItem>
              <SelectItem value="salary">{t('jobs.bestSalary')}</SelectItem>
              <SelectItem value="distance">{t('jobs.nearest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clinic offer cards */}
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
          {filteredOffers.map(offer => {
            const initials = getClinicInitials(offer.clinicName);
            const levelCfg = LEVEL_CONFIG[offer.level];
            return (
              <div key={offer.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{offer.clinicName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{offer.rating}</span>
                      <span className={cn('text-[11px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>{t(levelCfg.labelKey)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /><span className="truncate">{offer.location}</span>
                      <span className="ml-1 text-primary font-medium">{offer.distance} km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Badge variant="secondary" className="text-xs">{t(`jobs.${offer.contractType}`)}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /><span>{offer.schedule}</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{offer.salary}</p>
                  <div className="flex flex-wrap gap-1">
                    {offer.specialties.map(s => <span key={s} className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{t(`specialties.${s}`)}</span>)}
                  </div>
                  {offer.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {offer.benefits.map(b => <span key={b} className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t(`jobs.benefit_${b}`)}</span>)}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">{t(`jobs.published_${offer.publishedAgo}`)}</p>
                </div>

                <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                  <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => setApplyTarget(offer)}>
                    <Send className="w-3 h-3" /> {t('jobs.apply')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(offer.clinicName); toast.info(t('jobs.messagingSoon')); }}>
                    <MessageCircle className="w-3 h-3" /> {t('jobs.sendMessage')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply modal */}
        <Dialog open={!!applyTarget} onOpenChange={() => setApplyTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('jobs.applyTitle')}</DialogTitle>
              <DialogDescription>{t('jobs.applyDesc', { name: applyTarget?.clinicName })}</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t('jobs.applyNote')}</p>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setApplyTarget(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleApply}>{t('jobs.sendApplication')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DentistManagePanel open={showManagePanel} onClose={() => setShowManagePanel(false)} />
      </div>
    );
  }

  // =================== CLINIC VIEW (sees dentist availability) ===================
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> {t('jobs.title')}
            </h2>
            <p className="text-xs text-muted-foreground">{t('jobs.dentistsAvailable')}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowManagePanel(true)}>
          <Settings className="w-3.5 h-3.5" /> {t('jobs.publishVacancy')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={contractFilter} onValueChange={setContractFilter}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder={t('jobs.timeAvailability')} /></SelectTrigger>
          <SelectContent>{CONTRACT_TYPE_KEYS.map(k => <SelectItem key={k} value={k}>{t(`jobs.${k}`)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('jobs.mostRecent')}</SelectItem>
            <SelectItem value="rating">{t('jobs.bestRating')}</SelectItem>
            <SelectItem value="distance">{t('jobs.nearest')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dentist availability cards */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        {filteredDentists.map(d => {
          const initials = getDentistInitials(d.name);
          const photo = DENTIST_AVATAR_PHOTOS[d.dentistId];
          const levelCfg = LEVEL_CONFIG[d.level];
          return (
            <div key={d.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                {photo ? (
                  <img src={photo} alt={d.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{d.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{d.rating}</span>
                    <span className={cn('text-[11px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>{t(levelCfg.labelKey)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1">
                  {d.specialties.map(s => <span key={s} className="text-[11px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{t(`specialties.${s}`)}</span>)}
                </div>
                <Badge variant="secondary" className="text-xs">{t(`jobs.${d.availability}`)} — {t(`jobs.avail_${d.availabilityDetail}`)}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /><span>{d.schedule}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t('jobs.yearsExperience', { count: d.experience })}</p>
                {d.teleconsultas ? (
                  <p className="text-[11px] text-primary font-medium">📱 {t('jobs.availableForTeleconsultas')} ✅</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">📱 {t('agenda.teleconsultation')} ❌</p>
                )}
                {d.salary && <p className="text-sm font-semibold text-primary">{d.salary}</p>}
                <p className="text-[11px] text-muted-foreground">📅 {t('jobs.availableSince')}: {d.availableDate}</p>
                <p className="text-[11px] text-muted-foreground">{t(`jobs.published_${d.publishedAgo}`)}</p>
              </div>

              <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => {
                  setProposalTarget(d);
                  setProposalStep(1);
                }}>
                  <Users className="w-3 h-3" /> {t('jobs.sendProposal')}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(d.name); toast.info(t('jobs.messagingSoon')); }}>
                  <MessageCircle className="w-3 h-3" /> {t('jobs.sendMessage')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-step proposal flow */}
      <Dialog open={!!proposalTarget} onOpenChange={() => resetProposal()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              {t('jobs.sendProposal')} — {t('prescription.step', { current: proposalStep, total: 5 })}
            </DialogTitle>
            <DialogDescription>
              {proposalStep === 1 && t('jobs.confirmDentist')}
              {proposalStep === 2 && t('jobs.contractTypeLabel')}
              {proposalStep === 3 && t('jobs.schedules')}
              {proposalStep === 4 && t('jobs.financialProposal')}
              {proposalStep === 5 && t('jobs.summaryAndSend')}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Confirm dentist */}
          {proposalStep === 1 && proposalTarget && (
            <div className="space-y-4">
              <div className={cn('p-3 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-3')}>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                  {getDentistInitials(proposalTarget.name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{proposalTarget.name}</p>
                  <p className="text-xs text-muted-foreground">{proposalTarget.specialties.map(s => t(`specialties.${s}`)).join(', ')}</p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}

          {/* Step 2: Contract type */}
          {proposalStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['fullTime', 'partTime', 'freelancer', 'temporaryReplacement'].map(k => (
                  <button key={k} onClick={() => setProposalData(p => ({ ...p, contractType: k }))}
                    className={cn('p-3 rounded-xl border text-sm font-medium transition-colors text-left',
                      proposalData.contractType === k ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    {t(`jobs.${k}`)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t('jobs.preferredStartDate')}</Label>
                  <Input type="date" value={proposalData.startDate} onChange={e => setProposalData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{t('jobs.durationLabel')}</Label>
                  <Select value={proposalData.duration} onValueChange={v => setProposalData(p => ({ ...p, duration: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinite">{t('jobs.indefinite')}</SelectItem>
                      <SelectItem value="6months">{t('jobs.sixMonths')}</SelectItem>
                      <SelectItem value="1year">{t('jobs.oneYear')}</SelectItem>
                      <SelectItem value="other">{t('jobs.otherDuration')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {proposalData.duration === 'other' && (
                <Input placeholder={t('jobs.specifyDuration')} value={proposalData.durationOther} onChange={e => setProposalData(p => ({ ...p, durationOther: e.target.value }))} />
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {proposalStep === 3 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr><th className="text-left p-1"></th>{TIME_PERIOD_KEYS.map(p => <th key={p} className="p-1 text-center text-muted-foreground">{t(`jobs.${p}`)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {proposalData.weekSchedule.map((ws, i) => (
                      <tr key={ws.day}>
                        <td className="p-1 font-medium">{t(`common.weekdays.${ws.day}`)}</td>
                        {(['morning', 'afternoon', 'night'] as const).map(period => (
                          <td key={period} className="p-1 text-center">
                            <button onClick={() => {
                              const updated = [...proposalData.weekSchedule];
                              updated[i] = { ...updated[i], [period]: !updated[i][period] };
                              setProposalData(p => ({ ...p, weekSchedule: updated }));
                            }} className={cn('w-8 h-8 rounded-lg border transition-colors',
                              ws[period] ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent')}>
                              {ws[period] ? '✓' : ''}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('jobs.includesTeleconsult')}</span>
                <Switch checked={proposalData.includesTeleconsultas} onCheckedChange={v => setProposalData(p => ({ ...p, includesTeleconsultas: v }))} />
              </div>
              <div>
                <Label className="text-xs">{t('jobs.estimatedConsultsDay')}</Label>
                <Input type="number" value={proposalData.consultasPerDay} onChange={e => setProposalData(p => ({ ...p, consultasPerDay: e.target.value }))} placeholder="Ex: 8" />
              </div>
            </div>
          )}

          {/* Step 4: Financial */}
          {proposalStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t('jobs.grossMonthlySalary')}</Label>
                  <Input type="number" value={proposalData.salaryMonthly} onChange={e => setProposalData(p => ({ ...p, salaryMonthly: e.target.value }))} placeholder={t('jobs.optional')} />
                </div>
                <div>
                  <Label className="text-xs">{t('jobs.percentPerConsultLabel')}</Label>
                  <Input type="number" value={proposalData.salaryPercentage} onChange={e => setProposalData(p => ({ ...p, salaryPercentage: e.target.value }))} placeholder={t('jobs.optional')} />
                </div>
                <div>
                  <Label className="text-xs">{t('jobs.fixedPerConsultLabel')}</Label>
                  <Input type="number" value={proposalData.salaryFixed} onChange={e => setProposalData(p => ({ ...p, salaryFixed: e.target.value }))} placeholder={t('jobs.optional')} />
                </div>
                <div>
                  <Label className="text-xs">{t('jobs.teleconsultBonus')}</Label>
                  <Input type="number" value={proposalData.bonusTeleconsulta} onChange={e => setProposalData(p => ({ ...p, bonusTeleconsulta: e.target.value }))} placeholder={t('jobs.optional')} />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">{t('jobs.benefits')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BENEFITS_KEYS.map(k => (
                    <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox checked={proposalData.benefits.includes(k)} onCheckedChange={() => {
                        setProposalData(p => ({
                          ...p, benefits: p.benefits.includes(k) ? p.benefits.filter(x => x !== k) : [...p.benefits, k]
                        }));
                      }} />
                      {t(`jobs.benefit_${k}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">{t('jobs.additionalNotes')}</Label>
                <Textarea value={proposalData.notes} onChange={e => setProposalData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder={t('jobs.optional')} />
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {proposalStep === 5 && proposalTarget && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">{t('statistics.dentist')}:</span> <span className="font-semibold">{proposalTarget.name}</span></p>
                {proposalData.contractType && <p><span className="text-muted-foreground">{t('jobs.contractTypeLabel')}:</span> {t(`jobs.${proposalData.contractType}`)}</p>}
                {proposalData.startDate && <p><span className="text-muted-foreground">{t('jobs.startDateLabel')}:</span> {proposalData.startDate}</p>}
                {proposalData.duration && <p><span className="text-muted-foreground">{t('jobs.durationLabel')}:</span> {proposalData.duration === 'other' ? proposalData.durationOther : t(`jobs.${proposalData.duration === 'indefinite' ? 'indefinite' : proposalData.duration === '6months' ? 'sixMonths' : 'oneYear'}`)}</p>}
                {proposalData.salaryMonthly && <p><span className="text-muted-foreground">{t('jobs.grossMonthlySalary')}:</span> €{proposalData.salaryMonthly}/{t('plan.month')}</p>}
                {proposalData.salaryPercentage && <p><span className="text-muted-foreground">{t('jobs.percentPerConsultLabel')}:</span> {proposalData.salaryPercentage}%</p>}
                {proposalData.salaryFixed && <p><span className="text-muted-foreground">{t('jobs.fixedPerConsultLabel')}:</span> €{proposalData.salaryFixed}</p>}
                {proposalData.benefits.length > 0 && <p><span className="text-muted-foreground">{t('jobs.benefits')}:</span> {proposalData.benefits.map(k => t(`jobs.benefit_${k}`)).join(', ')}</p>}
              </div>
              <div>
                <Label className="text-xs">{t('jobs.personalMessage')}</Label>
                <Textarea value={proposalData.message} onChange={e => setProposalData(p => ({ ...p, message: e.target.value }))} rows={3} />
              </div>
              <p className="text-[11px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                ⚠️ {t('jobs.proposalWarning')}
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            {proposalStep > 1 && (
              <Button variant="outline" onClick={() => setProposalStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> {t('common.back')}
              </Button>
            )}
            {proposalStep < 5 ? (
              <Button onClick={() => setProposalStep(s => s + 1)} className="gap-1 ml-auto">
                {t('prescription.next')} <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSendProposal} className="gap-1 ml-auto">
                <Send className="w-4 h-4" /> {t('jobs.sendProposal')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClinicPublishPanel open={showManagePanel} onClose={() => setShowManagePanel(false)} />
    </div>
  );
}
