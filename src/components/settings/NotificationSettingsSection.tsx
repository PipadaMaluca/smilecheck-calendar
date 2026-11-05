import { useEffect, useState } from 'react';
import { openUnderConstruction } from '@/components/ui/under-construction';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/calendar';

export const NOTIF_TYPES = ['reminders', 'confirmations', 'points', 'news'] as const;
export const NOTIF_CHANNELS = ['email', 'push', 'sms', 'whatsapp'] as const;
/** Only e-mail works today; the other channels are "Em breve" and the server refuses enabling them. */
export const AVAILABLE_CHANNELS: ReadonlySet<string> = new Set(['email']);
const DEFAULT_ON: ReadonlySet<string> = new Set(['reminders', 'confirmations']);

type Key = `${typeof NOTIF_TYPES[number]}:${typeof NOTIF_CHANNELS[number]}`;
const LOCAL_KEY = 'sc:demo-notif-prefs';

export function NotificationSettingsSection(_props: { userRole: UserRole }) {
  const { t } = useTranslation();
  const { demoMode, user } = useAuth();
  const real = !demoMode && !!user;
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const base = Object.fromEntries(NOTIF_TYPES.map((n) => [`${n}:email`, DEFAULT_ON.has(n)]));
    try { return { ...base, ...(JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')) }; } catch { return base; }
  });

  useEffect(() => {
    if (!real || !user) return;
    void supabase.from('notification_preferences').select('notif_type, channel, enabled').eq('profile_id', user.id)
      .then(({ data }) => {
        if (data?.length) setPrefs((p) => ({ ...p, ...Object.fromEntries(data.map((r) => [`${r.notif_type}:${r.channel}`, r.enabled])) }));
      });
  }, [real, user]);

  const toggle = async (type: string, channel: string, value: boolean) => {
    const k = `${type}:${channel}` as Key;
    const prev = prefs[k];
    const next = { ...prefs, [k]: value };
    setPrefs(next);
    if (!real || !user) { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); return; }
    const { error } = await supabase.from('notification_preferences')
      .upsert({ profile_id: user.id, notif_type: type, channel, enabled: value });
    if (error) { setPrefs((p) => ({ ...p, [k]: prev })); toast.error(t('notifPrefs.saveError')); }
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact">{t('notifPrefs.title')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('notifPrefs.subtitle')}</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{t('notifPrefs.title')}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left font-medium text-muted-foreground py-2 pr-2">{t('notifPrefs.type')}</th>
                {NOTIF_CHANNELS.map((c) => (
                  <th key={c} scope="col" className="px-1 py-2 text-center font-medium text-muted-foreground">
                    <span className="block">{t(`notifPrefs.channels.${c}`)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIF_TYPES.map((n) => (
                <tr key={n} className="border-t border-border">
                  <th scope="row" className="text-left font-normal text-foreground py-3 pr-2">{t(`notifPrefs.types.${n}`)}</th>
                  {NOTIF_CHANNELS.map((c) => {
                    const available = AVAILABLE_CHANNELS.has(c);
                    return (
                      <td key={c} className="text-center">
                        <Checkbox
                          aria-label={t('notifPrefs.cellA11y', { type: t(`notifPrefs.types.${n}`), channel: t(`notifPrefs.channels.${c}`) })}
                          checked={available ? !!prefs[`${n}:${c}`] : false}
                          onCheckedChange={(v) => (available ? toggle(n, c, v === true) : openUnderConstruction())}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
