import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TriageLocationStepProps {
  selectedTeeth: string[];
  unknownLocation: boolean;
  onTeethChange: (teeth: string[]) => void;
  onUnknownChange: (unknown: boolean) => void;
}

// Occlusal view SVG paths for each tooth type - anatomically realistic
const OCCLUSAL_PATHS: Record<string, { outline: string; detail: string; w: number; h: number }> = {
  // Upper molars - wide, rectangular with rounded corners, cross-shaped fissure
  upperMolar: {
    outline: 'M-11,-8 C-11,-11 -8,-13 -4,-13 L4,-13 C8,-13 11,-11 11,-8 L11,8 C11,11 8,13 4,13 L-4,13 C-8,13 -11,11 -11,8 Z',
    detail: 'M-6,0 L6,0 M0,-8 L0,8',
    w: 26, h: 30,
  },
  // Upper premolars - oval, smaller
  upperPremolar: {
    outline: 'M-8,-7 C-8,-10 -5,-12 0,-12 C5,-12 8,-10 8,-7 L8,7 C8,10 5,12 0,12 C-5,12 -8,10 -8,7 Z',
    detail: 'M-4,0 L4,0',
    w: 20, h: 28,
  },
  // Upper canines - diamond / pointed oval
  upperCanine: {
    outline: 'M0,-13 C5,-11 7,-6 7,0 C7,6 5,11 0,13 C-5,11 -7,6 -7,0 C-7,-6 -5,-11 0,-13 Z',
    detail: 'M0,-6 L0,6',
    w: 18, h: 30,
  },
  // Upper lateral incisors - shovel shaped, narrow
  upperLateral: {
    outline: 'M-5,-7 C-5,-10 -3,-12 0,-12 C3,-12 5,-10 5,-7 L5,7 C5,10 3,12 0,12 C-3,12 -5,10 -5,7 Z',
    detail: 'M-2,0 L2,0',
    w: 14, h: 28,
  },
  // Upper central incisors - wider shovel
  upperCentral: {
    outline: 'M-6,-7 C-6,-10 -4,-12 0,-12 C4,-12 6,-10 6,-7 L6,7 C6,10 4,12 0,12 C-4,12 -6,10 -6,7 Z',
    detail: 'M-3,0 L3,0',
    w: 16, h: 28,
  },
  // Lower molars
  lowerMolar: {
    outline: 'M-11,-8 C-11,-11 -8,-13 -4,-13 L4,-13 C8,-13 11,-11 11,-8 L11,8 C11,11 8,13 4,13 L-4,13 C-8,13 -11,11 -11,8 Z',
    detail: 'M-6,0 L6,0 M0,-8 L0,8 M-4,-4 L4,4',
    w: 26, h: 30,
  },
  lowerPremolar: {
    outline: 'M-7,-7 C-7,-10 -4,-12 0,-12 C4,-12 7,-10 7,-7 L7,7 C7,10 4,12 0,12 C-4,12 -7,10 -7,7 Z',
    detail: 'M-3,0 L3,0',
    w: 18, h: 28,
  },
  lowerCanine: {
    outline: 'M0,-13 C5,-11 6,-6 6,0 C6,6 5,11 0,13 C-5,11 -6,6 -6,0 C-6,-6 -5,-11 0,-13 Z',
    detail: 'M0,-5 L0,5',
    w: 16, h: 30,
  },
  lowerLateral: {
    outline: 'M-4,-7 C-4,-10 -2,-12 0,-12 C2,-12 4,-10 4,-7 L4,7 C4,10 2,12 0,12 C-2,12 -4,10 -4,7 Z',
    detail: 'M-1,0 L1,0',
    w: 12, h: 28,
  },
  lowerCentral: {
    outline: 'M-5,-7 C-5,-10 -3,-12 0,-12 C3,-12 5,-10 5,-7 L5,7 C5,10 3,12 0,12 C-3,12 -5,10 -5,7 Z',
    detail: 'M-2,0 L2,0',
    w: 14, h: 28,
  },
};

interface ToothDef {
  id: string;
  shape: string;
}

// Quadrants with correct tooth shapes
const Q_UPPER_RIGHT: ToothDef[] = [
  { id: '18', shape: 'upperMolar' },
  { id: '17', shape: 'upperMolar' },
  { id: '16', shape: 'upperMolar' },
  { id: '15', shape: 'upperPremolar' },
  { id: '14', shape: 'upperPremolar' },
  { id: '13', shape: 'upperCanine' },
  { id: '12', shape: 'upperLateral' },
  { id: '11', shape: 'upperCentral' },
];

const Q_UPPER_LEFT: ToothDef[] = [
  { id: '21', shape: 'upperCentral' },
  { id: '22', shape: 'upperLateral' },
  { id: '23', shape: 'upperCanine' },
  { id: '24', shape: 'upperPremolar' },
  { id: '25', shape: 'upperPremolar' },
  { id: '26', shape: 'upperMolar' },
  { id: '27', shape: 'upperMolar' },
  { id: '28', shape: 'upperMolar' },
];

const Q_LOWER_LEFT: ToothDef[] = [
  { id: '31', shape: 'lowerCentral' },
  { id: '32', shape: 'lowerLateral' },
  { id: '33', shape: 'lowerCanine' },
  { id: '34', shape: 'lowerPremolar' },
  { id: '35', shape: 'lowerPremolar' },
  { id: '36', shape: 'lowerMolar' },
  { id: '37', shape: 'lowerMolar' },
  { id: '38', shape: 'lowerMolar' },
];

const Q_LOWER_RIGHT: ToothDef[] = [
  { id: '48', shape: 'lowerMolar' },
  { id: '47', shape: 'lowerMolar' },
  { id: '46', shape: 'lowerMolar' },
  { id: '45', shape: 'lowerPremolar' },
  { id: '44', shape: 'lowerPremolar' },
  { id: '43', shape: 'lowerCanine' },
  { id: '42', shape: 'lowerLateral' },
  { id: '41', shape: 'lowerCentral' },
];

function ToothButton({
  tooth,
  isSelected,
  disabled,
  onToggle,
  numberBelow,
}: {
  tooth: ToothDef;
  isSelected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
  numberBelow: boolean;
}) {
  const shape = OCCLUSAL_PATHS[tooth.shape];
  if (!shape) return null;

  return (
    <button
      type="button"
      onClick={() => onToggle(tooth.id)}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center transition-all duration-150 rounded p-[2px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && 'hover:bg-primary/10 cursor-pointer active:scale-95',
      )}
      aria-label={`Dente ${tooth.id}`}
    >
      {!numberBelow && (
        <span className={cn(
          'text-[8px] md:text-[9px] leading-none font-mono mb-[1px]',
          isSelected ? 'text-primary font-bold' : 'text-muted-foreground/60',
        )}>
          {tooth.id}
        </span>
      )}
      <svg
        width={shape.w * 0.85}
        height={shape.h * 0.85}
        viewBox={`${-shape.w / 2} ${-shape.h / 2} ${shape.w} ${shape.h}`}
        className="md:scale-110"
      >
        {/* Outer shape */}
        <path
          d={shape.outline}
          className={cn(
            'transition-all duration-150',
            isSelected
              ? 'fill-primary/90 stroke-primary'
              : 'fill-[#0f2a42] stroke-[#4a6a8a] hover:stroke-primary/60',
          )}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        {/* Inner fissure detail */}
        <path
          d={shape.detail}
          className={cn(
            'transition-all duration-150',
            isSelected ? 'stroke-primary-foreground/50' : 'stroke-[#3a5a7a]/60',
          )}
          strokeWidth={0.8}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {numberBelow && (
        <span className={cn(
          'text-[8px] md:text-[9px] leading-none font-mono mt-[1px]',
          isSelected ? 'text-primary font-bold' : 'text-muted-foreground/60',
        )}>
          {tooth.id}
        </span>
      )}
    </button>
  );
}

function QuadrantRow({
  teeth,
  selectedTeeth,
  disabled,
  onToggle,
  numberBelow,
}: {
  teeth: ToothDef[];
  selectedTeeth: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
  numberBelow: boolean;
}) {
  return (
    <div className="flex items-center gap-[2px] md:gap-1">
      {teeth.map((t) => (
        <ToothButton
          key={t.id}
          tooth={t}
          isSelected={selectedTeeth.includes(t.id)}
          disabled={disabled}
          onToggle={onToggle}
          numberBelow={numberBelow}
        />
      ))}
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
      <div className="bg-[#1E3A5F]/40 rounded-xl p-3 md:p-5 mx-auto max-w-[520px] space-y-0">
        {/* Upper labels */}
        <div className="flex justify-between px-1 mb-1">
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Sup. Direito
          </span>
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Sup. Esquerdo
          </span>
        </div>

        {/* Upper arch - numbers above */}
        <div className="flex items-end justify-center gap-2 md:gap-3">
          <QuadrantRow teeth={Q_UPPER_RIGHT} selectedTeeth={selectedTeeth} disabled={unknownLocation} onToggle={toggleTooth} numberBelow={false} />
          <div className="w-px h-12 bg-muted-foreground/30 flex-shrink-0" />
          <QuadrantRow teeth={Q_UPPER_LEFT} selectedTeeth={selectedTeeth} disabled={unknownLocation} onToggle={toggleTooth} numberBelow={false} />
        </div>

        {/* Horizontal divider */}
        <div className="flex items-center gap-1 my-1">
          <div className="flex-1 h-px bg-muted-foreground/25" />
          <div className="flex items-center gap-1 px-1">
            <span className="text-[8px] text-muted-foreground/40 font-medium">D</span>
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
            <span className="text-[8px] text-muted-foreground/40 font-medium">E</span>
          </div>
          <div className="flex-1 h-px bg-muted-foreground/25" />
        </div>

        {/* Lower arch - numbers below */}
        <div className="flex items-start justify-center gap-2 md:gap-3">
          <QuadrantRow teeth={Q_LOWER_RIGHT} selectedTeeth={selectedTeeth} disabled={unknownLocation} onToggle={toggleTooth} numberBelow={true} />
          <div className="w-px h-12 bg-muted-foreground/30 flex-shrink-0" />
          <QuadrantRow teeth={Q_LOWER_LEFT} selectedTeeth={selectedTeeth} disabled={unknownLocation} onToggle={toggleTooth} numberBelow={true} />
        </div>

        {/* Lower labels */}
        <div className="flex justify-between px-1 mt-1">
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Inf. Direito
          </span>
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
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
          <div className="w-3 h-3 rounded bg-[#0f2a42] border border-[#4a6a8a]" />
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
