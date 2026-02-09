import { ReactNode } from "react";
import {
  Search,
  User,
  Home,
  Calendar,
  Heart,
  MessageCircle,
  Users,
  Settings,
  Trophy,
  Award,
  Gift,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { mockDentists, mockClinics, mockFamilyMembers } from "@/data/mockData";
import smileIcon from "@/assets/smilecheck-icon.png";

// ========== HEADER ==========
interface DesktopHeaderProps {
  userRole: UserRole;
  currentDate: Date;
}

export function DesktopHeader({ userRole, currentDate }: DesktopHeaderProps) {
  const getUserInfo = () => {
    switch (userRole) {
      case "patient":
        return { name: mockFamilyMembers[0].name, subtitle: "Paciente" };
      case "dentist":
        return { name: mockDentists[0].name, subtitle: "Dentista" };
      case "clinic":
        return { name: mockClinics[0].name, subtitle: "Clínica" };
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
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
    </header>
  );
}

// ========== SIDEBAR ==========
interface DesktopSidebarProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems = {
  patient: {
    main: [
      { id: "home", icon: Home, label: "Início" },
      { id: "consultas", icon: Calendar, label: "Consultas" },
      { id: "saude", icon: Heart, label: "Saúde" },
      { id: "conversas", icon: MessageCircle, label: "Conversas" },
    ],
    secondary: [
      { id: "conquistas", icon: Trophy, label: "Conquistas" },
      { id: "plano", icon: CreditCard, label: "Gerir Plano" },
      { id: "loja", icon: Gift, label: "Loja de Recompensas" },
    ],
  },
  dentist: {
    main: [
      { id: "home", icon: Home, label: "Início" },
      { id: "agenda", icon: Calendar, label: "Agenda" },
      { id: "equipa", icon: Users, label: "Equipa" },
      { id: "conversas", icon: MessageCircle, label: "Conversas" },
    ],
    secondary: [
      { id: "classificacoes", icon: Trophy, label: "Classificações" },
      { id: "conquistas", icon: Award, label: "Conquistas" },
      { id: "plano", icon: CreditCard, label: "Gerir Plano" },
      { id: "loja", icon: Gift, label: "Loja de Recompensas" },
    ],
  },
  clinic: {
    main: [
      { id: "home", icon: Home, label: "Início" },
      { id: "agenda", icon: Calendar, label: "Agenda" },
      { id: "equipa", icon: Users, label: "Equipa" },
      { id: "conversas", icon: MessageCircle, label: "Conversas" },
    ],
    secondary: [
      { id: "classificacoes", icon: Trophy, label: "Classificações" },
      { id: "conquistas", icon: Award, label: "Conquistas" },
      { id: "estatisticas", icon: BarChart3, label: "Estatísticas" },
      { id: "plano", icon: CreditCard, label: "Gerir Plano" },
      { id: "loja", icon: Gift, label: "Loja de Recompensas" },
    ],
  },
};

export function DesktopSidebar({ userRole, activeTab, onTabChange }: DesktopSidebarProps) {
  const items = sidebarItems[userRole];
  const isProVersion = userRole !== "patient";

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={smileIcon} alt="SmileCheck" className="w-8 h-8" />
          <div>
            <span className="font-bold text-lg">SmileCheck</span>
            {isProVersion && (
              <span className="ml-1 text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-medium">Pro</span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {items.main.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="my-4 border-t border-border" />

        <div className="space-y-1">
          {items.secondary.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => onTabChange("conta")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            activeTab === "conta"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Conta</span>
        </button>
      </div>
    </aside>
  );
}

// ========== LAYOUT ==========
interface DesktopLayoutProps {
  userRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentDate: Date;
  children: ReactNode;
}

export function DesktopLayout({ userRole, activeTab, onTabChange, currentDate, children }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar userRole={userRole} activeTab={activeTab} onTabChange={onTabChange} />

      <div className="ml-64 flex flex-col min-h-screen">
        <DesktopHeader userRole={userRole} currentDate={currentDate} />

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
