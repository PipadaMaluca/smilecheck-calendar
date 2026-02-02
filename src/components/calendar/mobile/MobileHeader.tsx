import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({
  onMenuClick,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
