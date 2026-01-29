export function SlotLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-3 bg-card/50 rounded-xl mx-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-teleconsulta" />
        <span className="text-xs text-muted-foreground">Teleconsulta</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-restauracao" />
        <span className="text-xs text-muted-foreground">Presencial</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-muted/50 border border-dashed border-muted-foreground/30" />
        <span className="text-xs text-muted-foreground">Livre</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-bloqueado" />
        <span className="text-xs text-muted-foreground">Bloqueado</span>
      </div>
    </div>
  );
}