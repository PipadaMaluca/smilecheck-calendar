import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-10', className)}>
      <div className="flex items-center justify-center rounded-full bg-destructive/10 text-destructive w-12 h-12 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title ?? t('errors.genericTitle')}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-1">{description ?? t('errors.genericDesc')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
