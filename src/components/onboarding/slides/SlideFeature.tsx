interface SlideFeatureProps {
  isActive: boolean;
  emoji: string;
  title: string;
  description: string;
  items?: { icon: string; label: string; detail: string }[];
}

export const SlideFeature = ({ isActive, emoji, title, description, items }: SlideFeatureProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className={`text-7xl mb-6 ${isActive ? 'animate-float' : ''}`}>{emoji}</div>

      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 text-center">{title}</h2>

      <p className="text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">{description}</p>

      {items && items.length > 0 && (
        <div className="glass-card p-5 w-full max-w-sm space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <span className="text-foreground font-medium text-sm">{item.label}</span>
                <p className="text-muted-foreground text-xs">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
