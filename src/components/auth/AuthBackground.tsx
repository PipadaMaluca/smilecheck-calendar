export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
