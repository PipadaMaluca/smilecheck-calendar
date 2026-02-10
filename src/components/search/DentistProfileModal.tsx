import { useState } from 'react';
import { Star, MapPin, Clock, Video, X, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DentistSearchResult,
  LEVEL_CONFIG,
  getReviewsForDentist,
  getAvailabilityForDentist,
} from '@/data/mockDentistSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { BookingFlow } from '@/components/booking/BookingFlow';

interface DentistProfileModalProps {
  dentist: DentistSearchResult;
  onClose: () => void;
  onGoHome?: () => void;
}

export function DentistProfileModal({ dentist, onClose, onGoHome }: DentistProfileModalProps) {
  const isMobile = useIsMobile();
  const [showBooking, setShowBooking] = useState(false);
  const levelCfg = LEVEL_CONFIG[dentist.level];
  const reviews = getReviewsForDentist(dentist.id);
  const availability = getAvailabilityForDentist(dentist.id);

  const initials = dentist.name
    .split(' ')
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .map((n) => n[0])
    .join('');

  if (showBooking) {
    return (
      <BookingFlow
        dentist={dentist}
        onClose={() => setShowBooking(false)}
        onComplete={() => { if (onGoHome) onGoHome(); else { setShowBooking(false); onClose(); } }}
      />
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Header with avatar */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{dentist.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{dentist.rating}</span>
              <span className="text-xs text-muted-foreground">({dentist.reviewCount} avaliações)</span>
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {levelCfg.label}
            </span>
          </div>
          {dentist.previousPatient && (
            <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              Já Consultou
            </span>
          )}
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {dentist.specialties.map((s) => (
          <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-accent text-foreground border border-border">
            {s}
          </span>
        ))}
      </div>

      {/* Info row */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>{dentist.distance} km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Video className="w-4 h-4" />
          <span>€{dentist.teleconsultaPrice}</span>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-secondary rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Sobre</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{dentist.bio}</p>
      </div>

      {/* Clinics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Clínicas</h3>
        <div className="space-y-2">
          {dentist.clinics.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-sm text-foreground">{c.name}</span>
                <p className="text-xs text-muted-foreground">{c.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Horários Disponíveis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availability.map((day) => (
            <div key={day.date} className="bg-secondary rounded-lg p-2.5">
              <p className="text-xs font-semibold text-foreground mb-1.5">{day.dayLabel}</p>
              <div className="flex flex-wrap gap-1">
                {day.slots.map((slot) => (
                  <button
                    key={slot}
                    className="text-[10px] px-2 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 transition-colors border border-primary/20"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Avaliações Recentes</h3>
        <div className="space-y-2">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="bg-secondary rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{review.patientName}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{review.comment}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{review.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-3 pb-2">
        <Button className="flex-1 bg-primary hover:bg-primary/90 h-11" onClick={() => setShowBooking(true)}>
          <Calendar className="w-4 h-4 mr-2" />
          Marcar Consulta
        </Button>
        <Button variant="outline" className="flex-1 border-border h-11">
          <MessageCircle className="w-4 h-4 mr-2" />
          Enviar Mensagem
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[55] bg-background" style={{ bottom: '60px' }}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Perfil do Dentista</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="h-[calc(100%-57px)] overflow-y-auto">
          <div className="p-4 pb-8">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Perfil do Dentista</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-6 pb-8">{content}</div>
        </div>
      </div>
    </div>
  );
}
