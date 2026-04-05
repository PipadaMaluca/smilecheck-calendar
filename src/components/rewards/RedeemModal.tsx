import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RewardProduct } from '@/data/rewardsData';

interface RedeemModalProps {
  product: RewardProduct | null;
  userPoints: number;
  onClose: () => void;
  onConfirm: () => void;
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg1 = 'SC';
  const seg2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join('');
  const seg3 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg1}-${seg2}-${seg3}`;
}

export function RedeemModal({ product, userPoints, onClose, onConfirm }: RedeemModalProps) {
  const { t } = useTranslation();
  const [redeemed, setRedeemed] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConfirm = () => {
    const newCode = generateCode();
    setCode(newCode);
    setRedeemed(true);
    onConfirm();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t('store.codeCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setRedeemed(false);
    setCode('');
    setCopied(false);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!redeemed ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('store.confirmRedeem')}</DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.emoji || '🎁'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    {product.discount && (
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400 mt-1">
                        {product.discount} {t('store.discount')}
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('store.cost')}:</span>
                <span className="font-bold text-foreground">{product.points.toLocaleString()} {t('store.points')}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{t('store.balanceAfter')}</p>
                <p className="text-lg font-bold text-foreground">{(userPoints - product.points).toLocaleString()} {t('store.points')}</p>
              </div>
              <p className="text-xs text-muted-foreground italic">
                {product.discount ? t('store.discountNote') : t('store.codeNote')}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
              <Button onClick={handleConfirm}>{t('store.confirmBtn')}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('store.redeemConfirmed')}</DialogTitle>
              <DialogDescription>
                {t('store.yourCode')} "{product.name}":
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-xl font-mono font-bold text-foreground tracking-wider">{code}</p>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('store.copied') : t('store.copyCode')}
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('store.emailSent')}</p>
                <p>{t('store.validity')}</p>
                {product.discount ? <p>{t('store.useDiscount')}</p> : <p>{t('store.useSite')}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">{t('common.close')}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
