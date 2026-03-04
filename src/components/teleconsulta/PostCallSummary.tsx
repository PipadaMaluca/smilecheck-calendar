import { useState } from 'react';
import { Star, Calendar, Clock, FileText, Image, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PostCallSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  isDentist: boolean;
  remoteName: string;
  duration: string;
  onScheduleNext?: () => void;
}

export function PostCallSummary({ isOpen, onClose, isDentist, remoteName, duration, onScheduleNext }: PostCallSummaryProps) {
  const [notes, setNotes] = useState('Paciente refere dor no dente 36. Dor ao mastigar, especialmente alimentos frios. Recomendada radiografia periapical.');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [nextSteps, setNextSteps] = useState({
    schedule: false,
    sendPrescription: false,
    followUp: false,
  });
  const [customStep, setCustomStep] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✅ Teleconsulta Concluída
          </DialogTitle>
          <DialogDescription>Resumo da consulta com {remoteName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Duration */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" /> Duração: <span className="font-semibold text-foreground">{duration}</span>
            </div>
          </div>

          {isDentist ? (
            <>
              {/* Dentist: Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Notas da Consulta</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[100px] bg-secondary/50 border-border text-sm"
                />
              </div>

              {/* Prescriptions issued */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Receitas Emitidas</label>
                <p className="text-sm text-muted-foreground italic">Nenhuma receita emitida durante a consulta.</p>
              </div>

              {/* Photos received */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Fotos Recebidas</label>
                <div className="flex gap-2">
                  {[1, 2].map(i => (
                    <div key={i} className="w-16 h-16 rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Próximos Passos</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.schedule} onCheckedChange={v => setNextSteps(p => ({ ...p, schedule: !!v }))} />
                    Agendar próxima consulta
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.sendPrescription} onCheckedChange={v => setNextSteps(p => ({ ...p, sendPrescription: !!v }))} />
                    Enviar receita ao paciente
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={nextSteps.followUp} onCheckedChange={v => setNextSteps(p => ({ ...p, followUp: !!v }))} />
                    Marcar follow-up em 2 semanas
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Guardar e Fechar
                </Button>
                <Button className="flex-1" onClick={() => { onClose(); onScheduleNext?.(); }}>
                  <Calendar className="w-4 h-4 mr-2" /> Agendar Próxima
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Patient: Info */}
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  O seu dentista irá partilhar as notas e receitas consigo.
                </p>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Avalie a Consulta</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={cn(
                        'w-8 h-8 transition-colors',
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Comentário (opcional)</label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Partilhe a sua experiência..."
                  className="min-h-[80px] bg-secondary/50 border-border text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                  Fechar
                </Button>
                <Button className="flex-1" onClick={onClose} disabled={rating === 0}>
                  Enviar Avaliação
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
