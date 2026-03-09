import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface RemoveModalProps {
  open: boolean;
  onClose: () => void;
  dentistName: string;
  otherDentists: { id: string; name: string }[];
}

export function RemoveModal({ open, onClose, dentistName, otherDentists }: RemoveModalProps) {
  const [transferTo, setTransferTo] = useState('');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Remover da Equipa
          </DialogTitle>
          <DialogDescription>
            Tem a certeza que deseja remover {dentistName}? Esta ação irá solicitar feedback mútuo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Transferir consultas para:</label>
            <Select value={transferTo} onValueChange={setTransferTo}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecionar dentista..." />
              </SelectTrigger>
              <SelectContent>
                {otherDentists.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" size="sm" onClick={onClose}>Remover</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
