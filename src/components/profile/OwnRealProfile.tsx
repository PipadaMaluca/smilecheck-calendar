import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DentistProfileModal } from '@/components/search/DentistProfileModal';
import { RealClinicProfile } from '@/components/profile/RealClinicProfile';
import { fetchPublicDentist } from '@/data/publicProfiles';
import type { RealSearchResult } from '@/data/searchSource';
import { useDirectory } from '@/data/directorySource';

/**
 * Real accounts' own professional profile: the same public view others get (server RPC),
 * never the demo dentist/clinic. Edit stays one tap away.
 */
export function OwnRealProfile({ role, onClose, onEdit }: { role: 'dentist' | 'clinic'; onClose: () => void; onEdit: () => void }) {
  const { t } = useTranslation();
  const dir = useDirectory();
  const [dentist, setDentist] = useState<RealSearchResult | null | undefined>(undefined);
  useEffect(() => {
    if (role !== 'dentist' || !dir.selfId) return;
    let alive = true;
    void fetchPublicDentist(dir.selfId).then((d) => { if (alive) setDentist(d); });
    return () => { alive = false; };
  }, [role, dir.selfId]);

  const edit = (
    <div className="flex justify-end px-4 pt-4 md:px-6 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}><Pencil className="w-4 h-4" />{t('profile.editProfile')}</Button>
    </div>
  );

  if (role === 'clinic') {
    const clinicId = dir.clinics[0]?.id;
    if (dir.loading) return <div className="p-6 max-w-2xl mx-auto"><Skeleton className="h-32 w-full" /></div>;
    return <>{edit}{clinicId ? <RealClinicProfile clinicId={clinicId} onClose={onClose} /> : <EmptyState title={t('publicProfile.notFound')} />}</>;
  }
  if (dentist === undefined) return <div className="p-6 max-w-2xl mx-auto"><Skeleton className="h-32 w-full" /></div>;
  return <>{edit}{dentist ? <DentistProfileModal dentist={dentist} onClose={onClose} /> : <EmptyState title={t('publicProfile.notFound')} />}</>;
}
