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
  /** Real accounts: the conversations badge is the server unread count (null = demo values). */
  setRealUnread: (n: number | null) => void;
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
  setRealUnread: () => {},
});

export function NotificationBadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<BadgeData>(defaultBadges);
  const [realUnread, setRealUnread] = useState<number | null>(null);

  const clearBadge = useCallback((key: keyof BadgeData) => {
    if (key === 'conversas' && realUnread !== null) return; // cleared by reading, not by clicking
    setBadges(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? false : 0,
    }));
  }, [realUnread]);
  const value = React.useMemo(() => ({
    badges: realUnread === null ? badges : { ...badges, conversas: realUnread },
    clearBadge, setRealUnread,
  }), [badges, realUnread, clearBadge]);

  return (
    <NotificationBadgeContext.Provider value={value}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export const useNotificationBadges = () => useContext(NotificationBadgeContext);
