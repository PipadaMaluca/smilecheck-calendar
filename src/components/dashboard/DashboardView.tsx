import { useMemo } from 'react';
import { Star, Calendar, Video, Users, Clock, Trophy, Flame, Award, CheckCircle2, AlertTriangle, Search, Bell, BarChart3 } from 'lucide-react';
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
      { label: 'Pontos', value: '450', icon: Trophy },
      { label: 'Nível', value: 'Bronze', icon: Award },
      { label: 'Streak', value: '7 dias', icon: Flame }];

    }
    return null; // dentist/clinic use the 3-column layout instead
  }, [userRole]);

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
      </div>);

  };

  // ─── Patient: original layout ───
  const renderPatientDashboard = () => {
    const upcomingItems = mockPatientConsultations.
    sort((a, b) => a.time.localeCompare(b.time)).
    slice(0, 4);

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
                  </CardContent>
                </Card>);

          })}
          </div>
        }

        {/* Content row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Próximas Consultas</h2>
            <div className="space-y-3">
              {upcomingItems.map((item) => {
                const catColor = item.category ? CATEGORY_COLORS[item.category] : null;
                const catLabel = item.category ? CATEGORY_LABELS[item.category] : '';
                return (
                  <Card key={item.id} className="bg-card/80 backdrop-blur border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 text-center">
                        <span className="text-sm font-bold text-foreground">{item.time}</span>
                      </div>
                      {catColor && <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <ClickableDentistName name={item.dentist.name} className="text-sm font-medium text-foreground" />
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          <ClickableClinicName name={item.clinic.name} className="text-xs text-muted-foreground" />
                        </p>
                      </div>
                      {catColor &&
                      <Badge
                        className="text-[10px] px-2 py-0.5 border-0 flex-shrink-0"
                        style={{ backgroundColor: catColor.hex, color: catColor.text === 'text-white' ? 'white' : 'black' }}>

                          {catLabel}
                        </Badge>
                      }
                    </CardContent>
                  </Card>);

              })}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Acções Rápidas</h2>
            <div className="flex flex-col gap-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Button key={action.label} variant="outline" className="justify-start h-12 text-sm font-medium gap-2" onClick={action.action}>
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </Button>);

              })}
            </div>
          </div>
        </div>

        {/* Patient: Score history */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Nível e Pontuação</h2>
          <PatientScoreHistory />
        </div>
      </>);

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