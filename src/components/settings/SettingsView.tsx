import { useState } from 'react';
import {
  Bell, Globe, Moon, HelpCircle, FileText, Shield, LogOut, ChevronRight,
  Lock, UserPlus, Trash2, Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';

interface SettingsViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
  onInvite?: () => void;
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

function LinkRow({ icon: Icon, label, danger = false, onClick }: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center justify-between py-3 w-full text-left hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
        <span className={`text-sm ${danger ? 'text-destructive font-medium' : 'text-foreground'}`}>{label}</span>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export function SettingsView({ userRole, onNavigate, onInvite }: SettingsViewProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>

        {/* Preferences */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Preferências</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <ToggleRow icon={Bell} label="Notificações" defaultChecked={true} />
            <SettingsRow icon={Globe} label="Idioma" value="Português" action={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
            <ToggleRow icon={Moon} label="Modo Escuro" defaultChecked={true} />
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Segurança</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={Lock} label="Alterar Password" />
          </CardContent>
        </Card>

        {/* Invite */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-4 space-y-0 divide-y divide-border">
            <LinkRow icon={UserPlus} label="Convidar (Referral)" onClick={onInvite} />
          </CardContent>
        </Card>

        {/* Other */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Outros</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={HelpCircle} label="Ajuda & Suporte" />
            <LinkRow icon={FileText} label="Termos de Utilização" />
            <LinkRow icon={Shield} label="Política de Privacidade" />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-4 space-y-0 divide-y divide-border">
            <LinkRow icon={Trash2} label="Eliminar Conta" danger />
            <LinkRow icon={LogOut} label="Terminar Sessão" danger />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
