import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { fetchPublicClinic, dentistToResult, type PublicClinicJson } from '@/data/publicProfiles';
import type { RealSearchResult } from '@/data/searchSource';
import { RealFavoriteButton, RealReviewsSection } from './RealProfileParts';
import { onActivateKey } from '@/lib/a11y';
import { useProfileNavigation } from '@/contexts/ProfileNavigationContext';

/** Public clinic profile for real accounts: public columns only, verified reviews, real booking. */
export function RealClinicProfile({ clinicId, onClose, onViewDentist }: { clinicId: string; onClose: () => void; onViewDentist?: (d: RealSearchResult) => void }) {
  const { t } = useTranslation();
  const [clinic, setClinic] = useState<PublicClinicJson | null | undefined>(undefined);
  const [booking, setBooking] = useState<RealSearchResult | null>(null);
  const [choose, setChoose] = useState(false);
  const nav = useProfileNavigation();
  const viewDentist = onViewDentist ?? ((d: RealSearchResult) => nav?.openDentistProfile(d));

  useEffect(() => {
    let alive = true;
    void fetchPublicClinic(clinicId).then((c) => { if (alive) setClinic(c); });
    return () => { alive = false; };
  }, [clinicId]);

  if (clinic === undefined) return <div className="p-6 max-w-2xl mx-auto space-y-3"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-32 w-full" /></div>;
  if (!clinic) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onClose} className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />{t('common.back')}</Button>
        <EmptyState icon={MapPin} title={t('publicProfile.notFound')} />
      </div>
    );
  }

  const address = [clinic.address, clinic.postal_code, clinic.city].filter(Boolean).join(', ');
  const asResult = (d: PublicClinicJson['dentists'][0]) => dentistToResult({
    id: d.id, name: d.name, avatar_url: d.avatar_url, specialties: d.specialties, bio: null, languages: [],
    clinics: [{ id: clinic.id, name: clinic.name, address: clinic.address, city: clinic.city, postal_code: clinic.postal_code, lat: clinic.lat, lng: clinic.lng }],
  });

  if (booking) {
    return <BookingFlow dentist={booking} onClose={() => setBooking(null)} onComplete={() => { setBooking(null); onClose(); }} />;
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6" data-testid="real-clinic-profile">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} aria-label={t('common.back')} className="gap-2"><ArrowLeft className="w-4 h-4" />{t('common.back')}</Button>
        <RealFavoriteButton kind="clinic" id={clinic.id} />
      </div>
      <div className="flex flex-col items-center text-center gap-3">
        <PersonAvatar name={clinic.name} size="xl" />
        <h2 className="text-xl font-bold text-foreground">{clinic.name}</h2>
        {address && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" />{address}</p>}
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{t('publicProfile.dentistsHere')}</h3>
        {clinic.dentists.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('publicProfile.noDentists')}</p>
        ) : clinic.dentists.map((d) => (
          <div key={d.id} role="button" tabIndex={0} onKeyDown={onActivateKey}
            onClick={() => (choose ? setBooking(asResult(d)) : viewDentist(asResult(d)))}
            className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-accent/40">
            <PersonAvatar name={d.name ?? ''} photo={d.avatar_url ?? undefined} size="sm" />
            <span className="text-sm text-foreground flex-1">{d.name}</span>
            {choose && <Calendar className="w-4 h-4 text-primary" aria-hidden />}
          </div>
        ))}
      </section>

      <RealReviewsSection clinicId={clinic.id} />

      <Button className="w-full h-11 gap-2" disabled={clinic.dentists.length === 0}
        onClick={() => (clinic.dentists.length === 1 ? setBooking(asResult(clinic.dentists[0])) : setChoose(true))}>
        <Calendar className="w-4 h-4" />{choose ? t('publicProfile.chooseDentist') : t('sweep.dentistProfile.bookAppointment')}
      </Button>
    </div>
  );
}
