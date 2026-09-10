import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline';
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: 'sm' | 'md';
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, size = 'md', className }: EmptyStateProps) {
  const isSm = size === 'sm';
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isSm ? 'py-6' : 'py-10',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3',
            isSm ? 'w-10 h-10' : 'w-12 h-12'
          )}
        >
          <Icon className={isSm ? 'w-5 h-5' : 'w-6 h-6'} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs mt-1">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant ?? 'outline'}
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
