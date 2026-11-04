import { ChequeBadges } from '@/components/clinic/ChequeBadges';
import { chequesForClinic } from '@/lib/cheques';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { onActivateKey } from '@/lib/a11y';
import { formatCurrency, formatDecimal1 } from '@/lib/formatters';
import { Star, MapPin, Clock, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DentistSearchResult, getAvailabilityForDentist } from '@/data/mockDentistSearch';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { getDentistInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { useTranslation } from 'react-i18next';
import { isRealResult } from '@/data/searchSource';

interface DentistCardProps {
  dentist: DentistSearchResult;
  onViewProfile: (dentist: DentistSearchResult) => void;
  onQuickBook?: (dentist: DentistSearchResult, dayLabel: string, slot: string) => void;
}

export function DentistCard({ dentist, onViewProfile, onQuickBook }: DentistCardProps) {
  const { t } = useTranslation();
  const initials = getDentistInitials(dentist.name);
  const real = isRealResult(dentist);
  const photo = real ? dentist.avatar : DENTIST_AVATAR_PHOTOS[dentist.id];

  // Pull next 3 available slot chips for one-tap booking
  const nextSlotChips = (() => {
    if (real) return [];
    const days = getAvailabilityForDentist(dentist.id);
    const out: { dayKey: string; dayLabel: string; slot: string }[] = [];
    for (const d of days) {
      for (const s of d.slots) {
        out.push({ dayKey: d.dayKey, dayLabel: t(`common.${d.dayKey}`, d.dayLabel), slot: s });
        if (out.length >= 3) break;
      }
      if (out.length >= 3) break;
    }
    return out;
  })();

  return (
    <div role="button" tabIndex={0} onKeyDown={onActivateKey}
      className={cn(
        'bg-card rounded-lg border border-border p-4 space-y-3 flex flex-col h-full min-h-[200px] interactive-lift cursor-pointer press'
      )}
      onClick={() => onViewProfile(dentist)}
    >
      <div className="flex gap-3">
        {/* Professionals' levels, frames and highlights are never shown to patients (pending the Ordem's opinion). */}
        <PersonAvatar name={dentist.name} photo={photo} className="!w-14 !h-14 text-lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate min-w-0 flex-1" title={dentist.name}>{dentist.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {dentist.previousPatient && (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {t('search.previousPatient')}
                </span>
              )}
            </div>
          </div>
          {!real && <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-warning" />
              <span className="text-xs font-semibold text-foreground">{dentist.rating}</span>
              <span className="text-2xs text-muted-foreground">({dentist.reviewCount})</span>
            </div>
          </div>}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {dentist.specialties.map((s) => (
              <span key={s} className="text-2xs px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
        {(!real || dentist.hasDistance) && <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{formatDecimal1(dentist.distance)} km</span>
        </div>}
        {dentist.nextAvailable && <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-primary font-medium">
            {dentist.nextAvailable
              .replace(/^Hoje/, t('common.today'))
              .replace(/^Amanhã/, t('common.tomorrow'))}
          </span>
        </div>}
        {!real && <div className="flex items-center gap-1">
          <Video className="w-3 h-3" />
          <span>{formatCurrency(dentist.teleconsultaPrice)}</span>
        </div>}
      </div>
      {nextSlotChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-2xs text-muted-foreground mr-0.5">{t('search.nextLabel', 'Próx')}:</span>
          {nextSlotChips.map((c, i) => (
            <button
              key={`${c.dayKey}-${c.slot}-${i}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickBook) onQuickBook(dentist, c.dayLabel, c.slot);
                else onViewProfile(dentist);
              }}
              className="text-2xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
            >
              {c.dayLabel} {c.slot}
            </button>
          ))}
        </div>
      )}
      <div className="text-2xs text-muted-foreground truncate min-w-0" title={dentist.clinics.map(c => c.name).join(' · ')}>
        {dentist.clinics.map((c, i) => (
          <span key={c.id}>
            {i > 0 && ' · '}
            <ClickableClinicName name={c.name} className="text-2xs text-muted-foreground" />
          </span>
        ))}
      </div>
      {!real && <ChequeBadges cheques={{ country: 'PT', dentista: dentist.clinics.some(c => chequesForClinic(c.id).dentista), protese: dentist.clinics.some(c => chequesForClinic(c.id).protese) }} />}
    </div>
  );
}
