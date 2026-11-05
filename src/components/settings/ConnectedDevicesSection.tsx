import { demoText } from '@/lib/demoText';
import { useState } from 'react';
import { Monitor, Tablet, Smartphone, X, Link2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useDirectory } from '@/data/directorySource';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** Device kind + browser of *this* browser only (no API lists other sessions). */
export function describeThisDevice(ua: string): { type: 'desktop' | 'tablet' | 'mobile'; browser: string } {
  const type = /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
  return { type, browser };
}

/** Real accounts: only "this device" + sign out everywhere else — never an invented device list. */
function RealConnectedDevices() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const me = describeThisDevice(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const Icon = deviceIcons[me.type];
  const signOutOthers = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    setBusy(false);
    if (error) toast.error(t('devicesReal.failed')); else toast.success(t('devicesReal.done'));
  };
  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact" className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          {t('sweep.devices.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{t('devicesReal.thisDevice')}{me.browser ? ` — ${me.browser}` : ''}</p>
            <p className="text-xs text-muted-foreground">{t('i18nA.activeNow')}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t('devicesReal.othersHint')}</p>
        <Button variant="outline" className="w-full" disabled={busy} onClick={signOutOthers}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} {t('devicesReal.signOutOthers')}
        </Button>
      </CardContent>
    </Card>
  );
}

interface ConnectedDevice {
  id: string;
  type: 'desktop' | 'tablet' | 'mobile';
  name: string;
  browser: string;
  location: string;
  lastActive: string;
  ip: string;
}

const mockDevices: ConnectedDevice[] = [
  { id: '1', type: 'desktop', name: 'PC Windows', browser: 'Chrome', location: 'Lisboa', lastActive: 'i18nA.activeTwoHours', ip: '192.168.XXX.XXX' },
  { id: '2', type: 'tablet', name: 'Tablet iPad', browser: 'Safari', location: 'Lisboa', lastActive: 'i18nA.activeThreeDays', ip: '10.0.XXX.XXX' },
];

const deviceIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function ConnectedDevicesSection() {
  const isDemo = useDirectory().isDemo;
  return isDemo ? <DemoConnectedDevices /> : <RealConnectedDevices />;
}

function DemoConnectedDevices() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<ConnectedDevice[]>(mockDevices);

  const disconnectDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const disconnectAll = () => {
    setDevices([]);
  };

  return (
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <CardTitle size="compact" className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            {t('sweep.devices.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map(device => {
                const Icon = deviceIcons[device.type];
                return (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{device.name} — {demoText(device.location)}</p>
                        <p className="text-xs text-muted-foreground">{t(device.lastActive)}</p>
                      </div>
                    </div>
                    <button aria-label={t('a11y.close')}
                      onClick={() => disconnectDevice(device.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title={t('devices.disconnect')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={disconnectAll}
                className="text-xs text-destructive hover:underline w-full text-center pt-1"
              >
                {t('devices.disconnectAll')}
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">{t('devices.noDevices')}</p>
          )}
        </CardContent>
      </Card>
  );
}
