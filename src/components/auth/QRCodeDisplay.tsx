import { useState, useEffect, useCallback } from 'react';
import { Smartphone, Camera, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface QRCodeDisplayProps {
  onAuthorized?: () => void;
}

function generateQRMatrix(): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      const isCorner =
        (i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7);
      const isCornerBorder =
        isCorner &&
        (i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= size - 7 && (i === size - 7 || i === size - 1)) ||
          (j >= size - 7 && (j === size - 7 || j === size - 1)));
      const isCornerInner =
        isCorner &&
        ((i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
          (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3) ||
          (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4));

      if (isCornerBorder || isCornerInner) {
        matrix[i][j] = true;
      } else if (isCorner) {
        matrix[i][j] = false;
      } else {
        const centerStart = Math.floor(size / 2) - 2;
        const centerEnd = Math.floor(size / 2) + 2;
        if (i >= centerStart && i <= centerEnd && j >= centerStart && j <= centerEnd) {
          matrix[i][j] = false;
        } else {
          matrix[i][j] = Math.random() > 0.5;
        }
      }
    }
  }
  return matrix;
}

export function QRCodeDisplay({ onAuthorized }: QRCodeDisplayProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(60);
  const [expired, setExpired] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>(() => generateQRMatrix());

  const refreshQR = useCallback(() => {
    setQrMatrix(generateQRMatrix());
    setCountdown(60);
    setExpired(false);
  }, []);

  useEffect(() => {
    if (expired || authorized) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expired, authorized]);

  const simulateAuth = async () => {
    setAuthorizing(true);
    await new Promise(r => setTimeout(r, 2000));
    setAuthorized(true);
    setAuthorizing(false);
    setTimeout(() => onAuthorized?.(), 1500);
  };

  if (authorized) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <p className="text-lg font-semibold text-foreground">{t('qrCode.authorized')}</p>
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (authorizing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('qrCode.verifying')}</p>
      </div>
    );
  }

  const cellSize = 8;
  const size = qrMatrix.length;
  const qrWidth = size * cellSize;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <div className={cn(
        "relative rounded-2xl p-3 sm:p-4 bg-white transition-all duration-300",
        expired ? "opacity-40 grayscale" : "",
        !expired && "shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
      )}>
        {!expired && (
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 animate-pulse pointer-events-none" />
        )}
        <svg width={qrWidth} height={qrWidth} viewBox={`0 0 ${size * cellSize} ${size * cellSize}`} className="block max-w-[200px] sm:max-w-[250px] w-full h-auto">
          {qrMatrix.map((row, i) =>
            row.map((cell, j) =>
              cell ? <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#1a1a2e" rx={1} /> : null
            )
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/assets/smilecheck-icon-watermark.png" alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-md" style={{ filter: 'none', opacity: 1 }} />
        </div>
        {expired && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">{t('qrCode.expired')}</p>
            <Button size="sm" onClick={refreshQR} className="gap-2">
              <RefreshCw className="w-4 h-4" /> {t('qrCode.generateNew')}
            </Button>
          </div>
        )}
      </div>

      {!expired && (
        <p className="text-xs text-muted-foreground">
          {t('qrCode.refreshIn')} <span className="font-mono font-semibold text-foreground">{countdown}s</span>
        </p>
      )}

      <div className="space-y-3 w-full">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div><p className="text-sm font-medium text-foreground">{t('qrCode.step1')}</p></div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <div><p className="text-sm font-medium text-foreground">{t('qrCode.step2')}</p></div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div><p className="text-sm font-medium text-foreground">{t('qrCode.step3')}</p></div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 text-center">{t('qrCode.autoRefresh')}</p>

      <Button variant="ghost" size="sm" onClick={simulateAuth} className="text-xs text-muted-foreground/40 hover:text-muted-foreground">
        {t('qrCode.simulateDemo')}
      </Button>
    </div>
  );
}
