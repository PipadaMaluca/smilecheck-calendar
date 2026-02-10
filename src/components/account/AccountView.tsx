import { useState } from 'react';
import {
  User, Mail, Phone, Calendar, Users, Crown, Bell, Globe, Moon,
  HelpCircle, FileText, Shield, LogOut, Building2, MapPin, Clock,
  Video, CreditCard, Plus, ChevronRight, Stethoscope, Hash, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';

interface AccountViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onEditProfile?: () => void;
}

function getUserInfo(role: UserRole) {
  switch (role) {
    case 'patient':
      return { name: 'João Silva', subtitle: 'Paciente', email: 'joao.silva@email.com', phone: '+351 912 000 001' };
    case 'dentist':
      return { name: mockDentists[0].name, subtitle: 'Dentista', email: 'goncalo.pipo@smilecheck.pt', phone: '+351 910 000 000' };
    case 'clinic':
      return { name: mockClinics[0].name, subtitle: 'Clínica', email: 'info@smilecheck.pt', phone: '+351 211 000 000' };
  }
}

// Reusable row component
function SettingsRow({ icon: Icon, label, value, action }: {
  icon: React.ElementType;
  label: string;
  value?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      {value && <span className="text-sm text-muted-foreground truncate ml-4">{value}</span>}
      {action}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, defaultChecked = false }: {
  icon: React.ElementType;
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

function LinkRow({ icon: Icon, label, danger = false }: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
}) {
  return (
    <button className="flex items-center justify-between py-3 w-full text-left hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
        <span className={`text-sm ${danger ? 'text-destructive font-medium' : 'text-foreground'}`}>{label}</span>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export function AccountView({ userRole, onNavigate, onEditProfile }: AccountViewProps) {
  const userInfo = getUserInfo(userRole);

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{userInfo.name}</h1>
            <p className="text-sm text-muted-foreground">{userInfo.subtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEditProfile}>Editar Perfil</Button>
        </div>

        {/* PATIENT SECTIONS */}
        {userRole === 'patient' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Perfil Pessoal</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={User} label="Nome" value="João Silva" />
                <SettingsRow icon={Mail} label="Email" value="joao.silva@email.com" />
                <SettingsRow icon={Phone} label="Telefone" value="+351 912 000 001" />
                <SettingsRow icon={Calendar} label="Data Nascimento" value="15/03/1981" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Família</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                {mockFamilyMembers.map(m => (
                  <SettingsRow key={m.id} icon={Users} label={m.name} value={`${m.age} anos • ${m.relation}`} />
                ))}
                <div className="pt-3">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Membro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Plano Actual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Activo</Badge>
                  </div>
                  <Button variant="outline" size="sm">Fazer Upgrade</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* DENTIST SECTIONS */}
        {userRole === 'dentist' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Perfil Profissional</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={User} label="Nome" value={mockDentists[0].name} />
                <SettingsRow icon={Mail} label="Email" value="goncalo.pipo@smilecheck.pt" />
                <SettingsRow icon={Hash} label="Nº Ordem" value="OMD-12345" />
                <SettingsRow icon={Stethoscope} label="Especialidades" value={mockDentists[0].specialty} />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Clínicas Associadas</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={Building2} label={mockClinics[0].name} value="Dentista Principal" />
                <SettingsRow icon={Building2} label={mockClinics[1].name} value="Colaborador" />
                <SettingsRow icon={Building2} label={mockClinics[2].name} value="Colaborador" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Disponibilidade</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">09h - 21h (Seg a Sex)</span>
                  </div>
                  <Button variant="outline" size="sm">Gerir Horários</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Preços Teleconsulta</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">€20 por consulta</span>
                  </div>
                  <Button variant="outline" size="sm">Alterar Preço</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Plano Actual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Activo</Badge>
                  </div>
                  <Button variant="outline" size="sm">Fazer Upgrade</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* CLINIC SECTIONS */}
        {userRole === 'clinic' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Perfil da Clínica</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={Building2} label="Nome" value={mockClinics[0].name} />
                <SettingsRow icon={Mail} label="Email" value="info@smilecheck.pt" />
                <SettingsRow icon={Phone} label="Telefone" value="+351 211 000 000" />
                <SettingsRow icon={Hash} label="NIF" value="509 123 456" />
                <SettingsRow icon={MapPin} label="Morada" value={mockClinics[0].address} />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Documentos Legais</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={FileCheck} label="Alvará de Funcionamento" value="Válido" />
                <SettingsRow icon={FileCheck} label="Seguro de Responsabilidade" value="Válido" />
                <div className="pt-3">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Documento
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Horário de Funcionamento</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="text-foreground">09:00 - 21:00</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sábado</span>
                    <span className="text-foreground">09:00 - 13:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Domingo</span>
                    <span className="text-destructive">Encerrado</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">Editar Horário</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Equipa</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">7 dentistas activos</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('equipa')}>Gerir Equipa</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Plano Actual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Activo</Badge>
                  </div>
                  <Button variant="outline" size="sm">Fazer Upgrade</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Gestão de Pagamentos</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Visa •••• 4242</span>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* PREFERENCES - All roles */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Preferências</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <ToggleRow icon={Bell} label="Notificações" defaultChecked={true} />
            <SettingsRow icon={Globe} label="Idioma" value="Português" action={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
            <ToggleRow icon={Moon} label="Modo Escuro" defaultChecked={true} />
          </CardContent>
        </Card>

        {/* OTHER - All roles */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Outros</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={HelpCircle} label="Ajuda & Suporte" />
            <LinkRow icon={FileText} label="Termos de Utilização" />
            <LinkRow icon={Shield} label="Política de Privacidade" />
            <Separator className="my-1" />
            <LinkRow icon={LogOut} label="Terminar Sessão" danger />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
