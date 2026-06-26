import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TriageLocationStepProps {
  selectedTeeth: string[];
  unknownLocation: boolean;
  onTeethChange: (teeth: string[]) => void;
  onUnknownChange: (unknown: boolean) => void;
}

const SHAPES: Record<string, { outline: string; detail: string; w: number; h: number }> = {
  upperMolar: {
    outline: 'M-9,-7 C-9,-9 -7,-10 -4,-10 L4,-10 C7,-10 9,-9 9,-7 L9,7 C9,9 7,10 4,10 L-4,10 C-7,10 -9,9 -9,7 Z',
    detail: 'M-5,0 L5,0 M0,-6 L0,6',
    w: 18, h: 20,
  },
  upperPremolar: {
    outline: 'M-6,-7 C-6,-9 -3,-10 0,-10 C3,-10 6,-9 6,-7 L6,7 C6,9 3,10 0,10 C-3,10 -6,9 -6,7 Z',
    detail: 'M-3,0 L3,0',
    w: 12, h: 20,
  },
  upperCanine: {
    outline: 'M0,-10 C4,-8 6,-4 6,0 C6,4 4,8 0,10 C-4,8 -6,4 -6,0 C-6,-4 -4,-8 0,-10 Z',
    detail: 'M0,-5 L0,5',
    w: 12, h: 20,
  },
  upperLateral: {
    outline: 'M-4,-7 C-4,-9 -2,-10 0,-10 C2,-10 4,-9 4,-7 L4,7 C4,9 2,10 0,10 C-2,10 -4,9 -4,7 Z',
    detail: '',
    w: 8, h: 20,
  },
  upperCentral: {
    outline: 'M-5,-7 C-5,-9 -3,-10 0,-10 C3,-10 5,-9 5,-7 L5,7 C5,9 3,10 0,10 C-3,10 -5,9 -5,7 Z',
    detail: '',
    w: 10, h: 20,
  },
  lowerMolar: {
    outline: 'M-9,-7 C-9,-9 -7,-10 -4,-10 L4,-10 C7,-10 9,-9 9,-7 L9,7 C9,9 7,10 4,10 L-4,10 C-7,10 -9,9 -9,7 Z',
    detail: 'M-5,0 L5,0 M0,-6 L0,6 M-4,-4 L4,4',
    w: 18, h: 20,
  },
  lowerPremolar: {
    outline: 'M-5,-7 C-5,-9 -3,-10 0,-10 C3,-10 5,-9 5,-7 L5,7 C5,9 3,10 0,10 C-3,10 -5,9 -5,7 Z',
    detail: 'M-2,0 L2,0',
    w: 10, h: 20,
  },
  lowerCanine: {
    outline: 'M0,-10 C4,-8 5,-4 5,0 C5,4 4,8 0,10 C-4,8 -5,4 -5,0 C-5,-4 -4,-8 0,-10 Z',
    detail: 'M0,-4 L0,4',
    w: 10, h: 20,
  },
  lowerLateral: {
    outline: 'M-3,-7 C-3,-9 -1.5,-10 0,-10 C1.5,-10 3,-9 3,-7 L3,7 C3,9 1.5,10 0,10 C-1.5,10 -3,9 -3,7 Z',
    detail: '',
    w: 6, h: 20,
  },
  lowerCentral: {
    outline: 'M-3.5,-7 C-3.5,-9 -2,-10 0,-10 C2,-10 3.5,-9 3.5,-7 L3.5,7 C3.5,9 2,10 0,10 C-2,10 -3.5,9 -3.5,7 Z',
    detail: '',
    w: 7, h: 20,
  },
};

interface ToothDef {
  id: string;
  shape: string;
  x: number;
  y: number;
  rotate: number;
}

const CX = 200;

function buildArch(
  defs: { id: string; shape: string }[],
  positions: { x: number; y: number; r: number }[],
): ToothDef[] {
  return defs.map((d, i) => ({
    ...d,
    x: positions[i].x,
    y: positions[i].y,
    rotate: positions[i].r,
  }));
}

const upperRight = buildArch(
  [
    { id: '18', shape: 'upperMolar' }, { id: '17', shape: 'upperMolar' }, { id: '16', shape: 'upperMolar' },
    { id: '15', shape: 'upperPremolar' }, { id: '14', shape: 'upperPremolar' }, { id: '13', shape: 'upperCanine' },
    { id: '12', shape: 'upperLateral' }, { id: '11', shape: 'upperCentral' },
  ],
  [
    { x: 104, y: 124, r: -62 }, { x: 111, y: 98, r: -47 }, { x: 124, y: 76, r: -32 },
    { x: 136, y: 58, r: -22 }, { x: 149, y: 45, r: -14 }, { x: 160, y: 38, r: -8 },
    { x: 173, y: 33, r: -3 }, { x: 187, y: 31, r: 0 },
  ],
);

const upperLeft = buildArch(
  [
    { id: '21', shape: 'upperCentral' }, { id: '22', shape: 'upperLateral' }, { id: '23', shape: 'upperCanine' },
    { id: '24', shape: 'upperPremolar' }, { id: '25', shape: 'upperPremolar' }, { id: '26', shape: 'upperMolar' },
    { id: '27', shape: 'upperMolar' }, { id: '28', shape: 'upperMolar' },
  ],
  [
    { x: 213, y: 31, r: 0 }, { x: 227, y: 33, r: 3 }, { x: 240, y: 38, r: 8 },
    { x: 251, y: 45, r: 14 }, { x: 264, y: 58, r: 22 }, { x: 276, y: 76, r: 32 },
    { x: 289, y: 98, r: 47 }, { x: 296, y: 124, r: 62 },
  ],
);

const lowerRight = buildArch(
  [
    { id: '48', shape: 'lowerMolar' }, { id: '47', shape: 'lowerMolar' }, { id: '46', shape: 'lowerMolar' },
    { id: '45', shape: 'lowerPremolar' }, { id: '44', shape: 'lowerPremolar' }, { id: '43', shape: 'lowerCanine' },
    { id: '42', shape: 'lowerLateral' }, { id: '41', shape: 'lowerCentral' },
  ],
  [
    { x: 114, y: 176, r: 62 }, { x: 119, y: 200, r: 47 }, { x: 130, y: 218, r: 32 },
    { x: 142, y: 237, r: 22 }, { x: 155, y: 248, r: 14 }, { x: 166, y: 255, r: 8 },
    { x: 179, y: 259, r: 3 }, { x: 193, y: 261, r: 0 },
  ],
);

const lowerLeft = buildArch(
  [
    { id: '31', shape: 'lowerCentral' }, { id: '32', shape: 'lowerLateral' }, { id: '33', shape: 'lowerCanine' },
    { id: '34', shape: 'lowerPremolar' }, { id: '35', shape: 'lowerPremolar' }, { id: '36', shape: 'lowerMolar' },
    { id: '37', shape: 'lowerMolar' }, { id: '38', shape: 'lowerMolar' },
  ],
  [
    { x: 207, y: 261, r: 0 }, { x: 221, y: 259, r: -3 }, { x: 234, y: 255, r: -8 },
    { x: 245, y: 248, r: -14 }, { x: 258, y: 237, r: -22 }, { x: 270, y: 218, r: -32 },
    { x: 281, y: 200, r: -47 }, { x: 286, y: 176, r: -62 },
  ],
);

const ALL_TEETH: ToothDef[] = [...upperRight, ...upperLeft, ...lowerRight, ...lowerLeft];

function isUpperTooth(id: string): boolean {
  const num = parseInt(id);
  return num >= 11 && num <= 28;
}

export function TriageLocationStep({
  selectedTeeth,
  unknownLocation,
  onTeethChange,
  onUnknownChange,
}: TriageLocationStepProps) {
  const { t } = useTranslation();

  const toggleTooth = (toothId: string) => {
    if (unknownLocation) return;
    if (selectedTeeth.includes(toothId)) {
      onTeethChange(selectedTeeth.filter((tid) => tid !== toothId));
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
        <h2 className="text-lg font-semibold text-foreground">{t('triage.location.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('triage.location.subtitle')}</p>
      </div>

      <div className="bg-[#1E3A5F]/40 rounded-xl p-2 md:p-4 mx-auto max-w-[540px]">
        <div className="flex justify-between px-2 mb-0">
          <span className="text-[11px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t('triage.location.upperRight')}</span>
          <span className="text-[11px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t('triage.location.upperLeft')}</span>
        </div>

        <svg viewBox="0 0 400 300" className="w-full h-auto" style={{ maxHeight: 360 }}>
          <line x1={CX} y1="8" x2={CX} y2="282" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.3} />
          <line x1="80" y1="145" x2="320" y2="145" stroke="hsl(215 20% 40%)" strokeWidth="0.6" strokeDasharray="3,3" opacity={0.3} />
          <text x="88" y="149" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">D</text>
          <text x="306" y="149" className="fill-muted-foreground/40" fontSize="9" fontWeight="500">E</text>

          {ALL_TEETH.map((tooth) => {
            const isSelected = selectedTeeth.includes(tooth.id);
            const shape = SHAPES[tooth.shape];
            if (!shape) return null;

            const upper = isUpperTooth(tooth.id);
            const scale = 0.8;
            const numOffset = upper ? -21 : 21;
            const rotRad = (tooth.rotate * Math.PI) / 180;
            const numX = tooth.x + Math.sin(rotRad) * numOffset;
            const numY = tooth.y - Math.cos(rotRad) * numOffset;

            return (
              <g key={tooth.id}>
                <g
                  transform={`translate(${tooth.x},${tooth.y}) rotate(${tooth.rotate}) scale(${scale})`}
                  onClick={() => toggleTooth(tooth.id)}
                  className={cn(
                    'cursor-pointer',
                    unknownLocation && 'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  <rect x={-14} y={-14} width={28} height={28} fill="transparent" />
                  <path
                    d={shape.outline}
                    className={cn(
                      'transition-all duration-150',
                      isSelected ? 'fill-primary/90 stroke-primary' : 'fill-[#0f2a42] stroke-[#4a6a8a]',
                    )}
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />
                  {shape.detail && (
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
                  )}
                </g>
                <text
                  x={numX}
                  y={numY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    'select-none pointer-events-none',
                    isSelected ? 'fill-primary font-bold' : 'fill-muted-foreground/60',
                  )}
                  fontSize="8"
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
          <span className="text-[11px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t('triage.location.lowerRight')}</span>
          <span className="text-[11px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{t('triage.location.lowerLeft')}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>{t('triage.location.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#0f2a42] border border-[#4a6a8a]" />
          <span>{t('triage.location.unaffected')}</span>
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
        <span className="text-sm text-foreground">{t('triage.location.unknownLocation')}</span>
      </div>
    </div>
  );
}
