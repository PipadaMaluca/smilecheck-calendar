import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accessibility, Cookie, HelpCircle, FileText, Shield, LogOut, ChevronRight, Lock, Trash2, BookOpen, Mail, HelpCircle as FAQ, Bell, ChevronDown } from 'lucide-react';
import { CalendarSyncSection } from '@/components/export/CalendarSyncSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { RegionalSection } from '@/components/settings/RegionalSection';
import { NotificationSettingsSection } from '@/components/settings/NotificationSettingsSection';
import { ConnectedDevicesSection } from '@/components/settings/ConnectedDevicesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { resetAllCoachMarks } from '@/components/onboarding/CoachMark';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { SUPPORT_EMAIL } from '@/lib/support';
import { useAuth } from '@/contexts/AuthContext';
import { OPEN_CONSENT_EVENT } from '@/lib/consent';
import { InstallAppButton } from '@/components/pwa/InstallPrompt';
import { AccountDataSection } from '@/components/settings/AccountDataSection';
import { ClinicAddressSection } from '@/components/settings/ClinicAddressSection';
import { DentistLanguagesSection } from '@/components/settings/DentistLanguagesSection';
import { WorkingHoursSection } from '@/components/settings/WorkingHoursSection';

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
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>

        {/* 1. Aparência */}
        <AppearanceSection
          isPremium={true}
          onViewPlans={() => onNavigate?.('plano')}
        />

        {/* 2. Regional (includes language — unified, no separate language section) */}
        <RegionalSection />

        {userRole === 'clinic' && <ClinicAddressSection />}
        {userRole === 'dentist' && <DentistLanguagesSection />}
        {userRole === 'dentist' && <WorkingHoursSection />}

        {/* 3. Notificações (collapsible) */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:opacity-80 transition-opacity"
            aria-expanded={notifOpen}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t('settings.notifications')}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${notifOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {notifOpen && (
            <div className="px-2 pb-2">
              <NotificationSettingsSection userRole={userRole} />
            </div>
          )}
        </Card>

        {/* Privacidade — consentimento */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle size="compact">{t('settings.privacy')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={Cookie} label={t('consent.manage')} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} />
          </CardContent>
        </Card>

        {/* App instalável */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle size="compact">{t('pwa.title')}</CardTitle></CardHeader>
          <CardContent><InstallAppButton /></CardContent>
        </Card>

        {/* 4. Sincronização */}
        {(userRole === 'dentist' || userRole === 'clinic') && <CalendarSyncSection />}

        {/* 5. Dispositivos Conectados */}
        <ConnectedDevicesSection />

        {/* 6. Ajuda & Suporte */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle size="compact">{t('settings.helpAndSupport')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={BookOpen} label={t('settings.reviewTutorial')} onClick={() => replayFull(userRole)} />
            <LinkRow icon={HelpCircle} label={t('settings.reviewTips')} onClick={() => { resetAllCoachMarks(); replayTooltips(userRole); toast.success(t('settings.tipsReset')); }} />
            <LinkRow icon={BookOpen} label={t('settings.resetCoachMarks')} onClick={() => { resetAllCoachMarks(); toast.success(t('settings.coachMarksReset')); }} />
            <LinkRow icon={Mail} label={t('settings.contactSupport')} onClick={() => { window.location.href = `mailto:${SUPPORT_EMAIL}`; }} />
            <LinkRow icon={FAQ} label={t('settings.faq')} onClick={() => window.location.assign('/landing#faq')} />
          </CardContent>
        </Card>

        {/* 7. Legal */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle size="compact">{t('settings.legal')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={FileText} label={t('settings.termsOfService')} onClick={() => window.open('/termos', '_blank')} />
            <LinkRow icon={Shield} label={t('settings.privacyPolicy')} onClick={() => window.open('/privacidade', '_blank')} />
            {userRole !== 'patient' && <LinkRow icon={FileText} label={t('legal.proTermsTitle')} onClick={() => window.open('/termos-profissionais', '_blank')} />}
            <LinkRow icon={Accessibility} label={t('settings.accessibilityStatement')} onClick={() => window.open('/acessibilidade', '_blank')} />
          </CardContent>
        </Card>

        {/* 8. Segurança — always last */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle size="compact">{t('settings.security')}</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            <LinkRow icon={Lock} label={t('settings.changePassword')} onClick={() => window.location.assign('/forgot-password')} />
            <Separator className="my-3" />
            <AccountDataSection />
            <LinkRow icon={LogOut} label={t('settings.logout')} danger onClick={async () => { await signOut(); window.location.href = '/login'; }} />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
