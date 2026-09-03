import { useWatermarkSrc } from '@/hooks/useWatermarkSrc';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  const watermarkSrc = useWatermarkSrc();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Watermark */}
      <img
        src={watermarkSrc}
        alt=""
        aria-hidden="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-none opacity-[0.025] pointer-events-none z-0 object-contain"
      />
      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
