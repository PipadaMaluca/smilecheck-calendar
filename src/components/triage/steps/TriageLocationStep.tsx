import { Checkbox } from '@/components/ui/checkbox';
import { TEETH_POSITIONS } from '@/types/triage';
import { cn } from '@/lib/utils';

interface TriageLocationStepProps {
  selectedTeeth: string[];
  unknownLocation: boolean;
  onTeethChange: (teeth: string[]) => void;
  onUnknownChange: (unknown: boolean) => void;
}

export function TriageLocationStep({
  selectedTeeth,
  unknownLocation,
  onTeethChange,
  onUnknownChange,
}: TriageLocationStepProps) {
  const toggleTooth = (toothId: string) => {
    if (unknownLocation) return;
    
    if (selectedTeeth.includes(toothId)) {
      onTeethChange(selectedTeeth.filter((t) => t !== toothId));
    } else {
      onTeethChange([...selectedTeeth, toothId]);
    }
  };

  const handleUnknownToggle = (checked: boolean) => {
    onUnknownChange(checked);
    if (checked) {
      onTeethChange([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Onde sente o problema?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toque na zona afetada
        </p>
      </div>

      {/* Teeth diagram */}
      <div className="relative bg-[#1E3A5F] rounded-xl p-4 mx-auto max-w-[300px]">
        <svg
          viewBox="0 0 180 140"
          className="w-full h-auto"
        >
          {/* Arch labels */}
          <text x="90" y="8" textAnchor="middle" className="fill-muted-foreground text-[8px]">
            Arcada Superior
          </text>
          <text x="90" y="138" textAnchor="middle" className="fill-muted-foreground text-[8px]">
            Arcada Inferior
          </text>

          {/* Teeth */}
          {TEETH_POSITIONS.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id);
            
            return (
              <g key={tooth.id}>
                <circle
                  cx={tooth.x}
                  cy={tooth.y}
                  r={8}
                  onClick={() => toggleTooth(tooth.id)}
                  className={cn(
                    'cursor-pointer transition-all',
                    unknownLocation && 'opacity-40 cursor-not-allowed',
                    isSelected
                      ? 'fill-primary stroke-primary'
                      : 'fill-[#0A1929] stroke-[#94A3B8] hover:stroke-primary'
                  )}
                  strokeWidth={1.5}
                />
                <text
                  x={tooth.x}
                  y={tooth.y + 3}
                  textAnchor="middle"
                  className={cn(
                    'text-[6px] pointer-events-none select-none',
                    isSelected ? 'fill-white font-semibold' : 'fill-muted-foreground'
                  )}
                >
                  {tooth.id}
                </text>
              </g>
            );
          })}

          {/* Center divider */}
          <line
            x1="90"
            y1="15"
            x2="90"
            y2="125"
            stroke="#94A3B8"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Zona selecionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0A1929] border border-[#94A3B8]" />
          <span>Zona não afetada</span>
        </div>
      </div>

      {/* Unknown location checkbox */}
      <div 
        className="flex items-center gap-3 p-3 bg-[#1E3A5F] rounded-lg cursor-pointer"
        onClick={() => handleUnknownToggle(!unknownLocation)}
      >
        <Checkbox
          checked={unknownLocation}
          onCheckedChange={handleUnknownToggle}
          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-sm text-foreground">Não sei exatamente onde é</span>
      </div>
    </div>
  );
}
