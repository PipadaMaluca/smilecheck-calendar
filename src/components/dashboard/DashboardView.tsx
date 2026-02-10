import { useMemo } from 'react';
import { Star, Calendar, Video, Users, Clock, Trophy, Flame, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/calendar';
import { mockConsultations, mockDentists, mockClinics, mockFamilyMembers, mockPatientConsultations } from '@/data/mockData';
import { isSameDay, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    case 'dentist': return `Dr. ${mockDentists[0].name.split(' ')[1]}`;
    case 'clinic': return mockClinics[0].name;
    case 'patient': return mockFamilyMembers[0].name.split(' ')[0];
  }
}

const DEMO_DATE = new Date(2026, 0, 31);

export function DashboardView({ userRole, onNavigate, onStartTriage }: DashboardViewProps) {
  const greeting = getGreeting();
  const userName = getUserName(userRole);

  const todayConsultations = useMemo(() =>
    mockConsultations.filter(c => isSameDay(c.date, DEMO_DATE)),
  []);

  const todayTeleconsultas = useMemo(() =>
    todayConsultations.filter(c => c.type === 'teleconsulta'),
  [todayConsultations]);

  const stats = useMemo(() => {
    switch (userRole) {
      case 'dentist': {
        const dentistCons = todayConsultations.filter(c => c.dentist.id === mockDentists[0].id);
        const dentistTele = dentistCons.filter(c => c.type === 'teleconsulta');
        return [
          { label: 'Consultas Hoje', value: dentistCons.length.toString(), icon: Calendar },
          { label: 'Teleconsultas Hoje', value: dentistTele.length.toString(), icon: Video },
          { label: 'Pacientes Aguardam', value: '3', icon: Users },
          { label: 'Rating', value: '4.9', icon: Star, isStar: true },
        ];
      }
      case 'clinic':
        return [
          { label: 'Consultas Hoje', value: todayConsultations.length.toString(), icon: Calendar },
          { label: 'Teleconsultas Hoje', value: todayTeleconsultas.length.toString(), icon: Video },
          { label: 'Dentistas Activos', value: '7', icon: Users },
          { label: 'Rating Médio', value: '4.6', icon: Star, isStar: true },
        ];
      case 'patient':
        return [
          { label: 'Próxima Consulta', value: '31 Jan', icon: Calendar },
          { label: 'Pontos', value: '450', icon: Trophy },
          { label: 'Nível', value: 'Bronze', icon: Award },
          { label: 'Streak', value: '7 dias', icon: Flame },
        ];
    }
  }, [userRole, todayConsultations, todayTeleconsultas]);

  const upcomingItems = useMemo(() => {
    switch (userRole) {
      case 'dentist': {
        return todayConsultations
          .filter(c => c.dentist.id === mockDentists[0].id)
          .sort((a, b) => a.time.localeCompare(b.time))
          .slice(0, 4);
      }
      case 'clinic': {
        return todayConsultations
          .sort((a, b) => a.time.localeCompare(b.time))
          .slice(0, 4);
      }
      case 'patient': {
        return mockPatientConsultations
          .sort((a, b) => a.time.localeCompare(b.time))
          .slice(0, 4);
      }
    }
  }, [userRole, todayConsultations]);

  const sectionTitle = userRole === 'dentist' ? 'Próximos Pacientes' : userRole === 'clinic' ? 'Consultas de Hoje' : 'Próximas Consultas';

  const quickActions = useMemo(() => {
    switch (userRole) {
      case 'dentist':
        return [
          { label: 'Ver Agenda Completa', action: () => onNavigate('agenda') },
          { label: 'Nova Teleconsulta', action: () => {} },
          { label: 'Prescrever Receita', action: () => {} },
        ];
      case 'clinic':
        return [
          { label: 'Ver Agenda Completa', action: () => onNavigate('agenda') },
          { label: 'Gerir Equipa', action: () => onNavigate('team') },
          { label: 'Ver Estatísticas', action: () => {} },
        ];
      case 'patient':
        return [
          { label: 'Marcar Consulta', action: () => onStartTriage?.() },
          { label: 'Ver Recompensas', action: () => onNavigate('loja') },
          { label: 'Minha Saúde', action: () => onNavigate('saude') },
        ];
    }
  }, [userRole, onNavigate]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {userName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {DEMO_DATE.toLocaleDateString('pt-PT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Stats Cards */}
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
                  <div className="flex items-center gap-1">
                    {stat.isStar && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content row: Upcoming + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">{sectionTitle}</h2>
            <div className="space-y-3">
              {upcomingItems.map((item) => {
                const catColor = item.category ? CATEGORY_COLORS[item.category] : null;
                const catLabel = item.category ? CATEGORY_LABELS[item.category] : '';
                return (
                  <Card key={item.id} className="bg-card/80 backdrop-blur border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Time */}
                      <div className="flex-shrink-0 w-14 text-center">
                        <span className="text-sm font-bold text-foreground">{item.time}</span>
                      </div>

                      {/* Color bar */}
                      {catColor && (
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: catColor.hex }} />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {userRole === 'patient' ? item.dentist.name : item.patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userRole === 'clinic' && `${item.dentist.name} • `}
                          {item.clinic.name}
                        </p>
                      </div>

                      {/* Category badge */}
                      {catColor && (
                        <Badge
                          className="text-[10px] px-2 py-0.5 border-0 flex-shrink-0"
                          style={{ backgroundColor: catColor.hex, color: catColor.text === 'text-white' ? 'white' : 'black' }}
                        >
                          {catLabel}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Acções Rápidas</h2>
            <div className="flex flex-col gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="justify-start h-12 text-sm font-medium"
                  onClick={action.action}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
