import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TriageLocationStepProps {
  selectedTeeth: string[];
  unknownLocation: boolean;
  onTeethChange: (teeth: string[]) => void;
  onUnknownChange: (unknown: boolean) => void;
}

// Tooth shape paths for different tooth types (anatomical silhouettes)
const TOOTH_SHAPES: Record<string, string> = {
  // Molars - wider, more square with cusps
  molar: 'M-10,-12 C-10,-14 -8,-16 -5,-16 L5,-16 C8,-16 10,-14 10,-12 L10,12 C10,14 8,16 5,16 L-5,16 C-8,16 -10,14 -10,12 Z M-6,-16 L-4,-12 M0,-16 L0,-12 M6,-16 L4,-12',
  // Premolars - medium size
  premolar: 'M-8,-11 C-8,-13 -6,-15 -4,-15 L4,-15 C6,-15 8,-13 8,-11 L8,11 C8,13 6,15 4,15 L-4,15 C-6,15 -8,13 -8,11 Z',
  // Canines - pointed
  canine: 'M-6,-11 C-6,-13 -4,-16 0,-18 C4,-16 6,-13 6,-11 L6,11 C6,13 4,15 0,15 C-4,15 -6,13 -6,11 Z',
  // Incisors - narrow, shovel-shaped
  incisor: 'M-5,-11 C-5,-13 -3,-15 0,-15 C3,-15 5,-13 5,-11 L5,11 C5,13 3,15 0,15 C-3,15 -5,13 -5,11 Z',
  // Lower molars (flipped cusps)
  molarLower: 'M-10,-12 C-10,-14 -8,-16 -5,-16 L5,-16 C8,-16 10,-14 10,-12 L10,12 C10,14 8,16 5,16 L-5,16 C-8,16 -10,14 -10,12 Z M-6,16 L-4,12 M0,16 L0,12 M6,16 L4,12',
  canineLower: 'M-6,-11 C-6,-13 -4,-15 0,-15 C4,-15 6,-13 6,-11 L6,11 C6,13 4,16 0,18 C-4,16 -6,13 -6,11 Z',
};

type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor';

interface ToothDef {
  id: string;
  type: ToothType;
  width: number;
}

// FDI quadrant definitions
const UPPER_RIGHT: ToothDef[] = [
  { id: '18', type: 'molar', width: 24 },
  { id: '17', type: 'molar', width: 24 },
  { id: '16', type: 'molar', width: 24 },
  { id: '15', type: 'premolar', width: 20 },
  { id: '14', type: 'premolar', width: 20 },
  { id: '13', type: 'canine', width: 18 },
  { id: '12', type: 'incisor', width: 16 },
  { id: '11', type: 'incisor', width: 16 },
];

const UPPER_LEFT: ToothDef[] = [
  { id: '21', type: 'incisor', width: 16 },
  { id: '22', type: 'incisor', width: 16 },
  { id: '23', type: 'canine', width: 18 },
  { id: '24', type: 'premolar', width: 20 },
  { id: '25', type: 'premolar', width: 20 },
  { id: '26', type: 'molar', width: 24 },
  { id: '27', type: 'molar', width: 24 },
  { id: '28', type: 'molar', width: 24 },
];

const LOWER_LEFT: ToothDef[] = [
  { id: '31', type: 'incisor', width: 16 },
  { id: '32', type: 'incisor', width: 16 },
  { id: '33', type: 'canine', width: 18 },
  { id: '34', type: 'premolar', width: 20 },
  { id: '35', type: 'premolar', width: 20 },
  { id: '36', type: 'molar', width: 24 },
  { id: '37', type: 'molar', width: 24 },
  { id: '38', type: 'molar', width: 24 },
];

const LOWER_RIGHT: ToothDef[] = [
  { id: '48', type: 'molar', width: 24 },
  { id: '47', type: 'molar', width: 24 },
  { id: '46', type: 'molar', width: 24 },
  { id: '45', type: 'premolar', width: 20 },
  { id: '44', type: 'premolar', width: 20 },
  { id: '43', type: 'canine', width: 18 },
  { id: '42', type: 'incisor', width: 16 },
  { id: '41', type: 'incisor', width: 16 },
];

function getToothPath(type: ToothType, isLower: boolean): string {
  if (isLower && type === 'molar') return TOOTH_SHAPES.molarLower;
  if (isLower && type === 'canine') return TOOTH_SHAPES.canineLower;
  return TOOTH_SHAPES[type];
}

function getScale(type: ToothType): number {
  switch (type) {
    case 'molar': return 1.1;
    case 'premolar': return 0.9;
    case 'canine': return 0.85;
    case 'incisor': return 0.75;
  }
}

interface ToothRowProps {
  teeth: ToothDef[];
  selectedTeeth: string[];
  disabled: boolean;
  isLower: boolean;
  onToggle: (id: string) => void;
}

function ToothRow({ teeth, selectedTeeth, disabled, isLower, onToggle }: ToothRowProps) {
  return (
    <div className="flex items-center gap-1 md:gap-1.5">
      {teeth.map((tooth) => {
        const isSelected = selectedTeeth.includes(tooth.id);
        const scale = getScale(tooth.type);
        return (
          <button
            key={tooth.id}
            type="button"
            onClick={() => onToggle(tooth.id)}
            disabled={disabled}
            className={cn(
              'relative flex flex-col items-center transition-all duration-150 rounded-md p-0.5 md:p-1',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              disabled && 'opacity-40 cursor-not-allowed',
              !disabled && 'hover:bg-primary/10 cursor-pointer',
            )}
            aria-label={`Dente ${tooth.id}`}
          >
            <svg
              width={tooth.width * 1.1}
              height={38}
              viewBox="-12 -20 24 40"
              className="md:w-auto md:h-auto"
              style={{ width: tooth.width, height: 34 }}
            >
              <g transform={`scale(${scale})`}>
                <path
                  d={getToothPath(tooth.type, isLower)}
                  className={cn(
                    'transition-all duration-150',
                    isSelected
                      ? 'fill-primary stroke-primary'
                      : 'fill-[#0A1929] stroke-[#64748B] hover:stroke-primary/70',
                  )}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
              </g>
            </svg>
            <span
              className={cn(
                'text-[9px] md:text-[10px] leading-none mt-0.5 font-mono',
                isSelected ? 'text-primary font-semibold' : 'text-muted-foreground/70',
              )}
            >
              {tooth.id}
            </span>
          </button>
        );
      })}
    </div>
  );
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
    if (checked) onTeethChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Onde sente o problema?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toque nos dentes afetados
        </p>
      </div>

      {/* Odontogram */}
      <div className="bg-[#1E3A5F]/50 rounded-xl p-3 md:p-5 mx-auto max-w-[500px] space-y-1">
        {/* Quadrant labels top */}
        <div className="flex justify-between px-2 mb-1">
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Sup. Direito
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Sup. Esquerdo
          </span>
        </div>

        {/* Upper arch */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <ToothRow teeth={UPPER_RIGHT} selectedTeeth={selectedTeeth} disabled={unknownLocation} isLower={false} onToggle={toggleTooth} />
          <div className="w-px h-10 bg-muted-foreground/30" />
          <ToothRow teeth={UPPER_LEFT} selectedTeeth={selectedTeeth} disabled={unknownLocation} isLower={false} onToggle={toggleTooth} />
        </div>

        {/* Horizontal divider */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-muted-foreground/30" />
          <span className="text-[9px] text-muted-foreground/50">E</span>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-[9px] text-muted-foreground/50">D</span>
          <div className="flex-1 h-px bg-muted-foreground/30" />
        </div>

        {/* Lower arch */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <ToothRow teeth={LOWER_RIGHT} selectedTeeth={selectedTeeth} disabled={unknownLocation} isLower={true} onToggle={toggleTooth} />
          <div className="w-px h-10 bg-muted-foreground/30" />
          <ToothRow teeth={LOWER_LEFT} selectedTeeth={selectedTeeth} disabled={unknownLocation} isLower={true} onToggle={toggleTooth} />
        </div>

        {/* Quadrant labels bottom */}
        <div className="flex justify-between px-2 mt-1">
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Inf. Direito
          </span>
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Inf. Esquerdo
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#0A1929] border border-[#64748B]" />
          <span>Não afetado</span>
        </div>
      </div>

      {/* Unknown checkbox */}
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
