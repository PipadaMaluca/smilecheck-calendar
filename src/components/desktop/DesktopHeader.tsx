import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
        return {
          name: mockFamilyMembers[0].name,
          subtitle: 'Paciente',
        };
      case 'dentist':
        return {
          name: mockDentists[0].name,
          subtitle: 'Dentista',
        };
      case 'clinic':
        return {
          name: mockClinics[0].name,
          subtitle: 'Clínica',
        };
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
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Esquerda: Data e Pesquisa */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium capitalize text-foreground">
          {formattedDate}
        </span>

        {userRole !== 'patient' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar pacientes..."
              className="pl-9 h-8 w-56 text-sm"
            />
          </div>
        )}
      </div>

      {/* Direita: Nome e Foto */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {userInfo.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
