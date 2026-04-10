import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BadgeData {
  conversas: number;      // blue, count
  conquistas: boolean;    // orange "!"
  pontuacoes: boolean;    // green "!"
  convidar: number;       // green, count
  faturacao: boolean;     // red "!"
}

interface NotificationBadgeContextType {
  badges: BadgeData;
  clearBadge: (key: keyof BadgeData) => void;
}

const defaultBadges: BadgeData = {
  conversas: 4,
  conquistas: true,
  pontuacoes: true,
  convidar: 2,
  faturacao: true,
};

const NotificationBadgeContext = createContext<NotificationBadgeContextType>({
  badges: defaultBadges,
  clearBadge: () => {},
});

export function NotificationBadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<BadgeData>(defaultBadges);

  const clearBadge = useCallback((key: keyof BadgeData) => {
    setBadges(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? false : 0,
    }));
  }, []);

  return (
    <NotificationBadgeContext.Provider value={{ badges, clearBadge }}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export const useNotificationBadges = () => useContext(NotificationBadgeContext);
