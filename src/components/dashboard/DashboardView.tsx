import { useMemo } from 'react';
import { Star, Calendar, Video, Users, Clock, Trophy, Flame, Award, CheckCircle2, AlertTriangle, Search, Bell, BarChart3, Heart, Gift } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserRole, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, ConsultationStatus, ConsultationCategory, getCategoryTextStyle } from '@/types/calendar';
import { ConfirmationStatus } from '@/types/scoring';
import { mockConsultations, mockDentists, mockClinics, mockFamilyMembers, mockPatientConsultations, getDentistsForClinic } from '@/data/mockData';
import { mockConfirmations } from '@/types/scoring';
import { isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientScoreHistory } from './PatientScoreHistory';

interface DashboardViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onStartTriage?: () => void;
  onViewFullHistory?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 19) return 'Boa tarde';
  return 'Boa noite';
}

function getUserName(role: UserRole): string {
  switch (role) {
    case 'dentist':return `Dr. ${mockDentists[0].name.split(' ')[1]}`;
    case 'clinic':return mockClinics[0].name;
    case 'patient':return mockFamilyMembers[0].name.split(' ')[0];
  }
}

const DEMO_DATE = new Date(2026, 0, 31);

// Mock waiting list data
const MOCK_WAITING_LIST = [
{ id: 'wl-1', patientName: 'Rita Oliveira', detail: 'Quer antecipar', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true },
{ id: 'wl-2', patientName: 'Bruno Pereira', detail: 'Disponível 2ª e 4ª', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false },
{ id: 'wl-3', patientName: 'Sofia Lopes', detail: 'Qualquer horário manhã', currentDate: '7 Fev', currentTime: '16:30', priority: 'normal' as const, isUrgent: false }];


export function DashboardView({ userRole, onNavigate, onStartTriage, onViewFullHistory }: DashboardViewProps) {
  const greeting = getGreeting();
  const userName = getUserName(userRole);

  const todayConsultations = useMemo(() =>
  mockConsultations.filter((c) => isSameDay(c.date, DEMO_DATE)),
  []);

  const stats = useMemo(() => {
    if (userRole === 'patient') {
      return [
      { label: 'Próxima Consulta', value: '31 Jan', icon: Calendar },
      { label: 'Nível', value: 'Bronze', icon: Award },
      { label: 'Pontos', value: '450', icon: Trophy },
      { label: 'Streak', value: '7 dias', icon: Flame }];
    }
    if (userRole === 'dentist') {
      const dentistCons = todayConsultations.filter((c) => c.dentist.id === mockDentists[0].id).sort((a, b) => a.time.localeCompare(b.time));
      const next = dentistCons[0];
      return [
      { label: 'Próxima Consulta', value: next ? next.time : '—', subtitle: next ? next.patient.name : '', icon: Calendar },
      { label: 'Nível', value: 'Prata', icon: Award },
      { label: 'Pontos', value: '1 250', icon: Trophy },
      { label: 'Streak', value: '14 dias', icon: Flame }];
    }
    if (userRole === 'clinic') {
      const pres = todayConsultations.filter((c) => c.type === 'presencial').length;
      const tele = todayConsultations.filter((c) => c.type === 'teleconsulta').length;
      return [
      { label: 'Consultas de Hoje', value: '54', subtitle: `40 Presenciais · 14 Teleconsultas`, icon: Calendar },
      { label: 'Nível', value: 'Ouro', icon: Award },
      { label: 'Pontos', value: '3 800', icon: Trophy },
      { label: 'Streak', value: '30 dias', icon: Flame }];
    }
    return null;
  }, [userRole, todayConsultations]);

  const quickActions = useMemo(() => {
    switch (userRole) {
      case 'dentist':
        return [
        { label: 'Ver Agenda de Hoje', icon: Calendar, action: () => onNavigate('agenda') },
        { label: 'Pesquisar', icon: Search, action: () => onNavigate('pesquisa') },
        { label: 'Ver Todas as Notificações', icon: Bell, action: () => onNavigate('notificacoes') }];

      case 'clinic':
        return [
        { label: 'Ver Agenda Completa', icon: Calendar, action: () => onNavigate('agenda') },
        { label: 'Gerir Equipa', icon: Users, action: () => onNavigate('equipa') },
        { label: 'Ver Estatísticas', icon: BarChart3, action: () => onNavigate('estatisticas') }];

      case 'patient':
        return [
        { label: 'Marcar Consulta', icon: Calendar, action: () => onStartTriage?.() },
        { label: 'Ver Recompensas', icon: Trophy, action: () => onNavigate('loja') },
        { label: 'Minha Saúde', icon: Star, action: () => onNavigate('saude') }];

    }
  }, [userRole, onNavigate, onStartTriage]);

  // Shared stats cards renderer
  const renderStatsCards = () => {
    if (!stats) return null;
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card/80 backdrop-blur border-border min-w-0">
              <CardContent className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-2 min-w-0">
                <div className="flex items-center text-muted-foreground min-w-0 gap-[10px]">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] font-medium truncate sm:text-xl">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-foreground truncate sm:text-3xl">{stat.value}</span>
                {'subtitle' in stat && stat.subtitle && (
                  <span className="text-[10px] text-muted-foreground truncate sm:text-xs">
                    {String(stat.subtitle).split('·').map((part, i) => {
                      const trimmed = part.trim();
                      const isPresencial = trimmed.includes('Presenciais');
                      const isTeleconsulta = trimmed.includes('Teleconsultas');
                      return (
                        <span key={i}>
                          {i > 0 && <span className="text-muted-foreground"> · </span>}
                          <span className={isPresencial ? 'text-presencial font-medium' : isTeleconsulta ? 'text-teleconsulta font-medium' : ''}>
                            {trimmed}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                )}
              </CardContent>
            </Card>);

        })}
      </div>);

  };

  // Status badge helper
  const getStatusBadge = (status?: string) => {
    const configs: Record<string, {label: string;className: string;}> = {
      confirmada: { label: 'Confirmada', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      em_sala_espera: { label: 'Em sala de espera', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      em_consulta: { label: 'Em consulta', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      visto: { label: 'Visto', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      falta_justificada: { label: 'Falta justificada', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
      falta_nao_justificada: { label: 'Falta', className: 'bg-red-500/15 text-red-400 border-red-500/30' }
    };
    const cfg = status ? configs[status] : null;
    return (
      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${cfg?.className || 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
        {cfg?.label || 'Agendada'}
      </Badge>);

  };

  // Abbreviate name: "Maria Silva" → "Maria S."
  const abbreviateName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // Confirmation indicator
  const confirmIndicator = (status: ConfirmationStatus, isIrrelevant = false) => {
    if (isIrrelevant) return <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">—</span>;
    if (status === 'confirmed') return <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">✓</span>;
    if (status === 'declined') return <span className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-[10px] text-red-400 font-bold">✗</span>;
    return <span className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center text-[10px] text-orange-400 font-bold">●</span>;
  };

  // ─── Dentist dashboard ───
  const renderDentistDashboard = () => {
    const dentistCons = todayConsultations.
    filter((c) => c.dentist.id === mockDentists[0].id).
    sort((a, b) => a.time.localeCompare(b.time));

    // Morning consultations (before 13:00)
    const morningCons = dentistCons.filter((c) => c.time < '13:00');

    const dentistConfirmations = mockConfirmations.filter((c) => c.dentistName === mockDentists[0].name);

    return (
      <div className="space-y-6">
        {renderStatsCards()}

        {/* 3-column grid: 50% + 25% + 25% */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* LEFT: Consultas de Hoje (spans 2 cols) */}
          <Card className="bg-card/80 border-border lg:col-span-2 flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Consultas de Hoje</h3>
                <Badge variant="outline" className="text-[10px]">{dentistCons.length} total</Badge>
              </div>
              <div className="space-y-0 flex-1 overflow-y-auto md:overflow-y-hidden">
                {morningCons.map((c) => {
                  const catColor = c.category ? CATEGORY_COLORS[c.category] : null;
                  const catLabel = c.category ? CATEGORY_LABELS[c.category] : c.type;
                  return (
                    <div key={c.id} className="grid grid-cols-[40px_1fr_1fr_auto] items-center gap-2 py-1.5 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded transition-colors cursor-pointer">
                      <span className="text-xs font-bold text-primary">{c.time}</span>
                      <span className="text-xs text-foreground truncate min-w-0">
                        <ClickablePatientName name={c.patient.name} patientId={c.patient.id} className="text-xs text-foreground" />
                      </span>
                      <span className="text-[10px] truncate text-left">
                        <span className="font-medium" style={getCategoryTextStyle(catColor?.hex || '')}>{catLabel}</span>
                        <span className="text-muted-foreground"> — {c.duration}min</span>
                      </span>
                      {getStatusBadge(c.status)}
                    </div>);

                })}
              </div>
              <button className="text-xs text-primary hover:underline w-full text-left mt-2" onClick={() => onNavigate('agenda')}>
                Ver agenda completa ›
              </button>
            </CardContent>
          </Card>

          {/* CENTER: Confirmações — stretches to match left card */}
          <Card className="bg-card/80 border-border flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Confirmações</h3>
                <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Ao vivo
                </Badge>
              </div>
              {/* Header row */}
              <div className="flex items-center justify-end gap-3 pb-1 border-b border-border/50">
                <span className="text-[10px] font-semibold text-muted-foreground w-5 text-center">24h</span>
                <span className="text-[10px] font-semibold text-muted-foreground w-5 text-center">1h</span>
              </div>
              <div className="space-y-1.5 flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {dentistConfirmations.map((c) => {
                  const catColor = c.category ? CATEGORY_COLORS[c.category as ConsultationCategory] : null;
                  const catLabel = c.category ? CATEGORY_LABELS[c.category as ConsultationCategory] : '';
                  return (
                    <div key={c.consultationId} className="flex items-center gap-2 py-1">
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                        {catLabel &&
                        <>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">—</span>
                                <span className="text-[10px] font-medium truncate flex-shrink-0" style={getCategoryTextStyle(catColor?.hex || '')}>{catLabel}</span>
                          </>
                        }
                      </div>
                      {confirmIndicator(c.status24h)}
                      {confirmIndicator(c.status1h, c.isNoShow === true)}
                    </div>);

                })}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="confirmacoes"]')?.click(), 100);}}>
                
                Ver Tudo →
              </button>
            </CardContent>
          </Card>

          {/* RIGHT: Lista de Espera */}
          <Card className="bg-card/80 border-border flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Lista de Espera</h3>
                <Badge variant="outline" className="text-[10px]">{MOCK_WAITING_LIST.length}</Badge>
              </div>
              <div className="space-y-0 flex-1">
                {MOCK_WAITING_LIST.map((wl) =>
                <div key={wl.id} className="flex items-center gap-1.5 py-1 border-b border-border/50 last:border-0">
                    <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">— {wl.detail}</span>
                  </div>
                )}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="lista_espera"]')?.click(), 100);}}>
                
                Ver Tudo →
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Full width: Score history */}
        <PatientScoreHistory mode="history-only" userRole="dentist" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
      </div>);

  };

  // ─── Clinic dashboard ───
  const renderClinicDashboard = () => {
    const clinicDentists = getDentistsForClinic('1');
    const presCount = todayConsultations.filter((c) => c.type === 'presencial').length;
    const teleCount = todayConsultations.filter((c) => c.type === 'teleconsulta').length;


    // Group confirmations by dentist
    const confirmationsByDentist = clinicDentists.map((d) => ({
      dentist: d,
      confirmations: mockConfirmations.filter((c) => c.dentistName === d.name)
    })).filter((g) => g.confirmations.length > 0);

    // Mock waitlist grouped by dentist
    const CLINIC_WAITLIST: Record<string, typeof MOCK_WAITING_LIST> = {
      'Dr. Gonçalo Pipo': [
      { id: 'cwl-1', patientName: 'Rita Oliveira', detail: 'Quer antecipar', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-2', patientName: 'Bruno Pereira', detail: 'Disponível 2ª e 4ª', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-3', patientName: 'André Gomes', detail: 'Qualquer horário manhã', currentDate: '6 Fev', currentTime: '09:00', priority: 'normal' as const, isUrgent: false }],

      'Dr. Alexandre Bernardo': [
      { id: 'cwl-4', patientName: 'Sofia Lopes', detail: 'Quer antecipar', currentDate: '4 Fev', currentTime: '11:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-5', patientName: 'Helena Nunes', detail: 'Disponível tardes', currentDate: '7 Fev', currentTime: '15:00', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-6', patientName: 'Carlos Santos', detail: 'Qualquer dia', currentDate: '8 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false }],

      'Dr. Gil Santos': [
      { id: 'cwl-7', patientName: 'Teresa Martins', detail: 'Disponível 3ª e 5ª', currentDate: '5 Fev', currentTime: '14:30', priority: 'normal' as const, isUrgent: false },
      { id: 'cwl-8', patientName: 'Paulo Dias', detail: 'Quer antecipar', currentDate: '6 Fev', currentTime: '16:00', priority: 'alta' as const, isUrgent: true },
      { id: 'cwl-9', patientName: 'Beatriz Nunes', detail: 'Qualquer horário', currentDate: '9 Fev', currentTime: '09:00', priority: 'normal' as const, isUrgent: false }]

    };
    const totalWaitlist = Object.values(CLINIC_WAITLIST).flat().length;




    return (
      <div className="space-y-6">
        {renderStatsCards()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* LEFT: Consultas de Hoje (all dentists) */}
          <Card className="bg-card/80 border-border flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Consultas de Hoje</h3>
                <Badge variant="outline" className="text-[10px]">54 total</Badge>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden mt-1">
                {(() => {
                  const dentistData: { id: string; name: string; pres: number; tele: number }[] = [
                    { id: '1', name: 'Dr. Gonçalo Pipo', pres: 13, tele: 5 },
                    { id: '2', name: 'Dr. Alexandre Bernardo', pres: 13, tele: 5 },
                    { id: '3', name: 'Dr. Gil Santos', pres: 14, tele: 4 },
                  ];
                  return dentistData.map((d) => (
                    <div
                      key={d.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 rounded transition-colors cursor-pointer px-[5px] py-[10px] my-[10px] gap-[10px] flex items-center justify-end"
                      onClick={() => onNavigate('agenda')}>
                      <span className="text-xs font-semibold text-foreground truncate">{d.name}:</span>
                      <span className="text-xs font-bold text-presencial">{d.pres} Presenciais</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-xs font-bold text-teleconsulta">{d.tele} Teleconsultas</span>
                    </div>
                  ));
                })()}
              </div>
              <button className="text-xs text-primary hover:underline w-full text-left mt-2" onClick={() => onNavigate('agenda')}>
                Ver agenda completa ›
              </button>
            </CardContent>
          </Card>

          {/* CENTER: Confirmações grouped by dentist */}
          <Card className="bg-card/80 border-border flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Confirmações</h3>
                <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Ao vivo
                </Badge>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden">
                {confirmationsByDentist.map(({ dentist, confirmations }) =>
                <div key={dentist.id}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentist.name} className="text-[10px] font-semibold text-muted-foreground uppercase" /></p>
                    {confirmations.slice(0, 2).map((c) => {
                    const catColor = c.category ? CATEGORY_COLORS[c.category as ConsultationCategory] : null;
                    const catLabel = c.category ? CATEGORY_LABELS[c.category as ConsultationCategory] : '';
                    return (
                      <div key={c.consultationId} className="flex items-center gap-1.5 py-0.5">
                          <div className="flex-1 min-w-0 flex items-center gap-1">
                            <span className="text-xs text-foreground truncate"><ClickablePatientName name={c.patientName} className="text-xs text-foreground" /></span>
                            {catLabel &&
                          <>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">—</span>
                                <span className="text-[10px] font-medium truncate flex-shrink-0" style={getCategoryTextStyle(catColor?.hex || '')}>{catLabel}</span>
                              </>
                          }
                          </div>
                          {confirmIndicator(c.status24h)}
                          {confirmIndicator(c.status1h, c.isNoShow === true)}
                        </div>);

                  })}
                  </div>
                )}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="confirmacoes"]')?.click(), 100);}}>
                
                Ver Tudo →
              </button>
            </CardContent>
          </Card>

          {/* RIGHT: Lista de Espera grouped by dentist */}
          <Card className="bg-card/80 border-border flex flex-col">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Lista de Espera</h3>
                <Badge variant="outline" className="text-[10px]">{totalWaitlist} pacientes</Badge>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto md:overflow-y-hidden">
                {Object.entries(CLINIC_WAITLIST).map(([dentistName, patients]) =>
                <div key={dentistName}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase py-0.5"><ClickableDentistName name={dentistName} className="text-[10px] font-semibold text-muted-foreground uppercase" /></p>
                    {patients.slice(0, 2).map((wl) =>
                  <div key={wl.id} className="flex items-center gap-1.5 border-b border-border/50 last:border-0 py-[5px]">
                        <span className="text-xs font-medium text-foreground truncate"><ClickablePatientName name={wl.patientName} className="text-xs font-medium text-foreground" /></span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">— {wl.detail}</span>
                      </div>
                  )}
                  </div>
                )}
              </div>
              <button
                className="w-full text-xs text-primary hover:bg-primary/5 py-2 rounded-md transition-colors font-medium mt-2"
                onClick={() => {onNavigate('estatisticas');setTimeout(() => document.querySelector<HTMLButtonElement>('[data-subtab="lista_espera"]')?.click(), 100);}}>
                
                Ver Tudo →
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Full width: Histórico de Pacientes do Dia — card style */}
        <PatientScoreHistory mode="history-only" userRole="clinic" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
      </div>);

  };

  // ─── Patient: new layout ───
  const renderPatientDashboard = () => {
    const upcomingItems = mockPatientConsultations.
    sort((a, b) => a.time.localeCompare(b.time)).
    slice(0, 6);

    const patientActions = [
    { label: 'Marcar Consulta', icon: Calendar, color: 'bg-blue-500/15 text-blue-400', action: () => onStartTriage?.() },
    { label: 'Ver Recompensas', icon: Gift, color: 'bg-emerald-500/15 text-emerald-400', action: () => onNavigate('loja') },
    { label: 'Minha Saúde', icon: Heart, color: 'bg-purple-500/15 text-purple-400', action: () => onNavigate('saude') }];


    return (
      <>
        {/* Stats Cards */}
        {stats &&
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card/80 backdrop-blur border-border">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{stat.label}</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    {'subtitle' in stat && stat.subtitle &&
                  <span className="text-xs text-muted-foreground -mt-1">{stat.subtitle}</span>
                  }
                  </CardContent>
                </Card>);

          })}
          </div>
        }

        {/* 2-column grid: Próximas Consultas | Ações Rápidas + Feedback Pendente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Próximas Consultas */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Próximas Consultas</h3>
                <Badge variant="outline" className="text-[10px]">{upcomingItems.length} consultas</Badge>
              </div>
              <div className="space-y-2">
                {upcomingItems.map((item) => {
                  const catColor = item.category ? CATEGORY_COLORS[item.category] : null;
                  const catLabel = item.category ? CATEGORY_LABELS[item.category] : '';
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{item.time}</span>
                      {catColor && <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <ClickableDentistName name={item.dentist.name} className="text-sm font-medium text-foreground" />
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{catLabel}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {item.status === 'confirmada' ? 'Confirmada' : 'Agendada'}
                      </Badge>
                    </div>);

                })}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Ações Rápidas + Feedback Pendente */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Ações Rápidas</h3>
                <div className="flex flex-col gap-2">
                  {patientActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={action.action}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-left">
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                          <ActionIcon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </button>);

                  })}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Pendente */}
            <PatientScoreHistory mode="pending-only" onNavigateHistory={() => {}} />
          </div>
        </div>

        {/* Full width: Histórico por Consulta */}
        <PatientScoreHistory mode="history-only" onNavigateHistory={() => {}} onViewFullHistory={onViewFullHistory} />
      </>);

  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0">
        {/* Greeting */}
        <div className="items-center justify-between flex flex-col gap-[5px] min-w-0">
          <div>
            <h1 className="font-bold text-foreground text-center text-xl truncate max-w-full">
              {greeting}, {userName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize text-center my-[5px]">
              {DEMO_DATE.toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          {/* Quick actions for dentist/clinic inline */}
          {(userRole === 'dentist' || userRole === 'clinic') &&
          <div className="flex-wrap flex items-center justify-center gap-[5px] max-w-full">
              {quickActions.map((a) => {
              const ActionIcon = a.icon;
              return (
                <Button key={a.label} variant="outline" size="sm" className="text-xs gap-1.5" onClick={a.action}>
                    <ActionIcon className="w-3.5 h-3.5" />
                    {a.label}
                  </Button>);

            })}
            </div>
          }
        </div>

        {/* Role-specific content */}
        {userRole === 'patient' ? renderPatientDashboard() : userRole === 'dentist' ? renderDentistDashboard() : renderClinicDashboard()}
      </div>
    </div>);

}