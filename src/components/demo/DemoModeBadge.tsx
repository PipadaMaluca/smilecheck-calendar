import { useAuth } from '@/contexts/AuthContext';

export function DemoModeBadge() {
  const { demoMode } = useAuth();
  if (!demoMode) return null;

  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[95] pointer-events-none">
      <span className="px-2 py-[2px] rounded-full text-[11px] font-semibold uppercase tracking-wide bg-primary/15 text-primary border border-primary/30 backdrop-blur-sm">
        Modo Demo
      </span>
    </div>
  );
}
