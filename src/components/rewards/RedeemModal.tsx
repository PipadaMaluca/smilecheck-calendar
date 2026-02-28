import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
    toast.success('Código copiado!');
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
              <DialogTitle>Confirmar resgate?</DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.emoji || '🎁'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    {product.discount && (
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400 mt-1">
                        {product.discount} desconto
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo:</span>
                <span className="font-bold text-foreground">{product.points.toLocaleString()} pontos</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Saldo após resgate</p>
                <p className="text-lg font-bold text-foreground">{(userPoints - product.points).toLocaleString()} pontos</p>
              </div>
              <p className="text-xs text-muted-foreground italic">
                {product.discount
                  ? 'Receberá um código de desconto para usar na compra.'
                  : 'Receberá um código para trocar no site da marca.'}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleConfirm}>Confirmar Resgate</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Resgate confirmado! 🎉</DialogTitle>
              <DialogDescription>
                O seu código de resgate para "{product.name}":
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-4 text-center">
                <p className="text-xl font-mono font-bold text-foreground tracking-wider">{code}</p>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar código'}
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>📧 Um email foi enviado com os detalhes do resgate.</p>
                <p>⏱️ Validade: 30 dias a partir de hoje.</p>
                {product.discount
                  ? <p>🛒 Apresente este código na compra para obter o desconto.</p>
                  : <p>🌐 Use este código no site da marca para trocar o produto.</p>
                }
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
