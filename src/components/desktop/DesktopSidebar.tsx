import { Home, Calendar, Heart, MessageCircle, Users, Settings, Trophy, Award, Gift, CreditCard } from "lucide-react";
import { UserRole } from "@/types/calendar";
import { cn } from "@/lib/utils";
import smileIcon from "@/assets/smilecheck-icon.png";

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
      { id: "estatisticas", icon: Trophy, label: "Estatísticas" },
      { id: "plano", icon: CreditCard, label: "Gerir Plano" },
      { id: "loja", icon: Gift, label: "Loja de Recompensas" },
    ],
  },
};

export function DesktopSidebar({ userRole, activeTab, onTabChange }: DesktopSidebarProps) {
  const items = sidebarItems[userRole];
  const isProVersion = userRole !== "patient";

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
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

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
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

        {/* Separator */}
        <div className="my-4 border-t border-border" />

        {/* Secondary Navigation */}
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

      {/* Bottom: Conta */}
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
