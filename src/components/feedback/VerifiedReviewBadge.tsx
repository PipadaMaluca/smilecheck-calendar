import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';

/** Shown next to reviews stored server-side: the server only accepts them after a completed appointment. */
export function VerifiedReviewBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 text-2xs font-medium text-success">
      <BadgeCheck className="w-3.5 h-3.5" aria-hidden />{t('reviews.verified')}
    </span>
  );
}
