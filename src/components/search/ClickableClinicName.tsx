import { useState } from 'react';
import { MapPin, Clock, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ClinicInfo {
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
}

const CLINIC_INFO: Record<string, ClinicInfo> = {
  'clínica smilecheck': {
    name: 'Clínica SmileCheck',
    address: 'Av. da Liberdade 123, Lisboa',
    phone: '+351 210 000 001',
    hours: '09h - 21h',
  },
  'clínica mitry-mory': {
    name: 'Clínica Mitry-Mory',
    address: 'Rue de Paris 45, Mitry-Mory',
    phone: '+351 210 000 002',
    hours: '09h - 21h',
  },
  'clínica montfermeil': {
    name: 'Clínica Montfermeil',
    address: 'Avenue Jean Jaurès 78, Montfermeil',
    phone: '+351 210 000 003',
    hours: '09h - 21h',
  },
};

interface ClickableClinicNameProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
}

export function ClickableClinicName({ name, className, children }: ClickableClinicNameProps) {
  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useIsMobile();

  const clinic = CLINIC_INFO[name.toLowerCase()];

  if (!clinic) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowInfo(true);
        }}
        className={cn(
          'text-left hover:underline hover:text-primary transition-colors cursor-pointer',
          className
        )}
      >
        {children || name}
      </button>
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfo(false)} />
          <div className={cn(
            'relative bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4',
            isMobile ? 'w-full mx-4' : 'w-full max-w-sm'
          )}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">{clinic.name}</h3>
              <button onClick={() => setShowInfo(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {clinic.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{clinic.address}</span>
              </div>
            )}
            {clinic.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{clinic.phone}</span>
              </div>
            )}
            {clinic.hours && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{clinic.hours}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
