import { useState, useMemo } from 'react';
import { ArrowLeft, Briefcase, MapPin, Star, Clock, Calendar, MessageCircle, Users, Send, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDentistInitials, getClinicInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';
import { UserRole } from '@/types/calendar';
import { toast } from 'sonner';

// Mock job data - clinic offers (seen by dentists)
const MOCK_CLINIC_OFFERS = [
  {
    id: 'co1', clinicId: '1', clinicName: 'Clínica SmileCheck', rating: 4.8, level: 'gold' as const,
    location: 'Av. da Liberdade 120, Lisboa', distance: 2.1,
    contractType: 'Tempo Parcial', schedule: 'Seg-Qua-Sex 09:00-13:00',
    salary: '35% por consulta', specialties: ['Generalista'],
    benefits: ['Seguro', 'Formação'], publishedAgo: 'há 2 dias',
  },
  {
    id: 'co2', clinicId: '2', clinicName: 'Clínica Mitry-Mory', rating: 4.5, level: 'silver' as const,
    location: 'Rue de Paris 45, Mitry-Mory', distance: 5.3,
    contractType: 'Tempo Inteiro', schedule: 'Seg-Sex 09:00-19:00',
    salary: '€3.200/mês', specialties: ['Cirurgia', 'Endodontia'],
    benefits: ['Seguro', 'Estacionamento', 'Congressos'], publishedAgo: 'há 5 dias',
  },
  {
    id: 'co3', clinicId: '3', clinicName: 'Clínica Montfermeil', rating: 4.3, level: 'bronze' as const,
    location: 'Av. Jean Moulin 12, Montfermeil', distance: 8.0,
    contractType: 'Freelancer', schedule: 'Sáb 09:00-14:00',
    salary: '€30/consulta', specialties: ['Ortodontia'],
    benefits: [], publishedAgo: 'há 1 semana',
  },
];

// Mock dentist availability (seen by clinics)
const MOCK_DENTIST_AVAILABILITY = [
  {
    id: 'da1', dentistId: '4', name: 'Dr. Fábio Lobo', rating: 4.6, level: 'gold' as const,
    specialties: ['Cirurgia', 'Prótese', 'Implantologia'],
    availability: 'Tempo Parcial', availabilityDetail: 'Tardes disponíveis',
    schedule: 'Seg-Qua-Sex 14:00-20:00', experience: '12 anos de experiência',
    teleconsultas: true, salary: '', publishedAgo: 'há 3 dias',
  },
  {
    id: 'da2', dentistId: '7', name: 'Dra. Catarina Fernandes', rating: 4.4, level: 'silver' as const,
    specialties: ['Ortodontia', 'Odontopediatria'],
    availability: 'Freelancer', availabilityDetail: 'Sábados',
    schedule: 'Sáb 09:00-14:00', experience: '6 anos de experiência',
    teleconsultas: false, salary: '', publishedAgo: 'há 1 semana',
  },
  {
    id: 'da3', dentistId: '5', name: 'Dr. Frederico Cardoso', rating: 4.7, level: 'gold' as const,
    specialties: ['Cirurgia', 'Prótese'],
    availability: 'Tempo Inteiro', availabilityDetail: 'Seg-Sex',
    schedule: 'Seg-Sex 09:00-19:00', experience: '15 anos de experiência',
    teleconsultas: true, salary: 'A partir de €3.000/mês', publishedAgo: 'há 2 dias',
  },
];

const CONTRACT_TYPES = ['Todos', 'Tempo Inteiro', 'Tempo Parcial', 'Freelancer', 'Substituição'];
const BENEFITS_OPTIONS = ['Seguro de saúde', 'Formação contínua paga', 'Participação em congressos', 'Material clínico incluído', 'Estacionamento', 'Alimentação'];
const WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const TIME_PERIODS = ['Manhã', 'Tarde', 'Noite'];

interface JobMarketViewProps {
  userRole: UserRole;
  onBack: () => void;
  onSendMessage?: (name: string) => void;
}

export function JobMarketView({ userRole, onBack, onSendMessage }: JobMarketViewProps) {
  const isMobile = useIsMobile();
  const [contractFilter, setContractFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');

  // Proposal flow state (clinic sending to dentist)
  const [proposalTarget, setProposalTarget] = useState<typeof MOCK_DENTIST_AVAILABILITY[0] | null>(null);
  const [proposalStep, setProposalStep] = useState(1);
  const [proposalData, setProposalData] = useState({
    contractType: '',
    startDate: '',
    duration: 'Indefinido',
    durationOther: '',
    weekSchedule: WEEKDAYS_SHORT.map(d => ({ day: d, morning: false, afternoon: false, night: false })),
    includesTeleconsultas: false,
    consultasPerDay: '',
    salaryMonthly: '',
    salaryPercentage: '',
    salaryFixed: '',
    bonusTeleconsulta: '',
    benefits: [] as string[],
    notes: '',
    message: 'Gostaríamos de convidá-lo a juntar-se à nossa equipa.',
  });

  // Apply flow state (dentist applying to clinic)
  const [applyTarget, setApplyTarget] = useState<typeof MOCK_CLINIC_OFFERS[0] | null>(null);

  const filteredOffers = useMemo(() => {
    let results = [...MOCK_CLINIC_OFFERS];
    if (contractFilter !== 'Todos') results = results.filter(o => o.contractType === contractFilter);
    return results;
  }, [contractFilter]);

  const filteredDentists = useMemo(() => {
    let results = [...MOCK_DENTIST_AVAILABILITY];
    if (contractFilter !== 'Todos') results = results.filter(d => d.availability === contractFilter);
    return results;
  }, [contractFilter]);

  const resetProposal = () => {
    setProposalTarget(null);
    setProposalStep(1);
    setProposalData({
      contractType: '', startDate: '', duration: 'Indefinido', durationOther: '',
      weekSchedule: WEEKDAYS_SHORT.map(d => ({ day: d, morning: false, afternoon: false, night: false })),
      includesTeleconsultas: false, consultasPerDay: '', salaryMonthly: '', salaryPercentage: '',
      salaryFixed: '', bonusTeleconsulta: '', benefits: [], notes: '',
      message: 'Gostaríamos de convidá-lo a juntar-se à nossa equipa.',
    });
  };

  const handleSendProposal = () => {
    toast.success(`Proposta enviada a ${proposalTarget?.name}! Receberá uma notificação quando houver resposta.`);
    resetProposal();
  };

  const handleApply = () => {
    toast.success(`Candidatura enviada a ${applyTarget?.clinicName}!`);
    setApplyTarget(null);
  };

  // =================== DENTIST VIEW (sees clinic offers) ===================
  if (userRole === 'dentist') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Propostas de Trabalho
            </h2>
            <p className="text-xs text-muted-foreground">Clínicas à procura de dentistas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={contractFilter} onValueChange={setContractFilter}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Tipo de contrato" /></SelectTrigger>
            <SelectContent>{CONTRACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="salary">Melhor remuneração</SelectItem>
              <SelectItem value="distance">Mais próximo</SelectItem>
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
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>{levelCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /><span className="truncate">{offer.location}</span>
                      <span className="ml-1 text-primary font-medium">{offer.distance} km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Badge variant="secondary" className="text-xs">{offer.contractType}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /><span>{offer.schedule}</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{offer.salary}</p>
                  <div className="flex flex-wrap gap-1">
                    {offer.specialties.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{s}</span>)}
                  </div>
                  {offer.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {offer.benefits.map(b => <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{b}</span>)}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">{offer.publishedAgo}</p>
                </div>

                <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                  <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => setApplyTarget(offer)}>
                    <Send className="w-3 h-3" /> Candidatar-me
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(offer.clinicName); toast.info('Funcionalidade de mensagens em breve!'); }}>
                    <MessageCircle className="w-3 h-3" /> Enviar Mensagem
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
              <DialogTitle>Candidatar-me</DialogTitle>
              <DialogDescription>Enviar candidatura para {applyTarget?.clinicName}?</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">A sua candidatura será enviada com o seu perfil profissional.</p>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setApplyTarget(null)}>Cancelar</Button>
              <Button onClick={handleApply}>Enviar Candidatura</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // =================== CLINIC VIEW (sees dentist availability) ===================
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Propostas de Trabalho
          </h2>
          <p className="text-xs text-muted-foreground">Dentistas disponíveis</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={contractFilter} onValueChange={setContractFilter}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Disponibilidade" /></SelectTrigger>
          <SelectContent>{CONTRACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="rating">Melhor rating</SelectItem>
            <SelectItem value="distance">Mais próximo</SelectItem>
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
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>{levelCfg.label}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1">
                  {d.specialties.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{s}</span>)}
                </div>
                <Badge variant="secondary" className="text-xs">{d.availability} — {d.availabilityDetail}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /><span>{d.schedule}</span>
                </div>
                <p className="text-xs text-muted-foreground">{d.experience}</p>
                {d.teleconsultas && <p className="text-[10px] text-primary font-medium">📱 Disponível para teleconsultas</p>}
                {d.salary && <p className="text-sm font-semibold text-primary">{d.salary}</p>}
                <p className="text-[10px] text-muted-foreground">{d.publishedAgo}</p>
              </div>

              <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => {
                  setProposalTarget(d);
                  setProposalStep(1);
                }}>
                  <Users className="w-3 h-3" /> Enviar Proposta
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
                  <MessageCircle className="w-3 h-3" /> Enviar Mensagem
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
              Enviar Proposta — Passo {proposalStep} de 5
            </DialogTitle>
            <DialogDescription>
              {proposalStep === 1 && 'Confirmar dentista'}
              {proposalStep === 2 && 'Tipo de contrato'}
              {proposalStep === 3 && 'Horários'}
              {proposalStep === 4 && 'Proposta financeira'}
              {proposalStep === 5 && 'Resumo e enviar'}
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
                  <p className="text-xs text-muted-foreground">{proposalTarget.specialties.join(', ')}</p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}

          {/* Step 2: Contract type */}
          {proposalStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['Tempo Inteiro', 'Tempo Parcial', 'Freelancer', 'Substituição Temporária'].map(t => (
                  <button key={t} onClick={() => setProposalData(p => ({ ...p, contractType: t }))}
                    className={cn('p-3 rounded-xl border text-sm font-medium transition-colors text-left',
                      proposalData.contractType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Data de início pretendida</Label>
                  <Input type="date" value={proposalData.startDate} onChange={e => setProposalData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Duração</Label>
                  <Select value={proposalData.duration} onValueChange={v => setProposalData(p => ({ ...p, duration: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indefinido">Indefinido</SelectItem>
                      <SelectItem value="6 meses">6 meses</SelectItem>
                      <SelectItem value="1 ano">1 ano</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {proposalData.duration === 'Outro' && (
                <Input placeholder="Especificar duração..." value={proposalData.durationOther} onChange={e => setProposalData(p => ({ ...p, durationOther: e.target.value }))} />
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {proposalStep === 3 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr><th className="text-left p-1"></th>{TIME_PERIODS.map(p => <th key={p} className="p-1 text-center text-muted-foreground">{p}</th>)}</tr>
                  </thead>
                  <tbody>
                    {proposalData.weekSchedule.map((ws, i) => (
                      <tr key={ws.day}>
                        <td className="p-1 font-medium">{ws.day}</td>
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
                <span className="text-sm">Inclui teleconsultas?</span>
                <Switch checked={proposalData.includesTeleconsultas} onCheckedChange={v => setProposalData(p => ({ ...p, includesTeleconsultas: v }))} />
              </div>
              <div>
                <Label className="text-xs">Nº estimado de consultas/dia</Label>
                <Input type="number" value={proposalData.consultasPerDay} onChange={e => setProposalData(p => ({ ...p, consultasPerDay: e.target.value }))} placeholder="Ex: 8" />
              </div>
            </div>
          )}

          {/* Step 4: Financial */}
          {proposalStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Salário mensal bruto (€)</Label>
                  <Input type="number" value={proposalData.salaryMonthly} onChange={e => setProposalData(p => ({ ...p, salaryMonthly: e.target.value }))} placeholder="Opcional" />
                </div>
                <div>
                  <Label className="text-xs">% por consulta</Label>
                  <Input type="number" value={proposalData.salaryPercentage} onChange={e => setProposalData(p => ({ ...p, salaryPercentage: e.target.value }))} placeholder="Opcional" />
                </div>
                <div>
                  <Label className="text-xs">Valor fixo/consulta (€)</Label>
                  <Input type="number" value={proposalData.salaryFixed} onChange={e => setProposalData(p => ({ ...p, salaryFixed: e.target.value }))} placeholder="Opcional" />
                </div>
                <div>
                  <Label className="text-xs">Bónus teleconsulta (€)</Label>
                  <Input type="number" value={proposalData.bonusTeleconsulta} onChange={e => setProposalData(p => ({ ...p, bonusTeleconsulta: e.target.value }))} placeholder="Opcional" />
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">Benefícios</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BENEFITS_OPTIONS.map(b => (
                    <label key={b} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={proposalData.benefits.includes(b)} onChange={() => {
                        setProposalData(p => ({
                          ...p, benefits: p.benefits.includes(b) ? p.benefits.filter(x => x !== b) : [...p.benefits, b]
                        }));
                      }} className="rounded" />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Notas adicionais</Label>
                <Textarea value={proposalData.notes} onChange={e => setProposalData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Opcional..." />
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {proposalStep === 5 && proposalTarget && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Dentista:</span> <span className="font-semibold">{proposalTarget.name}</span></p>
                {proposalData.contractType && <p><span className="text-muted-foreground">Contrato:</span> {proposalData.contractType}</p>}
                {proposalData.startDate && <p><span className="text-muted-foreground">Início:</span> {proposalData.startDate}</p>}
                {proposalData.duration && <p><span className="text-muted-foreground">Duração:</span> {proposalData.duration === 'Outro' ? proposalData.durationOther : proposalData.duration}</p>}
                {proposalData.salaryMonthly && <p><span className="text-muted-foreground">Salário:</span> €{proposalData.salaryMonthly}/mês</p>}
                {proposalData.salaryPercentage && <p><span className="text-muted-foreground">Percentagem:</span> {proposalData.salaryPercentage}%</p>}
                {proposalData.salaryFixed && <p><span className="text-muted-foreground">Valor/consulta:</span> €{proposalData.salaryFixed}</p>}
                {proposalData.benefits.length > 0 && <p><span className="text-muted-foreground">Benefícios:</span> {proposalData.benefits.join(', ')}</p>}
              </div>
              <div>
                <Label className="text-xs">Mensagem pessoal</Label>
                <Textarea value={proposalData.message} onChange={e => setProposalData(p => ({ ...p, message: e.target.value }))} rows={3} />
              </div>
              <p className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                ⚠️ Esta proposta será enviada ao dentista. Poderá aceitar, recusar ou propor alterações.
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            {proposalStep > 1 && (
              <Button variant="outline" onClick={() => setProposalStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            {proposalStep < 5 ? (
              <Button onClick={() => setProposalStep(s => s + 1)} className="gap-1 ml-auto">
                Seguinte <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSendProposal} className="gap-1 ml-auto">
                <Send className="w-4 h-4" /> Enviar Proposta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
