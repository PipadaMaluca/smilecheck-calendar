import { useState } from 'react';
import {
  HelpCircle, FileText, Shield, LogOut, ChevronRight,
  Lock, Trash2, BookOpen, CreditCard, Receipt, ClipboardList
} from 'lucide-react';
import { CalendarSyncSection } from '@/components/export/CalendarSyncSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { RegionalSection } from '@/components/settings/RegionalSection';
import { NotificationSettingsSection } from '@/components/settings/NotificationSettingsSection';
import { InviteView } from '@/components/settings/InviteView';
import { ConnectedDevicesSection } from '@/components/settings/ConnectedDevicesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/calendar';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface SettingsViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
  onInvite?: () => void;
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
  const { replayFull, replayTooltips } = useOnboarding();

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>

        {/* 1. Convidar (Referral) - inline */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Convidar (Referral)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <InviteView onClose={() => {}} inline />
          </CardContent>
        </Card>

        {/* 2. Aparência */}
        <AppearanceSection
          isPremium={true}
          onViewPlans={() => onNavigate?.('plano')}
        />

        {/* 3. Notificações */}
        <NotificationSettingsSection userRole={userRole} />

        {/* 4. Regional */}
        <RegionalSection />

        {/* 5. Dispositivos Conectados */}
        <ConnectedDevicesSection />

        {/* 6. Sincronização */}
        {(userRole === 'dentist' || userRole === 'clinic') && <CalendarSyncSection />}

        {/* Tutorial */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tutorial</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => replayFull(userRole)}>
              <BookOpen className="w-4 h-4" /> Rever Tutorial
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => replayTooltips(userRole)}>
              <HelpCircle className="w-4 h-4" /> Rever Dicas
            </Button>
          </CardContent>
        </Card>

        {/* 6. Legal */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Legal</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={FileText} label="Termos de Serviço" onClick={() => window.open('/termos', '_blank')} />
            <LinkRow icon={Shield} label="Política de Privacidade" onClick={() => window.open('/privacidade', '_blank')} />
          </CardContent>
        </Card>

        {/* 7. Outros */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Outros</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={HelpCircle} label="Ajuda & Suporte" />
          </CardContent>
        </Card>

        {/* 7. Segurança */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Segurança</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            <LinkRow icon={Lock} label="Alterar Password" />
            <Separator className="my-2" />
            <LinkRow icon={Trash2} label="Eliminar Conta" danger />
            <LinkRow icon={LogOut} label="Terminar Sessão" danger />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
