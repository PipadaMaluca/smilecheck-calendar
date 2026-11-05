import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/formatters';
import { verifyDocument, type VerifyResult } from '@/data/clinicalDocs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Public QR check: shows only valid/voided, issue date and clinic — never patient data. */
export default function VerifyDocument() {
  const { code = '' } = useParams();
  const { t } = useTranslation();
  useDocumentTitle(t('verify.title'));
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { void verifyDocument(code).then(setRes).catch(() => setError(true)); }, [code]);
  const Icon = !res ? ShieldQuestion : res.status === 'emitida' ? ShieldCheck : res.status === 'anulada' ? ShieldX : ShieldQuestion;
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4 text-center">
          <h1 className="text-xl font-bold">{t('verify.title')}</h1>
          {error ? <p className="text-sm text-destructive">{t('verify.error')}</p> : !res ? <Skeleton className="h-24 w-full" /> : (
            <div className="space-y-2" data-testid="verify-result">
              <Icon className={res.status === 'emitida' ? 'w-12 h-12 mx-auto text-success' : res.status === 'anulada' ? 'w-12 h-12 mx-auto text-destructive' : 'w-12 h-12 mx-auto text-muted-foreground'} />
              <p className="text-lg font-semibold">{t(`verify.status.${res.status}`)}</p>
              {res.kind && <p className="text-sm text-muted-foreground">{t(`verify.kind.${res.kind}`)}</p>}
              {res.issued_on && <p className="text-sm">{t('docs.date')}: {formatDate(new Date(`${res.issued_on}T12:00:00`), { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>}
              {res.clinic && <p className="text-sm">{t('docs.clinic')}: {res.clinic}</p>}
              <p className="text-xs text-muted-foreground pt-2">{t('verify.privacy')}</p>
            </div>
          )}
          <Link to="/" className="text-sm text-primary underline">SmileCheck</Link>
        </CardContent>
      </Card>
    </main>
  );
}
