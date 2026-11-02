import type * as React from "react";
import { formatDate } from '@/lib/formatters';
import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Mail, Smartphone, Gift, Users, Share2, Download, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { WhatsAppIcon, TelegramIcon, MessengerIcon, FacebookIcon, XIcon, LinkedInIcon, InstagramIcon, TikTokIcon } from './SocialIcons';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mockClinics, mockDentists, mockFamilyMembers } from '@/data/mockData';
import { buildReferralCode, REFERRAL_ACTION_KEY, SUSPENDED_ACTIONS } from '@/lib/referral';

interface InviteViewProps {
  onClose: () => void;
  inline?: boolean;
}

type InviteRow = { name: string; date: string; status: 'confirmed' | 'pending' };

const MOCK_HISTORY: InviteRow[] = [
  { name: 'Maria S.', date: '2026-01-10', status: 'confirmed' as const },
  { name: 'Pedro A.', date: '2026-01-05', status: 'confirmed' as const },
  { name: 'Ana F.', date: '2026-01-02', status: 'pending' as const },
  { name: 'Carlos M.', date: '2025-12-28', status: 'confirmed' as const },
];

export function InviteView({ onClose, inline }: InviteViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  // Tablet follows desktop, so only true mobile widths use the stacked layout.
  const isTabletOrBelow = isMobile;
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { user, profile, role } = useAuth();
  const ownerName = user
    ? profile?.full_name ?? user.email ?? ''
    : role === 'dentist' ? mockDentists[0].name : role === 'clinic' ? mockClinics[0].name : mockFamilyMembers[0].name;
  const code = (user && profile?.referral_code) || buildReferralCode(ownerName, user?.id ?? `demo-${role}`);
  const link = `${window.location.origin}/invite/${code}`;

  // Real reward comes from points_rules; while the server suspends the action, promise nothing.
  const suspended = SUSPENDED_ACTIONS.includes(REFERRAL_ACTION_KEY);
  const [rulePoints, setRulePoints] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    void supabase.from('points_rules').select('points').eq('role', role).eq('action_key', REFERRAL_ACTION_KEY).maybeSingle()
      .then(({ data }) => { if (!cancelled) setRulePoints(data?.points ?? null); });
    return () => { cancelled = true; };
  }, [role]);
  // Real accounts: own referrals (RLS: inviter/invitee only) + level-2 points from the own points ledger.
  const [history, setHistory] = useState<InviteRow[]>(user ? [] : MOCK_HISTORY);
  const [level2Points, setLevel2Points] = useState(0);
  useEffect(() => {
    if (!user) { setHistory(MOCK_HISTORY); setLevel2Points(0); return; }
    let cancelled = false;
    void Promise.all([
      supabase.from('referrals').select('created_at, validated_at').eq('inviter_id', user.id).order('created_at', { ascending: false }),
      supabase.from('points_ledger').select('amount').eq('profile_id', user.id).eq('type', 'reward_points').eq('reason', 'Convite de um convidado'),
    ]).then(([refs, l2]) => {
      if (cancelled) return;
      setHistory((refs.data ?? []).map((r, i) => ({
        name: t('invite.invitedPerson', { n: (refs.data?.length ?? 0) - i }),
        date: r.created_at,
        status: r.validated_at ? 'confirmed' : 'pending',
      })));
      setLevel2Points((l2.data ?? []).reduce((a, r) => a + r.amount, 0));
    });
    return () => { cancelled = true; };
  }, [user, t]);
  const confirmedCount = history.filter(h => h.status === 'confirmed').length;
  const shareMessage = t('invite.shareMessage', { code, link });

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    toast.success(t('common.copied'));
  };

  // Only the app/invite is shared — never a dentist or clinic. Points come only from the referral rule, never from sharing.
  const enc = encodeURIComponent;
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const shareNative = async () => {
    try { await navigator.share({ title: t('invite.emailSubject'), text: shareMessage, url: link }); } catch { /* cancelled */ }
  };
  const copyForStory = () => { navigator.clipboard.writeText(link); toast.success(t('invite.copiedForStory')); };
  const downloadQr = () => {
    const canvas = document.getElementById('invite-qr') as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = `smilecheck-${code}.png`; a.click();
  };
  const shareTargets: { id: string; label: string; Icon: React.ComponentType<{ className?: string }>; onClick: () => void; copyOnly?: boolean; by?: string }[] = [
    { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, onClick: () => open(`https://wa.me/?text=${enc(shareMessage)}`) },
    { id: 'telegram', label: 'Telegram', Icon: TelegramIcon, onClick: () => open(`https://t.me/share/url?url=${enc(link)}&text=${enc(t('invite.shareMessage', { code, link: '' }).trim())}`) },
    { id: 'messenger', label: 'Messenger', Icon: MessengerIcon, onClick: () => {
      // Messenger has no public web share URL: the app link opens the native composer; on desktop we copy and open Messenger.
      if (/Android|iPhone|iPad/i.test(navigator.userAgent)) { window.location.href = `fb-messenger://share/?link=${enc(link)}`; return; }
      navigator.clipboard.writeText(shareMessage); toast.success(t('invite.copiedForMessenger')); open('https://www.messenger.com/');
    } },
    { id: 'facebook', label: 'Facebook', Icon: FacebookIcon, onClick: () => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`) },
    { id: 'x', label: 'X', Icon: XIcon, onClick: () => open(`https://twitter.com/intent/tweet?text=${enc(shareMessage)}`) },
    { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, onClick: () => open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(link)}`) },
    { id: 'email', label: t('invite.channelEmail'), Icon: Mail, by: t('invite.channelByEmail'), onClick: () => { window.location.href = `mailto:?subject=${enc(t('invite.emailSubject'))}&body=${enc(shareMessage)}`; } },
    { id: 'sms', label: 'SMS', Icon: Smartphone, by: 'SMS', onClick: () => { window.location.href = `sms:?&body=${enc(shareMessage)}`; } },
    { id: 'instagram', label: 'Instagram', Icon: InstagramIcon, onClick: copyForStory, copyOnly: true },
    { id: 'tiktok', label: 'TikTok', Icon: TikTokIcon, onClick: copyForStory, copyOnly: true },
  ];

  const inviteContent = (
    <div className="px-4 py-5 md:p-6 max-w-lg mx-auto space-y-5 md:space-y-6 pb-32 w-full overflow-x-hidden">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-9 h-9 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Gift className="w-5 h-5 md:w-8 md:h-8 text-primary" />
        </div>
        <h2 className="text-base md:text-xl font-bold text-foreground px-2">{suspended ? t('invite.headlineNoPoints') : t('invite.headline')}</h2>
        {suspended ? (
          <Badge variant="secondary" className="mx-auto">{t('invite.comingSoon')}</Badge>
        ) : rulePoints !== null ? (
          <>
            <p className="text-sm md:text-sm text-muted-foreground px-4 leading-snug">{t('invite.subtitlePoints', { count: rulePoints })}</p>
            <p className="text-xs text-muted-foreground px-4 leading-snug">{t('invite.rulesDetail')}</p>
          </>
        ) : null}
        {suspended && <p className="text-sm md:text-sm text-muted-foreground px-4 leading-snug">{t('invite.subtitleComingSoon')}</p>}
      </div>

      {/* QR code */}
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardContent className="pt-4 px-3 md:px-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><QrCode className="w-4 h-4 text-primary" /> {t('invite.qrTitle')}</p>
          <p className="text-xs text-muted-foreground">{t('invite.qrDesc')}</p>
          <div className="rounded-xl bg-background p-3 border border-border">
            {/* QR must stay dark-on-light in both themes so every camera reads it */}
            <QRCodeCanvas id="invite-qr" value={link} size={176} marginSize={2} bgColor="#ffffff" fgColor="#000000" level="M" title={t('invite.qrAlt')} />
          </div>
          <Button variant="outline" className="h-11 gap-2" onClick={downloadQr}>
            <Download className="w-4 h-4" /> {t('invite.qrDownload')}
          </Button>
        </CardContent>
      </Card>

      {/* Code & Link */}
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardContent className="pt-4 px-3 md:px-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">{t('invite.codeLabel')}</label>
            <div className="flex items-center gap-2">
              <div id="coachmark-referral-code" className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base font-mono font-bold text-foreground tracking-widest text-center truncate">{code}</div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(code, 'code')} className="gap-1.5 flex-shrink-0 h-11 w-11 md:w-auto p-0 md:px-3" aria-label={t('common.copy')}>
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden md:inline">{copiedCode ? t('invite.copied') : t('common.copy')}</span>
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">{t('invite.linkLabel')}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-sm text-muted-foreground truncate">{link}</div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(link, 'link')} className="gap-1.5 flex-shrink-0 h-11 w-11 md:w-auto p-0 md:px-3" aria-label={t('common.copy')}>
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden md:inline">{copiedLink ? t('invite.copied') : t('common.copy')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">{t('invite.shareVia')}</p>
        {canNativeShare && (
          <Button className="w-full h-11 gap-2" onClick={shareNative}>
            <Share2 className="w-4 h-4" /> {t('invite.shareNative')}
          </Button>
        )}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {shareTargets.map(({ id, label, Icon, onClick, copyOnly, by }) => (
            <Button
              key={id}
              variant="outline"
              className="flex-col h-16 px-1 gap-1"
              onClick={onClick}
              aria-label={copyOnly ? t('invite.copyForA11y', { network: label }) : (by ? t('invite.shareByA11y', { channel: by }) : t('invite.shareOnA11y', { network: label }))}
            >
              <Icon className="w-5 h-5 text-foreground" />
              <span className="text-2xs truncate max-w-full">{label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t('invite.storyHint')}</p>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="p-2 md:pt-4 md:pb-3 md:px-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-foreground leading-tight">{history.length}</p>
            <p className="text-2xs md:text-2xs text-muted-foreground mt-0.5 whitespace-nowrap">{t('invite.invited')}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="p-2 md:pt-4 md:pb-3 md:px-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-emerald-500 leading-tight">{confirmedCount}</p>
            <p className="text-2xs md:text-2xs text-muted-foreground mt-0.5 whitespace-nowrap">{t('invite.confirmed')}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="p-2 md:pt-4 md:pb-3 md:px-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-warning leading-tight">{suspended || rulePoints === null ? '—' : confirmedCount * rulePoints + level2Points}</p>
            <p className="text-2xs md:text-2xs text-muted-foreground mt-0.5 whitespace-nowrap"><span className="md:hidden">{t('invite.pointsEarnedShort')}</span><span className="hidden md:inline">{t('invite.pointsEarned')}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-2"><CardTitle size="compact">{t('invite.history')}</CardTitle></CardHeader>
        <CardContent className="space-y-0 divide-y divide-border px-3 md:px-6">
          {history.length === 0 && <p className="py-4 text-sm text-muted-foreground">{t('invite.noInvitesYet')}</p>}
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 md:py-3 gap-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm md:text-sm text-foreground truncate">{h.name}</p>
                  <p className="text-2xs md:text-xs text-muted-foreground truncate">{formatDate(h.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                <Badge variant={h.status === 'confirmed' ? 'default' : 'secondary'} className="text-2xs">
                  {h.status === 'confirmed' ? t('invite.statusConfirmed') : t('invite.statusPending')}
                </Badge>
                {!suspended && rulePoints !== null && h.status === 'confirmed' && <span className="text-2xs md:text-xs font-medium text-warning whitespace-nowrap">{t('invite.pointsShort', { count: rulePoints })}</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const coachMark = (
    <CoachMark
      id="invite"
      targetId="coachmark-referral-code"
      title={t('coachmarks.inviteTitle')}
      description={t('coachmarks.inviteDesc')}
    />
  );

  // Inline mode
  if (inline) {
    return <>{inviteContent}{coachMark}</>;
  }

  if (isMobile || isTabletOrBelow) {
    return (
      <FullScreenMobileOverlay>
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <Button aria-label={t('a11y.back')} variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-base font-semibold">{t('nav.inviteFriends')}</h2>
        </div>
        <ScrollArea className="flex-1">{inviteContent}</ScrollArea>
        {coachMark}
      </FullScreenMobileOverlay>
    );
  }

  return (
    <div className="fixed inset-0 scrim z-modal flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
          <Button aria-label={t('a11y.back')} variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-base font-semibold">{t('nav.inviteFriends')}</h2>
        </div>
        <ScrollArea className="flex-1">{inviteContent}</ScrollArea>
        {coachMark}
      </div>
    </div>
  );
}
