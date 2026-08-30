import { useState, useEffect } from 'react';
import { User, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface IncomingCallModalProps {
  isOpen: boolean;
  dentistName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({ isOpen, dentistName, onAccept, onReject }: IncomingCallModalProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!isOpen) { setTimeLeft(60); return; }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { onReject(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onReject]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-[#0a0a0f]/95 backdrop-blur-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-8 max-w-sm text-center animate-fade-in">
        {/* Pulsing avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <User className="w-14 h-14 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white/50 text-sm">{t('incomingCall.starting')}</p>
          <h2 className="text-2xl font-bold text-white">{dentistName}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            <Video className="w-3.5 h-3.5" /> {t('incomingCall.teleconsulta')}
          </span>
        </div>

        <p className="text-xs text-white/30">
          {t('incomingCall.autoReject', { n: timeLeft })}
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-8"
            onClick={onReject}
          >
            <Phone className="w-5 h-5 rotate-[135deg]" /> {t('incomingCall.reject')}
          </Button>
          <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8"
            onClick={onAccept}
          >
            <Phone className="w-5 h-5" /> {t('incomingCall.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
