import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsultationScore } from '@/types/scoring';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface PatientFeedbackModalProps {
  score: ConsultationScore | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scoreId: string, rating: number, comment: string) => void;
}

export function PatientFeedbackModal({ score, isOpen, onClose, onSubmit }: PatientFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!score || rating === 0) return;
    onSubmit(score.id, rating, comment);
    toast.success('Feedback enviado! Os seus pontos foram creditados.');
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  if (!score) return null;

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Consulta</DialogTitle>
          <DialogDescription>
            Dê o seu feedback sobre a consulta com {score.dentistName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Consultation info */}
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground">{score.dentistName}</p>
            <p className="text-xs text-muted-foreground">
              {format(score.date, "d 'de' MMMM", { locale: pt })} • {score.clinicName}
            </p>
          </div>

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Avaliação geral</p>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-9 h-9 transition-colors',
                      star <= displayRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                {displayRating === 1 ? 'Mau' : displayRating === 2 ? 'Razoável' : displayRating === 3 ? 'Bom' : displayRating === 4 ? 'Muito Bom' : 'Excelente'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Comentário <span className="text-muted-foreground font-normal">(opcional)</span></p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partilhe a sua experiência..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={rating === 0}>
              Enviar Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
