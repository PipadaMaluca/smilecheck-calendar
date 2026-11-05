import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { openUnderConstruction } from '@/components/ui/under-construction';

/**
 * A normal, clickable button for a feature that isn't built yet: it opens the
 * shared "under construction" pop-up — never a disabled or silent control.
 */
export const SoonButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ onClick, ...props }, ref) => (
  <Button
    ref={ref}
    {...props}
    onClick={(e) => { e.stopPropagation(); onClick?.(e); openUnderConstruction(); }}
  />
));
SoonButton.displayName = 'SoonButton';
