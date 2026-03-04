import smileIcon from '@/assets/smilecheck-icon.png';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Watermark */}
      <img
        src={smileIcon}
        alt=""
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] opacity-[0.05] pointer-events-none select-none"
      />
      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
