import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/data/clinicalDocs';
import { DocumentList } from '@/components/clinical/DocumentList';

/** Professional view of referral letters: received (recipient reads the letter only) and sent. */
export function LettersInbox({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const docs = useDocuments('referral_letter', true);
  const received = docs.rows.filter((r) => r.dentist_id !== user?.id && r.patient_id !== user?.id);
  const sent = docs.rows.filter((r) => r.dentist_id === user?.id);
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6 pb-28" data-testid="letters-inbox">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={t('a11y.back')} onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-xl font-bold">{t('docs.lettersTitle')}</h1>
      </div>
      <section className="space-y-2">
        <h2 className="text-base font-semibold">{t('docs.received')}</h2>
        <DocumentList kind="referral_letter" rows={received} loading={docs.loading} error={docs.error} onChanged={docs.reload} emptyText={t('docs.noneReceived')} />
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold">{t('docs.sent')}</h2>
        <DocumentList kind="referral_letter" rows={sent} loading={docs.loading} error={docs.error} onChanged={docs.reload} emptyText={t('docs.noneSent')} />
      </section>
    </div>
  );
}
