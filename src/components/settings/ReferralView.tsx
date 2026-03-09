import { useState } from 'react';
import { Copy, Share2, Check, Gift, Users, UserPlus, Coins, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { UserRole } from '@/types/calendar';

interface ReferralViewProps {
  userRole: UserRole;
}

// Generate a mock referral code based on user initials
const generateReferralCode = () => {
  const codes = ['SMILE-GP2026', 'SMILE-MS2026', 'SMILE-JC2026'];
  return codes[Math.floor(Math.random() * codes.length)];
};

const mockInvites = [
  { name: 'Maria Costa', status: 'registered', date: '15 Jan 2026', points: 10 },
  { name: 'Pedro Santos', status: 'consultation', date: '20 Jan 2026', points: 20 },
  { name: 'Ana Ferreira', status: 'pending', date: '3 dias', points: 0 },
];

export function ReferralView({ userRole }: ReferralViewProps) {
  const [copied, setCopied] = useState(false);
  const referralCode = 'SMILE-GP2026';
  const referralLink = `https://smilecheck.pt/r/${referralCode}`;
  
  // Patient gets 2x rewards
  const multiplier = userRole === 'patient' ? 2 : 1;
  const registerReward = 10 * multiplier;
  const consultationReward = 20 * multiplier;
  
  const totalPointsEarned = mockInvites
    .filter(i => i.status !== 'pending')
    .reduce((sum, i) => sum + i.points * multiplier, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copiado!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Junta-te ao SmileCheck!',
          text: `Usa o meu código ${referralCode} e ganha pontos de boas-vindas!`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">🎁 Convidar Amigos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ganhe pontos por cada amigo que se junta ao SmileCheck!
          </p>
        </div>

        {/* Referral Code */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">O seu Código de Convite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-secondary rounded-xl">
              <span className="text-2xl font-bold text-primary tracking-wider">{referralCode}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar código'}
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Partilhar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Link: <span className="text-primary">{referralLink}</span>
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">📤 Partilhe o seu código com amigos</p>
                  <p className="text-xs text-muted-foreground">Envie por WhatsApp, SMS ou email</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">👤 O seu amigo cria conta e insere o código</p>
                  <p className="text-xs text-muted-foreground">Durante o registo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">🎁 Ambos ganham pontos!</p>
                  <p className="text-xs text-muted-foreground">Recompensas instantâneas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recompensas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Convite aceite (amigo cria conta)</span>
              </div>
              <span className="text-sm font-bold text-primary">+{registerReward} XP, +{registerReward} pts</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-foreground">Bónus: amigo completa 1ª consulta</span>
              </div>
              <span className="text-sm font-bold text-yellow-500">+{consultationReward} XP, +{consultationReward} pts</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-500" />
                <span className="text-sm text-foreground">O seu amigo recebe</span>
              </div>
              <span className="text-sm font-bold text-green-500">+5 XP, +5 pts de boas-vindas</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground">Convidados</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-green-500">2</div>
                <div className="text-xs text-muted-foreground">Aceitaram</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">1</div>
                <div className="text-xs text-muted-foreground">1ª Consulta</div>
              </div>
              <div className="text-center p-3 bg-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalPointsEarned}</div>
                <div className="text-xs text-muted-foreground">Pts ganhos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite History */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Os seus Convites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockInvites.map((invite, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {invite.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{invite.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {invite.status === 'registered' && `✅ Conta criada — ${invite.date}`}
                      {invite.status === 'consultation' && `✅ 1ª consulta — ${invite.date}`}
                      {invite.status === 'pending' && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pendente — Enviado há {invite.date}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {invite.status !== 'pending' && (
                  <span className="text-sm font-bold text-green-500">
                    +{invite.points * multiplier} pts
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
