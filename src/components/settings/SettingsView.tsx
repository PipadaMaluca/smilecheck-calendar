import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle, FileText, Shield, LogOut, ChevronRight,
  Lock, Trash2, BookOpen, Globe, Mail, HelpCircle as FAQ, Bell, ChevronDown
} from 'lucide-react';
import { CalendarSyncSection } from '@/components/export/CalendarSyncSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { RegionalSection } from '@/components/settings/RegionalSection';
import { NotificationSettingsSection } from '@/components/settings/NotificationSettingsSection';
import { ConnectedDevicesSection } from '@/components/settings/ConnectedDevicesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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

        {/* 4. Sincronização */}
        {(userRole === 'dentist' || userRole === 'clinic') && <CalendarSyncSection />}

        {/* 5. Dispositivos Conectados */}
        <ConnectedDevicesSection />

        {/* 6. Ajuda & Suporte */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('settings.helpAndSupport')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={BookOpen} label={t('settings.reviewTutorial')} onClick={() => replayFull(userRole)} />
            <LinkRow icon={HelpCircle} label={t('settings.reviewTips')} onClick={() => { resetAllCoachMarks(); replayTooltips(userRole); toast.success(t('settings.tipsReset')); }} />
            <LinkRow icon={BookOpen} label={t('settings.resetCoachMarks')} onClick={() => { resetAllCoachMarks(); toast.success(t('settings.coachMarksReset')); }} />
            <LinkRow icon={Mail} label={t('settings.contactSupport')} />
            <LinkRow icon={FAQ} label={t('settings.faq')} />
          </CardContent>
        </Card>

        {/* 7. Legal */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('settings.legal')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={FileText} label={t('settings.termsOfService')} onClick={() => window.open('/termos', '_blank')} />
            <LinkRow icon={Shield} label={t('settings.privacyPolicy')} onClick={() => window.open('/privacidade', '_blank')} />
          </CardContent>
        </Card>

        {/* 8. Segurança — always last */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('settings.security')}</CardTitle></CardHeader>
          <CardContent className="space-y-0">
            <LinkRow icon={Lock} label={t('settings.changePassword')} />
            <Separator className="my-3" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-3 py-3 w-full text-left hover:opacity-80 transition-opacity">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">{t('settings.deleteAccount')}</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteAccountTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.deleteAccountDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => toast.success(t('settings.accountDeleted'))}
                  >
                    {t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <LinkRow icon={LogOut} label={t('settings.logout')} danger />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
