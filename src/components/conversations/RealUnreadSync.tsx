import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationBadges } from '@/contexts/NotificationBadgeContext';
import { useUnreadMessages } from '@/data/conversationsSource';

/** Feeds the sidebar conversations badge with the real unread count (demo keeps its mock badge). */
export function RealUnreadSync() {
  const { session, demoMode } = useAuth();
  const real = Boolean(session) && !demoMode;
  const count = useUnreadMessages(real);
  const { setRealUnread } = useNotificationBadges();
  useEffect(() => { setRealUnread(real ? count : null); }, [real, count, setRealUnread]);
  return null;
}
