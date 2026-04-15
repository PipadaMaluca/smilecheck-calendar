import { useState } from 'react';
import { ArrowLeft, Copy, Check, MessageCircle, Mail, Smartphone, UserPlus, Gift, Users, Clock } from 'lucide-react';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface InviteViewProps {
  onClose: () => void;
  inline?: boolean;
}

const MOCK_HISTORY = [
  { name: 'Maria S.', date: '10 Jan 2026', status: 'confirmed' as const, points: 50 },
  { name: 'Pedro A.', date: '5 Jan 2026', status: 'confirmed' as const, points: 50 },
  { name: 'Ana F.', date: '2 Jan 2026', status: 'pending' as const, points: 0 },
  { name: 'Carlos M.', date: '28 Dez 2025', status: 'confirmed' as const, points: 50 },
];

export function InviteView({ onClose, inline }: InviteViewProps) {
  const isMobile = useIsMobile();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const code = 'GONCALO2026';
  const link = `smilecheck.app/invite/${code}`;
  const shareMessage = `Experimenta o SmileCheck! Usa o meu código ${code} ao registares-te e ganha pontos. ${link}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    toast.success('Copiado!');
  };

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  const shareEmail = () => window.open(`mailto:?subject=Experimenta o SmileCheck!&body=${encodeURIComponent(shareMessage)}`, '_blank');
  const shareSMS = () => window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank');

  const inviteContent = (
    <div className="p-5 md:p-6 max-w-lg mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Convide amigos e ganhe pontos!</h2>
        <p className="text-sm text-muted-foreground">Ganhe 50 pontos por cada pessoa que se registar</p>
      </div>

      {/* Code & Link */}
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardContent className="pt-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Código de convite pessoal</label>
            <div className="flex items-center gap-2">
              <div id="coachmark-referral-code" className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-base font-mono font-bold text-foreground tracking-widest text-center">{code}</div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(code, 'code')} className="gap-1.5">
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Link de convite</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-2.5 text-sm text-muted-foreground truncate">{link}</div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(link, 'link')} className="gap-1.5">
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Partilhar via</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="flex-col h-auto py-3 gap-1.5" onClick={shareWhatsApp}>
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 gap-1.5" onClick={shareEmail}>
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-xs">Email</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 gap-1.5" onClick={shareSMS}>
            <Smartphone className="w-5 h-5 text-primary" />
            <span className="text-xs">SMS</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-foreground">7</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Convidadas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">3</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Confirmadas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-amber-400">150</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pontos ganhos</p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico de Convites</CardTitle></CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {MOCK_HISTORY.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={h.status === 'confirmed' ? 'default' : 'secondary'} className="text-[10px]">
                  {h.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </Badge>
                {h.points > 0 && <span className="text-xs font-medium text-amber-400">+{h.points} pts</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Inline mode
  if (inline) {
    return inviteContent;
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-[70] flex flex-col pb-[60px]">
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-base font-semibold">Convidar Amigos</h2>
        </div>
        <ScrollArea className="flex-1">{inviteContent}</ScrollArea>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-base font-semibold">Convidar Amigos</h2>
        </div>
        <ScrollArea className="flex-1">{inviteContent}</ScrollArea>
      </div>
    </div>
  );
}
