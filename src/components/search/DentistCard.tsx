import { Star, MapPin, Clock, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DentistSearchResult, LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { getDentistInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';

interface DentistCardProps {
  dentist: DentistSearchResult;
  onViewProfile: (dentist: DentistSearchResult) => void;
}

export function DentistCard({ dentist, onViewProfile }: DentistCardProps) {
  const levelCfg = LEVEL_CONFIG[dentist.level];
  const initials = getDentistInitials(dentist.name);
  const photo = DENTIST_AVATAR_PHOTOS[dentist.id];

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border p-4 space-y-3',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer'
      )}
      onClick={() => onViewProfile(dentist)}
    >
      {/* Top row: avatar + info */}
      <div className="flex gap-3">
        {/* Avatar */}
        {photo ? (
          <img src={photo} alt={dentist.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">{dentist.name}</h3>
            {dentist.previousPatient && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Já Consultou
              </span>
            )}
          </div>

          {/* Rating + Level */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">{dentist.rating}</span>
              <span className="text-[10px] text-muted-foreground">({dentist.reviewCount})</span>
            </div>
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {levelCfg.label}
            </span>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dentist.specialties.map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{dentist.distance} km</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-primary font-medium">{dentist.nextAvailable}</span>
        </div>
        <div className="flex items-center gap-1">
          <Video className="w-3 h-3" />
          <span>€{dentist.teleconsultaPrice}</span>
        </div>
      </div>

      {/* Clinics */}
      <div className="text-[11px] text-muted-foreground">
        {dentist.clinics.map((c, i) => (
          <span key={c.id}>
            {i > 0 && ' · '}
            <ClickableClinicName name={c.name} className="text-[11px] text-muted-foreground" />
          </span>
        ))}
      </div>
    </div>
  );
}
