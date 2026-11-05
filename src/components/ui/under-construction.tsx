import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * The single "under construction" pop-up for features that don't work yet.
 * Call `openUnderConstruction()` from anywhere; `<UnderConstructionHost />`
 * is mounted once at the app root.
 */
let isOpen = false;
const listeners = new Set<() => void>();
const set = (v: boolean) => { isOpen = v; listeners.forEach((l) => l()); };
export const openUnderConstruction = () => set(true);
export const closeUnderConstruction = () => set(false);
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

function Body({ onOk }: { onOk: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10" aria-hidden>
        <Smile className="h-9 w-9 text-primary" />
      </span>
      <Button className="w-full sm:w-auto sm:min-w-32" onClick={onOk}>{t('underConstruction.ok')}</Button>
    </div>
  );
}

export function UnderConstructionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const icon = (
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10" aria-hidden>
      <Smile className="h-9 w-9 text-primary" />
    </span>
  );
  const ok = <Button className="w-full sm:w-auto sm:min-w-32" onClick={() => onOpenChange(false)}>{t('underConstruction.ok')}</Button>;
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="items-center gap-3 text-center sm:text-center">
            {icon}
            <SheetTitle>{t('underConstruction.title')}</SheetTitle>
            <SheetDescription>{t('underConstruction.body')}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex justify-center">{ok}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          {icon}
          <DialogTitle>{t('underConstruction.title')}</DialogTitle>
          <DialogDescription>{t('underConstruction.body')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">{ok}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UnderConstructionHost() {
  const open = useSyncExternalStore(subscribe, () => isOpen, () => false);
  return <UnderConstructionDialog open={open} onOpenChange={set} />;
}

// Kept for callers that render the body inline (none today).
export { Body as UnderConstructionBody };
