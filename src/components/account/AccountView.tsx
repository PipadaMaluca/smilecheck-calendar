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
import { useTranslation } from 'react-i18next';

interface AccountViewProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onEditProfile?: () => void;
}

function getUserInfo(role: UserRole, t: (k: string) => string) {
  switch (role) {
    case 'patient':
      return { name: 'João Silva', subtitle: t('account.patient'), email: 'joao.silva@email.com', phone: '+351 912 000 001' };
    case 'dentist':
      return { name: mockDentists[0].name, subtitle: t('account.dentist'), email: 'goncalo.pipo@smilecheck.pt', phone: '+351 910 000 000' };
    case 'clinic':
      return { name: mockClinics[0].name, subtitle: t('account.clinic'), email: 'info@smilecheck.pt', phone: '+351 211 000 000' };
  }
}

function SettingsRow({ icon: Icon, label, value, action }: {
  icon: React.ElementType; label: string; value?: string; action?: React.ReactNode;
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
  icon: React.ElementType; label: string; defaultChecked?: boolean;
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
  icon: React.ElementType; label: string; danger?: boolean;
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
  const { t } = useTranslation();
  const userInfo = getUserInfo(userRole, t);

  const weekdays = [
    t('account.monday'), t('account.tuesday'), t('account.wednesday'),
    t('account.thursday'), t('account.friday')
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-32">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{userInfo.name}</h1>
            <p className="text-sm text-muted-foreground">{userInfo.subtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEditProfile}>{t('account.editProfile')}</Button>
        </div>

        {userRole === 'patient' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.personalProfile')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={User} label={t('account.name')} value="João Silva" />
                <SettingsRow icon={Mail} label="Email" value="joao.silva@email.com" />
                <SettingsRow icon={Phone} label={t('account.phone')} value="+351 912 000 001" />
                <SettingsRow icon={Calendar} label={t('account.dateOfBirth')} value="15/03/1981" />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.family')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                {mockFamilyMembers.map(m => (
                  <SettingsRow key={m.id} icon={Users} label={m.name} value={`${m.age} ${t('common.years')} • ${m.relation}`} />
                ))}
                <div className="pt-3">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    {t('account.addMember')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.currentPlan')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{t('account.active')}</Badge>
                  </div>
                  <Button variant="outline" size="sm">{t('account.upgrade')}</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === 'dentist' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.professionalProfile')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={User} label={t('account.name')} value={mockDentists[0].name} />
                <SettingsRow icon={Mail} label="Email" value="goncalo.pipo@smilecheck.pt" />
                <SettingsRow icon={Hash} label={t('account.orderNumber')} value="OMD-12345" />
                <SettingsRow icon={Stethoscope} label={t('account.specialties')} value={mockDentists[0].specialty} />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.associatedClinics')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={Building2} label={mockClinics[0].name} value={t('account.mainDentist')} />
                <SettingsRow icon={Building2} label={mockClinics[1].name} value={t('account.collaborator')} />
                <SettingsRow icon={Building2} label={mockClinics[2].name} value={t('account.collaborator')} />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.availability')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">09h - 21h ({t('account.monToFri')})</span>
                  </div>
                  <Button variant="outline" size="sm">{t('account.manageSchedule')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.teleconsultPrices')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">€20 {t('account.perConsultation')}</span>
                  </div>
                  <Button variant="outline" size="sm">{t('account.changePrice')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.currentPlan')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{t('account.active')}</Badge>
                  </div>
                  <Button variant="outline" size="sm">{t('account.upgrade')}</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {userRole === 'clinic' && (
          <>
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.clinicProfile')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={Building2} label={t('account.name')} value={mockClinics[0].name} />
                <SettingsRow icon={Mail} label="Email" value="info@smilecheck.pt" />
                <SettingsRow icon={Phone} label={t('account.phone')} value="+351 211 000 000" />
                <SettingsRow icon={Hash} label="NIF" value="509 123 456" />
                <SettingsRow icon={MapPin} label={t('account.address')} value={mockClinics[0].address} />
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.legalDocuments')}</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <SettingsRow icon={FileCheck} label={t('account.operatingLicense')} value={t('account.valid')} />
                <SettingsRow icon={FileCheck} label={t('account.insuranceCert')} value={t('account.valid')} />
                <div className="pt-3">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    {t('account.addDocument')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.businessHours')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {weekdays.map(day => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="text-foreground">09:00 - 21:00</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('account.saturday')}</span>
                    <span className="text-foreground">09:00 - 13:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('account.sunday')}</span>
                    <span className="text-destructive">{t('account.closed')}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">{t('account.editSchedule')}</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.teamSection')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">7 {t('account.activeDentists')}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('equipa')}>{t('account.manageTeam')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.currentPlan')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Pro</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{t('account.active')}</Badge>
                  </div>
                  <Button variant="outline" size="sm">{t('account.upgrade')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.paymentManagement')}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Visa •••• 4242</span>
                  </div>
                  <Button variant="outline" size="sm">{t('account.configure')}</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <ToggleRow icon={Bell} label={t('account.notifications')} defaultChecked={true} />
            <SettingsRow icon={Globe} label={t('account.language')} value={t('account.portuguese')} action={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
            <ToggleRow icon={Moon} label={t('account.darkMode')} defaultChecked={true} />
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('account.other')}</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow icon={HelpCircle} label={t('account.helpSupport')} />
            <LinkRow icon={FileText} label={t('account.termsOfUse')} />
            <LinkRow icon={Shield} label={t('account.privacyPolicy')} />
            <Separator className="my-1" />
            <LinkRow icon={LogOut} label={t('account.logout')} danger />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
