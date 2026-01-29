import { Video, MapPin, MessageCircle, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation, UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface ConsultationCardProps {
  consultation: Consultation;
  userRole: UserRole;
  onClick?: () => void;
}

export function ConsultationCard({ consultation, userRole, onClick }: ConsultationCardProps) {
  const isTeleconsulta = consultation.type === 'teleconsulta';
  const Icon = isTeleconsulta ? Video : MapPin;
  const typeLabel = isTeleconsulta ? 'Teleconsulta' : 'Presencial';

  return (
    <div
      onClick={onClick}
      className={cn(
        'consultation-card cursor-pointer animate-slide-up',
        isTeleconsulta ? 'consultation-card-teleconsulta' : 'consultation-card-presencial'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isTeleconsulta ? 'bg-teleconsulta/20' : 'bg-primary/20'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                isTeleconsulta ? 'text-teleconsulta' : 'text-primary'
              )}
            />
          </div>
          <div>
            <p className="text-lg font-semibold">{consultation.time}</p>
            <p
              className={cn(
                'text-sm font-medium',
                isTeleconsulta ? 'text-teleconsulta' : 'text-primary'
              )}
            >
              {typeLabel}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            isTeleconsulta ? 'badge-teleconsulta' : 'badge-presencial'
          )}
        >
          {consultation.duration} min
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {userRole === 'patient' ? (
          <>
            <p className="text-sm font-medium">{consultation.dentist.name}</p>
            <p className="text-xs text-muted-foreground">{consultation.clinic.name}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">{consultation.patient.name}</p>
            <p className="text-xs text-muted-foreground">
              ⭐ {consultation.patient.rating} | 🥈 {consultation.patient.level}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {consultation.isPaid ? (
            <span className="text-primary">💰 €{consultation.price} (pago)</span>
          ) : consultation.clinic.distance ? (
            <span>📍 {consultation.clinic.distance} km</span>
          ) : (
            <span className="text-primeira-consulta">💰 €{consultation.price} (pendente)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTeleconsulta ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs hover:bg-teleconsulta/10 hover:text-teleconsulta"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Chat
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Direções
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => e.stopPropagation()}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}