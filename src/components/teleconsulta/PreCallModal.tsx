import { User, AlertTriangle, Pill, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PreCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  patientName: string;
}

export function PreCallModal({ isOpen, onClose, onStart, patientName }: PreCallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Teleconsulta</DialogTitle>
          <DialogDescription>Confirme antes de iniciar a chamada</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient info */}
          <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{patientName}</p>
              <p className="text-xs text-muted-foreground">51 anos • Feminino</p>
            </div>
          </div>

          {/* Health alerts */}
          <div className="bg-destructive/10 rounded-xl p-3 space-y-2 border border-destructive/20">
            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Alertas de Saúde
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium">Penicilina</span>
              <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium">Látex</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400">
              <Pill className="w-3 h-3" /> Varfarina — Risco com AINEs
            </div>
          </div>

          {/* Last consultation */}
          <div className="bg-secondary/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Última consulta</p>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>15 Jan 2026 — Restauração</span>
            </div>
            <p className="text-xs text-muted-foreground">Dente 15 face oclusal</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-[hsl(var(--teleconsulta))] hover:bg-[hsl(var(--teleconsulta))]/90 text-white" onClick={onStart}>
            Iniciar Teleconsulta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
