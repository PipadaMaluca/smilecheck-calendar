import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface NoTeleconsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  patientName: string;
}

export function NoTeleconsultaModal({ isOpen, onClose, onCreate, patientName }: NoTeleconsultaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sem Teleconsulta Agendada</DialogTitle>
          <DialogDescription>
            Não existe teleconsulta agendada com {patientName}. Deseja criar uma consulta rápida?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 gap-2 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white" onClick={onCreate}>
            <Video className="w-4 h-4" /> Criar Teleconsulta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
