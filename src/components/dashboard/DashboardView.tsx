import { useMemo } from 'react';
import { Star, Calendar, Video, Users, Clock, Trophy, Flame, Award, CheckCircle2, AlertTriangle, Search, Bell, BarChart3, Heart, Gift } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserRole, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, ConsultationStatus } from '@/types/calendar';
import { mockConsultations, mockDentists, mockClinics, mockFamilyMembers, mockPatientConsultations } from '@/data/mockData';
import { mockConfirmations } from '@/types/scoring';
import { isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientScoreHistory } from './PatientScoreHistory';

interface DashboardViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onStartTriage?: () => void;
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
{ id: 'wl-1', patientName: 'Rita Oliveira', currentDate: '3 Fev', currentTime: '14:00', priority: 'alta' as const, isUrgent: true },
{ id: 'wl-2', patientName: 'Bruno Pereira', currentDate: '5 Fev', currentTime: '10:00', priority: 'normal' as const, isUrgent: false },
{ id: 'wl-3', patientName: 'Sofia Lopes', currentDate: '7 Fev', currentTime: '16:30', priority: 'normal' as const, isUrgent: false }];


export function DashboardView({ userRole, onNavigate, onStartTriage }: DashboardViewProps) {
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
      const dentistCons = todayConsultations.filter(c => c.dentist.id === mockDentists[0].id).sort((a, b) => a.time.localeCompare(b.time));
      const next = dentistCons[0];
      return [
      { label: 'Próxima Consulta', value: next ? next.time : '—', subtitle: next ? next.patient.name : '', icon: Calendar },
      { label: 'Nível', value: 'Prata', icon: Award },
      { label: 'Pontos', value: '1 250', icon: Trophy },
      { label: 'Streak', value: '14 dias', icon: Flame }];
    }
    if (userRole === 'clinic') {
      const pres = todayConsultations.filter(c => c.type === 'presencial').length;
      const tele = todayConsultations.filter(c => c.type === 'teleconsulta').length;
      return [
      { label: 'Consultas de Hoje', value: String(todayConsultations.length), subtitle: `${pres} pres · ${tele} tele`, icon: Calendar },
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

  // ─── Dentist / Clinic: 3-column dashboard ───
  const renderProfessionalDashboard = () => {
    const dentistCons = userRole === 'dentist' ?
    todayConsultations.filter((c) => c.dentist.id === mockDentists[0].id) :
    todayConsultations;

    const confirmed = mockConfirmations.filter((c) => c.status24h === 'confirmed' && c.status1h === 'confirmed').length;
    const total = mockConfirmations.length;
    const notConfirmed = mockConfirmations.filter((c) => c.status24h === 'pending' || c.status1h === 'pending');
    const confirmRate = total > 0 ? Math.round(confirmed / total * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Summary cards row */}
        {stats && (
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
                    {'subtitle' in stat && stat.subtitle && (
                      <span className="text-xs text-muted-foreground -mt-1">{stat.subtitle}</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Section 1: Consultas de Hoje */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Consultas de Hoje</h3>
              <Badge variant="outline" className="text-[10px]">{dentistCons.length} total</Badge>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dentistCons.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 8).map((c) => {
                const statusCfg = c.status ? STATUS_CONFIG[c.status] : null;
                const catColor = c.category ? CATEGORY_COLORS[c.category] : null;
                return (
                  <div key={c.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{c.time}</span>
                    {catColor && <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.patient.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {c.category ? CATEGORY_LABELS[c.category] : c.type}
                      </p>
                    </div>
                    {statusCfg &&
                    <span className="text-[10px]">{statusCfg.icon}</span>
                    }
                  </div>);

              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Confirmações */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Confirmações</h3>
              <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Ao vivo
              </Badge>
            </div>
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-foreground">{confirmed} <span className="text-sm font-normal text-muted-foreground">/ {total}</span></p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
              <Progress value={confirmRate} className="h-2 mt-2" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Não confirmados</p>
              {notConfirmed.slice(0, 5).map((c) =>
              <div key={c.consultationId} className="flex items-center gap-2 py-1">
                  <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{c.patientName}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Lista de Espera */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Lista de Espera</h3>
              <Badge variant="outline" className="text-[10px]">{MOCK_WAITING_LIST.length} pacientes</Badge>
            </div>
            <div className="space-y-2">
              {MOCK_WAITING_LIST.map((wl) =>
              <div key={wl.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-foreground truncate">{wl.patientName}</p>
                      {wl.isUrgent &&
                    <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                    }
                    </div>
                    <p className="text-[10px] text-muted-foreground">Atual: {wl.currentDate} às {wl.currentTime}</p>
                  </div>
                  <Badge variant={wl.priority === 'alta' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                    {wl.priority === 'alta' ? 'Prioritário' : 'Normal'}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Útil quando alguém cancela uma consulta
            </p>
          </CardContent>
        </Card>
      </div>
      </div>);

  };

  // ─── Patient: new layout ───
  const renderPatientDashboard = () => {
    const upcomingItems = mockPatientConsultations
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 6);

    const patientActions = [
      { label: 'Marcar Consulta', icon: Calendar, color: 'bg-blue-500/15 text-blue-400', action: () => onStartTriage?.() },
      { label: 'Ver Recompensas', icon: Gift, color: 'bg-emerald-500/15 text-emerald-400', action: () => onNavigate('loja') },
      { label: 'Minha Saúde', icon: Heart, color: 'bg-purple-500/15 text-purple-400', action: () => onNavigate('saude') },
    ];

    return (
      <>
        {/* Stats Cards */}
        {stats && (
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
                    {'subtitle' in stat && stat.subtitle && (
                      <span className="text-xs text-muted-foreground -mt-1">{stat.subtitle}</span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
                    </div>
                  );
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
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors text-left"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                          <ActionIcon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Pendente */}
            <PatientScoreHistory mode="pending-only" onNavigateHistory={() => {}} />
          </div>
        </div>

        {/* Full width: Histórico por Consulta */}
        <PatientScoreHistory mode="history-only" onNavigateHistory={() => {}} />
      </>
    );
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="items-center justify-between flex flex-col gap-[5px]">
          <div>
            <h1 className="font-bold text-foreground text-center text-xl">
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
          <div className="flex-wrap flex items-center justify-center gap-[5px]">
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
        {userRole === 'patient' ? renderPatientDashboard() : renderProfessionalDashboard()}
      </div>
    </ScrollArea>);

}