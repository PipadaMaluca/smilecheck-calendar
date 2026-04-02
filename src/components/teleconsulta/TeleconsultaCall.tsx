import { useState, useEffect, useRef } from 'react';
import { User, Mic, MicOff, Video, VideoOff, MessageCircle, Paperclip, FileText, Monitor, Phone, Clock, Wifi, X, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import smileIcon from '@/assets/smilecheck-icon.png';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  id: string;
  sender: 'dentist' | 'patient';
  text: string;
  time: string;
  isImage?: boolean;
}

interface TeleconsultaCallProps {
  userRole: UserRole;
  patientName: string;
  dentistName: string;
  onEnd: () => void;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: '1', sender: 'patient', text: 'Bom dia Dr., tenho tido dores no dente 36', time: '10:31' },
  { id: '2', sender: 'dentist', text: 'Bom dia! Vou pedir que me mostre a zona afetada.', time: '10:31' },
  { id: '3', sender: 'patient', text: 'Claro, vou aproximar a câmara.', time: '10:32' },
];

export function TeleconsultaCall({ userRole, patientName, dentistName, onEnd }: TeleconsultaCallProps) {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'notes' | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState('Paciente refere dor no dente 36. Dor ao mastigar, especialmente alimentos frios.');
  const isDentist = userRole === 'dentist' || userRole === 'clinic';
  const remoteName = isDentist ? patientName : dentistName;
  const selfName = isDentist ? dentistName : patientName;

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: isDentist ? 'dentist' : 'patient',
      text: chatInput,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }]);
    setChatInput('');
  };

  const togglePanel = (panel: 'chat' | 'notes') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col">
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0"
        style={{ backgroundImage: `url(${smileIcon})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '30%' }} />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{remoteName}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400">
              <Video className="w-3 h-3" /> {t('teleconsult.title')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400">{t('teleconsult.stable')}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onEnd}
          >
            <Phone className="w-3.5 h-3.5 rotate-[135deg]" /> {t('teleconsult.endCall')}
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className={cn('flex-1 flex flex-col relative', activePanel && 'md:mr-0')}>
          {/* Remote video (placeholder) */}
          <div className="flex-1 flex items-center justify-center bg-[#111118] relative">
            <div className="flex flex-col items-center gap-4 text-white/30">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <p className="text-lg font-medium">{remoteName}</p>
              {isCameraOff && <p className="text-xs text-white/20">{t('teleconsult.cameraOff')}</p>}
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600/20 border border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-medium text-red-400">LIVE</span>
            </div>
          </div>

          {/* Self-view (floating) */}
          <div className="absolute bottom-20 right-4 w-32 h-24 md:w-44 md:h-32 rounded-xl bg-[#1a1a24] border border-white/10 overflow-hidden shadow-2xl">
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-white/20">
                <User className="w-6 h-6" />
                <span className="text-[10px]">{selfName}</span>
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 md:gap-3 py-3 px-4 bg-gradient-to-t from-black/80 to-transparent">
            <ToolbarButton
              icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              label={isMuted ? t('teleconsult.unmute') : t('teleconsult.mute')}
              active={!isMuted}
              danger={isMuted}
              onClick={() => setIsMuted(!isMuted)}
            />
            <ToolbarButton
              icon={isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              label={isCameraOff ? 'Câmara off' : 'Câmara'}
              active={!isCameraOff}
              danger={isCameraOff}
              onClick={() => setIsCameraOff(!isCameraOff)}
            />
            <ToolbarButton
              icon={<MessageCircle className="w-5 h-5" />}
              label="Chat"
              active={activePanel === 'chat'}
              onClick={() => togglePanel('chat')}
            />
            <ToolbarButton
              icon={<Paperclip className="w-5 h-5" />}
              label="Foto"
              onClick={() => {/* file picker mock */}}
            />
            {isDentist && (
              <>
                <ToolbarButton
                  icon={<FileText className="w-5 h-5" />}
                  label="Notas"
                  active={activePanel === 'notes'}
                  onClick={() => togglePanel('notes')}
                />
                <ToolbarButton
                  icon={<Monitor className="w-5 h-5" />}
                  label="Ecrã"
                  active={isScreenSharing}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                />
              </>
            )}
            {/* Mobile end call */}
            <div className="md:hidden">
              <ToolbarButton
                icon={<Phone className="w-5 h-5 rotate-[135deg]" />}
                label="Desligar"
                danger
                onClick={onEnd}
              />
            </div>
          </div>
        </div>

        {/* Side panels */}
        {activePanel && (
          <div className="fixed md:static inset-0 md:inset-auto z-20 md:z-auto md:w-80 lg:w-96 bg-[#12121a] border-l border-white/5 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">
                {activePanel === 'chat' ? 'Chat' : 'Notas da Consulta'}
              </h3>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white h-8 w-8" onClick={() => setActivePanel(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {activePanel === 'chat' ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={cn('flex', msg.sender === (isDentist ? 'dentist' : 'patient') ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[80%] rounded-xl px-3 py-2',
                          msg.sender === (isDentist ? 'dentist' : 'patient')
                            ? 'bg-primary/20 text-primary-foreground'
                            : 'bg-white/5 text-white/80'
                        )}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-[10px] text-white/30 mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-white/5 flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Escrever mensagem..."
                    className="flex-1 bg-white/5 border-white/10 text-white text-sm"
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <Button size="icon" className="shrink-0" onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 p-4">
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notas da consulta..."
                  className="min-h-[300px] bg-white/5 border-white/10 text-white text-sm"
                />
                <p className="text-[10px] text-white/30 mt-2">Auto-guardado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label, active, danger, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl transition-all',
        danger ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' :
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      )}
    >
      {icon}
      <span className="text-[10px] hidden md:block">{label}</span>
    </button>
  );
}
