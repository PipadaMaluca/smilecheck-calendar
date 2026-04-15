import { useState } from 'react';
import { Monitor, Tablet, Smartphone, X, Link2, Camera, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
  { id: '1', type: 'desktop', name: 'PC Windows', browser: 'Chrome', location: 'Lisboa', lastActive: 'Ativo há 2h', ip: '192.168.XXX.XXX' },
  { id: '2', type: 'tablet', name: 'Tablet iPad', browser: 'Safari', location: 'Lisboa', lastActive: 'Ativo há 3 dias', ip: '10.0.XXX.XXX' },
];

const deviceIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

type ScanPhase = 'idle' | 'scanning' | 'confirm' | 'authorized';

export function ConnectedDevicesSection() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<ConnectedDevice[]>(mockDevices);
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [showScanner, setShowScanner] = useState(false);

  const disconnectDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const disconnectAll = () => {
    setDevices([]);
  };

  const startScan = () => {
    setShowScanner(true);
    setScanPhase('scanning');
    // Simulate QR detection after 2 seconds
    setTimeout(() => setScanPhase('confirm'), 2000);
  };

  const authorizeDevice = () => {
    setScanPhase('authorized');
    setTimeout(() => {
      setDevices(prev => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'desktop',
          name: 'PC Windows',
          browser: 'Chrome',
          location: 'Lisboa, Portugal',
          lastActive: 'Ativo agora',
          ip: '192.168.XXX.XXX',
        },
      ]);
      setShowScanner(false);
      setScanPhase('idle');
    }, 1500);
  };

  return (
    <>
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Dispositivos Conectados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={startScan} className="w-full gap-2">
            <Camera className="w-4 h-4" /> Conectar novo dispositivo
          </Button>

          {devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map(device => {
                const Icon = deviceIcons[device.type];
                return (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{device.name} — {device.location}</p>
                        <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                      </div>
                    </div>
                    <button
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
                Desconectar todos os dispositivos
              </button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum dispositivo conectado</p>
          )}
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={(open) => { if (!open) { setShowScanner(false); setScanPhase('idle'); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {scanPhase === 'scanning' && 'Aponte para o código QR'}
              {scanPhase === 'confirm' && 'Novo dispositivo detetado'}
              {scanPhase === 'authorized' && 'Dispositivo conectado!'}
            </DialogTitle>
            <DialogDescription>
              {scanPhase === 'scanning' && 'Mostrado no ecrã do dispositivo onde quer entrar'}
              {scanPhase === 'confirm' && 'Verifique os detalhes antes de autorizar'}
              {scanPhase === 'authorized' && 'Login autorizado com sucesso'}
            </DialogDescription>
          </DialogHeader>

          {scanPhase === 'scanning' && (
            <div className="flex flex-col items-center gap-4 py-6">
              {/* Simulated camera view */}
              <div className="w-56 h-56 rounded-xl bg-muted/30 border-2 border-dashed border-primary/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-4 border-2 border-primary rounded-lg animate-pulse" />
                <Camera className="w-10 h-10 text-muted-foreground" />
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">A procurar código QR...</p>
            </div>
          )}

          {scanPhase === 'confirm' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">PC Windows — Chrome</span>
                </div>
                <p className="text-xs text-muted-foreground">Lisboa, Portugal</p>
                <p className="text-xs text-muted-foreground font-mono">IP: 192.168.XXX.XXX</p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500/90">Apenas autorize se reconhece este dispositivo</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowScanner(false); setScanPhase('idle'); }}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={authorizeDevice}>
                  Autorizar Login
                </Button>
              </div>
            </div>
          )}

          {scanPhase === 'authorized' && (
            <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm font-medium text-foreground">Dispositivo conectado com sucesso!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
