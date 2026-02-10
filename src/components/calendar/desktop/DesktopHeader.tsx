import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';

interface DesktopHeaderProps {
  userRole: UserRole;
  currentDate: Date;
}

export function DesktopHeader({ userRole, currentDate }: DesktopHeaderProps) {
  const getUserInfo = () => {
    switch (userRole) {
      case 'patient':
        return { name: mockFamilyMembers[0].name, subtitle: 'Paciente' };
      case 'dentist':
        return { name: mockDentists[0].name, subtitle: 'Dentista' };
      case 'clinic':
        return { name: mockClinics[0].name, subtitle: 'Clínica' };
    }
  };

  const userInfo = getUserInfo();

  const formattedDate = currentDate.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-card/50 backdrop-blur border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Date */}
      <span className="text-sm font-medium capitalize text-foreground">
        {formattedDate}
      </span>

      {/* Center: Search (dentist/clinic only) */}
      {userRole !== 'patient' && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar pacientes..."
            className="pl-9 h-9 w-64 text-sm"
          />
        </div>
      )}

      {/* Right: User info + icon */}
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