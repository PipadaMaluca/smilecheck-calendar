import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TriageLocationStepProps {
  selectedTeeth: string[];
  unknownLocation: boolean;
  onTeethChange: (teeth: string[]) => void;
  onUnknownChange: (unknown: boolean) => void;
}

const SHAPES: Record<string, { outline: string; detail: string }> = {
  upperMolar: {
    outline: 'M-11,-8 C-11,-11 -8,-13 -4,-13 L4,-13 C8,-13 11,-11 11,-8 L11,8 C11,11 8,13 4,13 L-4,13 C-8,13 -11,11 -11,8 Z',
    detail: 'M-6,0 L6,0 M0,-8 L0,8',
  },
  upperPremolar: {
    outline: 'M-8,-7 C-8,-10 -5,-12 0,-12 C5,-12 8,-10 8,-7 L8,7 C8,10 5,12 0,12 C-5,12 -8,10 -8,7 Z',
    detail: 'M-4,0 L4,0',
  },
  upperCanine: {
    outline: 'M0,-13 C5,-11 7,-6 7,0 C7,6 5,11 0,13 C-5,11 -7,6 -7,0 C-7,-6 -5,-11 0,-13 Z',
    detail: 'M0,-6 L0,6',
  },
  upperLateral: {
    outline: 'M-5,-7 C-5,-10 -3,-12 0,-12 C3,-12 5,-10 5,-7 L5,7 C5,10 3,12 0,12 C-3,12 -5,10 -5,7 Z',
    detail: 'M-2,0 L2,0',
  },
  upperCentral: {
    outline: 'M-7,-8 C-7,-11 -5,-13 0,-13 C5,-13 7,-11 7,-8 L7,8 C7,11 5,13 0,13 C-5,13 -7,11 -7,8 Z',
    detail: 'M-3,0 L3,0',
  },
  lowerMolar: {
    outline: 'M-11,-8 C-11,-11 -8,-13 -4,-13 L4,-13 C8,-13 11,-11 11,-8 L11,8 C11,11 8,13 4,13 L-4,13 C-8,13 -11,11 -11,8 Z',
    detail: 'M-6,0 L6,0 M0,-8 L0,8 M-4,-4 L4,4',
  },
  lowerPremolar: {
    outline: 'M-7,-7 C-7,-10 -4,-12 0,-12 C4,-12 7,-10 7,-7 L7,7 C7,10 4,12 0,12 C-4,12 -7,10 -7,7 Z',
    detail: 'M-3,0 L3,0',
  },
  lowerCanine: {
    outline: 'M0,-13 C5,-11 6,-6 6,0 C6,6 5,11 0,13 C-5,11 -6,6 -6,0 C-6,-6 -5,-11 0,-13 Z',
    detail: 'M0,-5 L0,5',
  },
  lowerLateral: {
    outline: 'M-4,-7 C-4,-10 -2,-12 0,-12 C2,-12 4,-10 4,-7 L4,7 C4,10 2,12 0,12 C-2,12 -4,10 -4,7 Z',
    detail: 'M-1,0 L1,0',
  },
  lowerCentral: {
    outline: 'M-5,-7 C-5,-10 -3,-12 0,-12 C3,-12 5,-10 5,-7 L5,7 C5,10 3,12 0,12 C-3,12 -5,10 -5,7 Z',
    detail: 'M-2,0 L2,0',
  },
};

interface ToothPlaced {
  id: string;
  shape: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  isUpper: boolean;
}

// Place teeth with explicit per-tooth angle offsets for non-uniform spacing
// angleCumulativeOffsets: cumulative angle from start for each tooth
function placeOnArc(
  teeth: { id: string; shape: string; scale: number }[],
  cx: number, cy: number, rx: number, ry: number,
  angles: number[], // explicit angle per tooth in degrees
  flipRotation: boolean,
  isUpper: boolean,
): ToothPlaced[] {
  return teeth.map((t, i) => {
    const angleDeg = angles[i];
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + rx * Math.cos(angleRad);
    const y = cy + ry * Math.sin(angleRad);
    const rot = flipRotation ? angleDeg + 90 : angleDeg - 90;
    return { ...t, x, y, rotate: rot, isUpper };
  });
}

const CX = 200;

// === UPPER ARCH === (softer ellipse, closer to center)
const UPPER_CY = 140;
const UPPER_RX = 155;
const UPPER_RY = 95;

// Uniform ~9° spacing across 8 teeth per side
const upperRightAngles = [198, 207, 216, 225, 234, 243, 252, 261];
const upperRightDefs = [
  { id: '18', shape: 'upperMolar', scale: 0.88 },
  { id: '17', shape: 'upperMolar', scale: 0.88 },
  { id: '16', shape: 'upperMolar', scale: 0.88 },
  { id: '15', shape: 'upperPremolar', scale: 0.8 },
  { id: '14', shape: 'upperPremolar', scale: 0.8 },
  { id: '13', shape: 'upperCanine', scale: 0.78 },
  { id: '12', shape: 'upperLateral', scale: 0.72 },
  { id: '11', shape: 'upperCentral', scale: 0.82 },
];

// Mirror: 21→28
const upperLeftAngles = [279, 288, 297, 306, 315, 324, 333, 342];
const upperLeftDefs = [
  { id: '21', shape: 'upperCentral', scale: 0.82 },
  { id: '22', shape: 'upperLateral', scale: 0.72 },
  { id: '23', shape: 'upperCanine', scale: 0.78 },
  { id: '24', shape: 'upperPremolar', scale: 0.8 },
  { id: '25', shape: 'upperPremolar', scale: 0.8 },
  { id: '26', shape: 'upperMolar', scale: 0.88 },
  { id: '27', shape: 'upperMolar', scale: 0.88 },
  { id: '28', shape: 'upperMolar', scale: 0.88 },
];

// === LOWER ARCH === (closer to upper, softer ellipse)
const LOWER_CY = 195;
const LOWER_RX = 135;
const LOWER_RY = 78;

// Uniform ~9° spacing
const lowerRightAngles = [162, 153, 144, 135, 126, 117, 108, 99];
const lowerRightDefs = [
  { id: '48', shape: 'lowerMolar', scale: 0.88 },
  { id: '47', shape: 'lowerMolar', scale: 0.88 },
  { id: '46', shape: 'lowerMolar', scale: 0.88 },
  { id: '45', shape: 'lowerPremolar', scale: 0.8 },
  { id: '44', shape: 'lowerPremolar', scale: 0.8 },
  { id: '43', shape: 'lowerCanine', scale: 0.78 },
  { id: '42', shape: 'lowerLateral', scale: 0.72 },
  { id: '41', shape: 'lowerCentral', scale: 0.72 },
];

// Mirror: 31→38
const lowerLeftAngles = [81, 72, 63, 54, 45, 36, 27, 18];
const lowerLeftDefs = [
  { id: '31', shape: 'lowerCentral', scale: 0.72 },
  { id: '32', shape: 'lowerLateral', scale: 0.72 },
  { id: '33', shape: 'lowerCanine', scale: 0.78 },
  { id: '34', shape: 'lowerPremolar', scale: 0.8 },
  { id: '35', shape: 'lowerPremolar', scale: 0.8 },
  { id: '36', shape: 'lowerMolar', scale: 0.88 },
  { id: '37', shape: 'lowerMolar', scale: 0.88 },
  { id: '38', shape: 'lowerMolar', scale: 0.88 },
];

const ALL_TEETH: ToothPlaced[] = [
  ...placeOnArc(upperRightDefs, CX, UPPER_CY, UPPER_RX, UPPER_RY, upperRightAngles, false, true),
  ...placeOnArc(upperLeftDefs, CX, UPPER_CY, UPPER_RX, UPPER_RY, upperLeftAngles, false, true),
  ...placeOnArc(lowerRightDefs, CX, LOWER_CY, LOWER_RX, LOWER_RY, lowerRightAngles, true, false),
  ...placeOnArc(lowerLeftDefs, CX, LOWER_CY, LOWER_RX, LOWER_RY, lowerLeftAngles, true, false),
];

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
        <h2 className="text-lg font-semibold text-foreground">Onde sente o problema?</h2>
        <p className="text-sm text-muted-foreground mt-1">Toque nos dentes afetados</p>
      </div>

      <div className="bg-[#1E3A5F]/40 rounded-xl p-2 md:p-4 mx-auto max-w-[540px]">
        <div className="flex justify-between px-2 mb-0">
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Sup. Direito</span>
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Sup. Esquerdo</span>
        </div>

        <svg viewBox="0 0 400 310" className="w-full h-auto" style={{ maxHeight: 350 }}>
          {/* Dividers */}
          <line x1={CX} y1="8" x2={CX} y2="302" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.3} />
          <line x1="12" y1="168" x2="388" y2="168" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.3} />
          <text x="20" y="172" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">D</text>
          <text x="374" y="172" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">E</text>

          {ALL_TEETH.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id);
            const shape = SHAPES[tooth.shape];
            if (!shape) return null;

            const outwardDist = tooth.isUpper ? -18 : 18;
            const rotRad = (tooth.rotate * Math.PI) / 180;
            const numX = tooth.x + Math.sin(rotRad) * outwardDist;
            const numY = tooth.y - Math.cos(rotRad) * outwardDist;

            return (
              <g key={tooth.id}>
                {/* Tooth */}
                <g
                  transform={`translate(${tooth.x},${tooth.y}) rotate(${tooth.rotate}) scale(${tooth.scale})`}
                  onClick={() => toggleTooth(tooth.id)}
                  className={cn(
                    'cursor-pointer',
                    unknownLocation && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  <rect x={-14} y={-16} width={28} height={32} fill="transparent" />
                  <path
                    d={shape.outline}
                    className={cn(
                      'transition-all duration-150',
                      isSelected ? 'fill-primary/90 stroke-primary' : 'fill-[#0f2a42] stroke-[#4a6a8a]',
                    )}
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />
                  <path
                    d={shape.detail}
                    className={cn(
                      'transition-all duration-150',
                      isSelected ? 'stroke-primary-foreground/40' : 'stroke-[#3a5a7a]/50',
                    )}
                    strokeWidth={0.7}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
                {/* Number — positioned outward, always upright */}
                <text
                  x={numX}
                  y={numY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    'select-none pointer-events-none',
                    isSelected ? 'fill-primary font-bold' : 'fill-muted-foreground/60',
                  )}
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {tooth.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between px-2 -mt-1">
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Inf. Direito</span>
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Inf. Esquerdo</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#0f2a42] border border-[#4a6a8a]" />
          <span>Não afetado</span>
        </div>
      </div>

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
