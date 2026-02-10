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

interface ToothArc {
  id: string;
  shape: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  // label offset toward interior of arch (in local rotated coords, positive Y = toward arch center)
  labelY: number;
}

function placeOnArc(
  teeth: { id: string; shape: string; scale: number }[],
  cx: number, cy: number, rx: number, ry: number,
  startAngle: number, endAngle: number,
  flipRotation: boolean,
  labelInward: number, // positive = toward arch center
): ToothArc[] {
  const n = teeth.length;
  return teeth.map((t, i) => {
    const frac = n > 1 ? i / (n - 1) : 0.5;
    const angleDeg = startAngle + frac * (endAngle - startAngle);
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + rx * Math.cos(angleRad);
    const y = cy + ry * Math.sin(angleRad);
    const rot = flipRotation ? angleDeg + 90 : angleDeg - 90;
    return { ...t, x, y, rotate: rot, labelY: labelInward };
  });
}

const UPPER_RIGHT_DEFS = [
  { id: '18', shape: 'upperMolar', scale: 1.0 },
  { id: '17', shape: 'upperMolar', scale: 1.0 },
  { id: '16', shape: 'upperMolar', scale: 1.0 },
  { id: '15', shape: 'upperPremolar', scale: 0.88 },
  { id: '14', shape: 'upperPremolar', scale: 0.88 },
  { id: '13', shape: 'upperCanine', scale: 0.85 },
  { id: '12', shape: 'upperLateral', scale: 0.78 },
  { id: '11', shape: 'upperCentral', scale: 0.95 },
];

const UPPER_LEFT_DEFS = [
  { id: '21', shape: 'upperCentral', scale: 0.95 },
  { id: '22', shape: 'upperLateral', scale: 0.78 },
  { id: '23', shape: 'upperCanine', scale: 0.85 },
  { id: '24', shape: 'upperPremolar', scale: 0.88 },
  { id: '25', shape: 'upperPremolar', scale: 0.88 },
  { id: '26', shape: 'upperMolar', scale: 1.0 },
  { id: '27', shape: 'upperMolar', scale: 1.0 },
  { id: '28', shape: 'upperMolar', scale: 1.0 },
];

const LOWER_RIGHT_DEFS = [
  { id: '48', shape: 'lowerMolar', scale: 1.0 },
  { id: '47', shape: 'lowerMolar', scale: 1.0 },
  { id: '46', shape: 'lowerMolar', scale: 1.0 },
  { id: '45', shape: 'lowerPremolar', scale: 0.88 },
  { id: '44', shape: 'lowerPremolar', scale: 0.88 },
  { id: '43', shape: 'lowerCanine', scale: 0.85 },
  { id: '42', shape: 'lowerLateral', scale: 0.78 },
  { id: '41', shape: 'lowerCentral', scale: 0.8 },
];

const LOWER_LEFT_DEFS = [
  { id: '31', shape: 'lowerCentral', scale: 0.8 },
  { id: '32', shape: 'lowerLateral', scale: 0.78 },
  { id: '33', shape: 'lowerCanine', scale: 0.85 },
  { id: '34', shape: 'lowerPremolar', scale: 0.88 },
  { id: '35', shape: 'lowerPremolar', scale: 0.88 },
  { id: '36', shape: 'lowerMolar', scale: 1.0 },
  { id: '37', shape: 'lowerMolar', scale: 1.0 },
  { id: '38', shape: 'lowerMolar', scale: 1.0 },
];

const CX = 200;

// Upper arch — wider ellipse, more spread angle range
const UPPER_CY = 130;
const UPPER_RX = 170;
const UPPER_RY = 110;
// Upper right: 18 at ~198°, 11 at ~262°  (wider spread = less overlap)
// Upper left: 21 at ~278°, 28 at ~342°
const upperRight = placeOnArc(UPPER_RIGHT_DEFS, CX, UPPER_CY, UPPER_RX, UPPER_RY, 198, 262, false, 18);
const upperLeft = placeOnArc(UPPER_LEFT_DEFS, CX, UPPER_CY, UPPER_RX, UPPER_RY, 278, 342, false, 18);

// Lower arch — slightly smaller
const LOWER_CY = 195;
const LOWER_RX = 145;
const LOWER_RY = 90;
const lowerRight = placeOnArc(LOWER_RIGHT_DEFS, CX, LOWER_CY, LOWER_RX, LOWER_RY, 162, 98, true, -18);
const lowerLeft = placeOnArc(LOWER_LEFT_DEFS, CX, LOWER_CY, LOWER_RX, LOWER_RY, 82, 18, true, -18);

const ALL_TEETH: ToothArc[] = [...upperRight, ...upperLeft, ...lowerRight, ...lowerLeft];

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

        <svg viewBox="0 0 400 330" className="w-full h-auto" style={{ maxHeight: 360 }}>
          {/* Crosshair dividers */}
          <line x1={CX} y1="10" x2={CX} y2="320" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.35} />
          <line x1="15" y1="165" x2="385" y2="165" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.35} />

          <text x="24" y="169" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">D</text>
          <text x="370" y="169" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">E</text>

          {ALL_TEETH.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id);
            const shape = SHAPES[tooth.shape];
            if (!shape) return null;

            return (
              <g
                key={tooth.id}
                transform={`translate(${tooth.x},${tooth.y})`}
                onClick={() => toggleTooth(tooth.id)}
                className={cn(
                  'cursor-pointer',
                  unknownLocation && 'opacity-40 cursor-not-allowed pointer-events-none',
                )}
              >
                {/* Rotated tooth shape */}
                <g transform={`rotate(${tooth.rotate}) scale(${tooth.scale})`}>
                  <rect x={-14} y={-16} width={28} height={32} fill="transparent" />
                  <path
                    d={shape.outline}
                    className={cn(
                      'transition-all duration-150',
                      isSelected
                        ? 'fill-primary/90 stroke-primary'
                        : 'fill-[#0f2a42] stroke-[#4a6a8a]',
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
                {/* Number — inside the arch (toward center of mouth) */}
                {/* labelY is in rotated-tooth local space: we offset along the radial inward direction */}
                {(() => {
                  const angleRad = (tooth.rotate + 90) * Math.PI / 180; // direction toward arch center (upper: down, lower: up)
                  // For upper teeth (rotate ~ -90+angle → labelY positive pushes inward/down)
                  // For lower teeth (rotate ~ 90+angle → labelY negative pushes inward/up)
                  const nx = Math.cos(angleRad * 0) * 0; // not needed, we use labelY along the tooth's outward axis
                  void nx;
                  // Simply offset along the tooth's local Y axis (after rotation), which points outward
                  // labelY > 0 = toward arch interior for upper, labelY < 0 for lower
                  const rotRad = (tooth.rotate * Math.PI) / 180;
                  const dx = -Math.sin(rotRad) * tooth.labelY;
                  const dy = Math.cos(rotRad) * tooth.labelY;
                  return (
                    <text
                      x={dx}
                      y={dy + 2.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        'select-none pointer-events-none',
                        isSelected ? 'fill-primary font-bold' : 'fill-muted-foreground/60',
                      )}
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      {tooth.id}
                    </text>
                  );
                })()}
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
