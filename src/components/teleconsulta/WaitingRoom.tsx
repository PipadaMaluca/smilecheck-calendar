import { useState } from 'react';
import { User, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface WaitingRoomProps {
  isOpen: boolean;
  dentistName: string;
  onLeave: () => void;
}

export function WaitingRoom({ isOpen, dentistName, onLeave }: WaitingRoomProps) {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-64 h-48 md:w-80 md:h-60 rounded-2xl bg-[#1a1a24] border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-white/20">
          <User className="w-10 h-10" />
          <span className="text-xs">{t('teleconsult.yourCamera')}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <h2 className="text-lg font-semibold text-white">{t('teleconsult.waitingFor')} {dentistName}...</h2>
        <p className="text-sm text-white/40">{t('teleconsult.waitingSubtitle')}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={cn('p-3 rounded-xl transition-colors', isMuted ? 'bg-red-600/20 text-red-400' : 'bg-white/10 text-white')}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setIsCameraOff(!isCameraOff)}
          className={cn('p-3 rounded-xl transition-colors', isCameraOff ? 'bg-red-600/20 text-red-400' : 'bg-white/10 text-white')}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>

      <Button variant="outline" className="border-white/10 text-white/60 hover:text-white" onClick={onLeave}>
        {t('teleconsult.leaveWaiting')}
      </Button>
    </div>
  );
}
