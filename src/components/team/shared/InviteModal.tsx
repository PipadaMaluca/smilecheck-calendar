import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Link2, Check, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://smilecheck.app/convite/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>👥 {t('team.inviteDentist')}</DialogTitle>
          <DialogDescription>{t('team.inviteDesc')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1">{t('common.search')}</TabsTrigger>
            <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('team.inviteSearchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground text-center py-4">
              {t('team.inviteSearchHint')}
            </p>
          </TabsContent>

          <TabsContent value="email" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
              <Button size="sm" disabled={!email}>{t('team.send')}</Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open('https://wa.me/?text=https://smilecheck.app/convite/abc123')}>
          <MessageCircle className="w-4 h-4 text-green-500" />
          {t('team.inviteByWhatsapp')}
        </Button>

        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCopyLink}>
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
          {copied ? t('team.copied') : t('team.copyInviteLink')}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t('team.referralPointsHint')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
