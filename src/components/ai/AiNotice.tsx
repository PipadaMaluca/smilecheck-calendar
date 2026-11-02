import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

/** AI Act art. 50 — permanent notice shown at the start of any AI-generated guidance. */
export function AiNotice({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p role="note" className={cn('flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-foreground', className)}>
      <Bot className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
      <span>{t('ai.notice')}</span>
    </p>
  );
}

/** Small "IA/AI" label placed on every AI-generated answer. */
export function AiLabel() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-semibold text-primary" aria-label={t('ai.labelA11y')}>
      <Bot className="w-3 h-3" aria-hidden />{t('ai.label')}
    </span>
  );
}
