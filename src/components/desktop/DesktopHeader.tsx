import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/calendar";
import { mockDentists, mockClinics, mockFamilyMembers } from "@/data/mockData";

interface DesktopHeaderProps {
  userRole: UserRole;
  currentDate: Date;
}

export function DesktopHeader({ userRole, currentDate }: DesktopHeaderProps) {
  const getUserInfo = () => {
    switch (userRole) {
      case "patient":
        return {
          name: mockFamilyMembers[0].name,
          subtitle: "Paciente",
        };
      case "dentist":
        return {
          name: mockDentists[0].name,
          subtitle: "Dentista",
        };
      case "clinic":
        return {
          name: mockClinics[0].name,
          subtitle: "Clínica",
        };
    }
  };

  const userInfo = getUserInfo();

  const formattedDate = currentDate.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <span className="text-sm text-muted-foreground capitalize">{formattedDate}</span>

        {userRole !== "patient" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar pacientes..." className="pl-9 w-64 h-9 bg-secondary/30 border-0" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{userInfo.name.charAt(0)}</span>
        </div>
      </div>
    </header>
  );
}
