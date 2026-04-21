import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Clock, Video, X, Calendar, MessageCircle, Smartphone } from 'lucide-react';
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
import { getDentistInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';

interface DentistProfileModalProps {
  dentist: DentistSearchResult;
  onClose: () => void;
  onGoHome?: () => void;
  onQuickBook?: (dentist: DentistSearchResult, dayLabel: string, slot: string) => void;
}

export function DentistProfileModal({ dentist, onClose, onGoHome, onQuickBook }: DentistProfileModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showBooking, setShowBooking] = useState(false);
  const levelCfg = LEVEL_CONFIG[dentist.level];
  const reviews = getReviewsForDentist(dentist.id);
  const availability = getAvailabilityForDentist(dentist.id);

  const initials = getDentistInitials(dentist.name);
  const photo = DENTIST_AVATAR_PHOTOS[dentist.id];

  if (showBooking) {
    return (
      <BookingFlow
        dentist={dentist}
        onClose={() => setShowBooking(false)}
        onComplete={() => { setShowBooking(false); onClose(); }}
        onGoHome={onGoHome}
      />
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Header with avatar */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        {photo ? (
          <img src={photo} alt={dentist.name} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary">
            {initials}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{dentist.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{dentist.rating}</span>
              <span className="text-xs text-muted-foreground">({dentist.reviewCount} avaliações)</span>
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {t(levelCfg.labelKey)}
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
        <h3 className="text-sm font-semibold text-foreground mb-2">{t('search.availableSlots')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availability.map((day) => {
            const isSunday = day.dayKey === 'sun';
            const dayLabel = day.dayKey === 'today'
              ? t('common.today')
              : day.dayKey === 'tomorrow'
              ? t('common.tomorrow')
              : t(`common.weekdays.${day.dayKey}`);
            return (
              <div key={day.date} className="bg-secondary rounded-lg p-2.5">
                <p className="text-xs font-semibold text-foreground mb-1.5">
                  {dayLabel}
                  {isSunday && <Smartphone className="w-3 h-3 inline ml-1 text-primary" />}
                </p>
                {isSunday && (
                  <p className="text-[9px] text-primary mb-1">📱 {t('search.sundayTeleconsultOnly')}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {day.slots.map((slot) => (
                    <button
                      key={slot}
                      className="text-[10px] px-2 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 transition-colors border border-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onQuickBook) {
                          onQuickBook(dentist, day.dayLabel, slot);
                        } else {
                          setShowBooking(true);
                        }
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                  {day.slots.length === 0 && (
                    <span className="text-[10px] text-muted-foreground">Sem horários</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Mostrar mais horários */}
        <button
          className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          onClick={() => setShowBooking(true)}
        >
          + Mostrar mais horários
        </button>
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
