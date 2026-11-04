import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * A control whose feature doesn't exist yet: visibly disabled, labelled
 * "Em breve" and with a tooltip — never a button that silently does nothing.
 */
export const SoonButton = React.forwardRef<HTMLButtonElement, ButtonProps & { hideBadge?: boolean }>(
  ({ children, className, hideBadge, title, ...props }, ref) => {
    const { t } = useTranslation();
    const soon = t('common.comingSoon');
    return (
      <Button
        ref={ref}
        {...props}
        onClick={undefined}
        disabled
        aria-disabled
        data-soon=""
        title={title ?? soon}
        className={cn('gap-1.5', className)}
      >
        {children}
        {!hideBadge && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">{soon}</span>
        )}
      </Button>
    );
  }
);
SoonButton.displayName = 'SoonButton';
