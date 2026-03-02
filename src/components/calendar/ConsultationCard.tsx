import { useState } from 'react';
import { Video, MapPin, MessageCircle, X, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Consultation, UserRole, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_CONFIG, ConsultationStatus, getCategoryTextStyle } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { ConsultationContextMenu } from './ConsultationContextMenu';
import { toast } from 'sonner';

interface ConsultationCardProps {
  consultation: Consultation;
  userRole: UserRole;
  onClick?: () => void;
  showFamilyMember?: boolean;
  onStatusChange?: (consultation: Consultation, status: ConsultationStatus) => void;
  onCopy?: (consultation: Consultation) => void;
  onFeedback?: (consultation: Consultation) => void;
}

export function ConsultationCard({ consultation, userRole, onClick, showFamilyMember, onStatusChange, onCopy, onFeedback }: ConsultationCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const isTeleconsulta = consultation.type === 'teleconsulta';
  const isUrgentTeleconsulta = consultation.isUrgentTeleconsulta;
  const Icon = isTeleconsulta ? Video : MapPin;
  
  const category = consultation.category || 'restauracao';
  const colors = CATEGORY_COLORS[category];
  const categoryLabel = CATEGORY_LABELS[category];
  const status = consultation.status || 'agendada';
  const statusConfig = STATUS_CONFIG[status];
  
  // Type label for patients
  const typeLabel = isTeleconsulta ? 'Teleconsulta' : 'Presencial';

  // Patient info with age
  const patientAge = consultation.patient.age;
  const patientNameWithAge = patientAge 
    ? `${consultation.patient.name} (${patientAge} anos)` 
    : consultation.patient.name;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (userRole === 'patient') return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'consultation-card cursor-pointer animate-slide-up',
        isTeleconsulta ? 'consultation-card-teleconsulta' : 'consultation-card-presencial'
      )}
      style={{ borderLeftColor: colors.hex, borderLeftWidth: '4px' }}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', statusConfig.bg, statusConfig.color)}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center'
            )}
            style={{ backgroundColor: `${colors.hex}20` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: colors.hex }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{consultation.time}</p>
              {isUrgentTeleconsulta && (
                <AlertTriangle className="w-4 h-4 text-[#F44336]" />
              )}
            </div>
            {userRole === 'patient' ? (
              <p
                className={cn(
                  'text-sm font-medium',
                  isTeleconsulta ? 'text-teleconsulta' : 'text-primary'
                )}
              >
                {typeLabel}
              </p>
            ) : (
              <p
                className="text-sm font-bold"
                style={getCategoryTextStyle(colors.hex)}
              >
                {categoryLabel}
              </p>
            )}
          </div>
        </div>
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${colors.hex}20`, ...getCategoryTextStyle(colors.hex) }}
        >
          {consultation.duration} min
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {userRole === 'patient' ? (
          <>
            {/* For patient: show dentist name and category */}
            <p className="text-sm font-medium">
              <ClickableDentistName name={consultation.dentist.name} className="text-sm font-medium" />
            </p>
            <p 
              className="text-xs font-bold"
              style={getCategoryTextStyle(colors.hex)}
            >
              {categoryLabel}
            </p>
            {showFamilyMember && (
              <p className="text-xs font-medium text-primary">
                Para: {consultation.patient.name}{consultation.patient.age ? ` (${consultation.patient.age} anos)` : ''}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              <ClickableClinicName name={consultation.clinic.name} className="text-xs text-muted-foreground" />
            </p>
            {consultation.notes && (
              <p className="text-xs text-[#8B9CB6]">{consultation.notes}</p>
            )}
          </>
        ) : (
          <>
            {/* For dentist/clinic: show patient with age and notes */}
            <p className="text-sm font-bold text-white">
              <ClickablePatientName name={consultation.patient.name} patientId={consultation.patient.id} className="text-sm font-bold text-white">
                {patientNameWithAge}
              </ClickablePatientName>
            </p>
            {consultation.notes && (
              <p className="text-xs text-[#8B9CB6]">{consultation.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              ⭐ {consultation.patient.rating} | 🥈 {consultation.patient.level}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {userRole === 'patient' ? (
            // Patient view: teleconsulta shows "Pago", presencial shows "A pagar"
            isTeleconsulta && consultation.isPaid ? (
              <span className="text-primary">💰 €{consultation.price} (pago)</span>
            ) : (
              <span className="text-[#FDD835]">💰 €{consultation.price} (a pagar)</span>
            )
          ) : (
            // Dentist/Clinic view
            consultation.isPaid ? (
              <span className="text-primary">💰 €{consultation.price} (pago)</span>
            ) : consultation.clinic.distance ? (
              <span>📍 {consultation.clinic.distance} km</span>
            ) : (
              <span className="text-[#FDD835]">💰 €{consultation.price} (pendente)</span>
            )
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

      {/* Context Menu */}
      {contextMenu && userRole !== 'patient' && (
        <ConsultationContextMenu
          consultation={consultation}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onStatusChange={(c, s) => {
            onStatusChange?.(c, s);
            if (s === 'visto') {
              onFeedback?.(c);
            }
            toast.success(`Estado alterado para "${STATUS_CONFIG[s].label}"`);
          }}
          onCopy={(c) => onCopy?.(c)}
          onViewProfile={() => {}}
          onSendMessage={() => toast.info('Abrir conversa...')}
        />
      )}
    </>
  );
}
