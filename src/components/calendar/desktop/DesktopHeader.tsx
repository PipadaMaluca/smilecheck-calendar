import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

interface DesktopHeaderProps {
  userRole: UserRole;
  currentDate: Date;
}

export function DesktopHeader({ userRole, currentDate }: DesktopHeaderProps) {
  const { t, i18n } = useTranslation();

  const getUserInfo = () => {
    switch (userRole) {
      case 'patient':
        return { name: mockFamilyMembers[0].name, subtitle: t('roles.patient') };
      case 'dentist':
        return { name: mockDentists[0].name, subtitle: t('roles.dentist') };
      case 'clinic':
        return { name: mockClinics[0].name, subtitle: t('roles.clinic') };
    }
  };

  const userInfo = getUserInfo();

  const localeMap: Record<string, string> = { pt: 'pt-PT', en: 'en-GB', fr: 'fr-FR' };
  const formattedDate = currentDate.toLocaleDateString(localeMap[i18n.language] || 'pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <span className="text-sm font-medium capitalize text-foreground">
        {formattedDate}
      </span>

      {userRole !== 'patient' && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('agenda.searchPatients')}
            className="pl-9 h-9 w-64 text-sm"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
    </header>
  );
}
