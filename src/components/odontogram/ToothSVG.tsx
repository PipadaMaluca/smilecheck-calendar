import { cn } from '@/lib/utils';
import { Surface, ToothData, STATUS_COLORS } from './odontogramData';

interface ToothSVGProps {
  toothId: string;
  data: ToothData;
  isSelected: boolean;
  onClick: () => void;
  size?: number;
}

/**
 * Renders a single tooth with 5 clickable surfaces:
 * Layout (trapezoids around center square):
 *   [V] top
 * [M] [O] [D]
 *   [L] bottom
 */
export function ToothSVG({ toothId, data, isSelected, onClick, size = 44 }: ToothSVGProps) {
  if (data.isMissing) {
    return (
      <svg width={size} height={size + 14} viewBox="0 0 44 58" className="cursor-pointer press" onClick={onClick}>
        <text x="22" y="10" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="monospace"
          className={cn(isSelected ? 'fill-primary' : 'fill-muted-foreground/60')}>{toothId}</text>
        <g transform="translate(2,16)">
          <rect x="0" y="0" width="40" height="40" rx="4" fill="none" stroke="#4a6a8a" strokeWidth="1" opacity="0.3" />
          <line x1="4" y1="4" x2="36" y2="36" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="4" x2="4" y2="36" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  const getSurfaceFill = (s: Surface) => {
    const st = data.surfaces[s].status;
    const c = STATUS_COLORS[st];
    return c.fill === 'transparent' ? 'transparent' : c.fill;
  };

  const getSurfaceStroke = (s: Surface) => {
    const st = data.surfaces[s].status;
    const c = STATUS_COLORS[st];
    return c.stroke || (c.fill === 'transparent' ? '#4a6a8a' : c.fill);
  };

  const getSurfaceDash = (s: Surface) => {
    const st = data.surfaces[s].status;
    return STATUS_COLORS[st].dashed ? '3,2' : undefined;
  };

  // Surface paths within a 40x40 viewbox (offset by 2,16)
  // V = top trapezoid, L = bottom, M = left, D = right, O = center
  const paths: Record<Surface, string> = {
    V: 'M0,0 L40,0 L30,10 L10,10 Z',
    L: 'M10,30 L30,30 L40,40 L0,40 Z',
    M: 'M0,0 L10,10 L10,30 L0,40 Z',
    D: 'M30,10 L40,0 L40,40 L30,30 Z',
    O: 'M10,10 L30,10 L30,30 L10,30 Z',
  };

  return (
    <svg width={size} height={size + 14} viewBox="0 0 44 58" className="cursor-pointer press" onClick={onClick}>
      <text x="22" y="10" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="monospace"
        className={cn(isSelected ? 'fill-primary font-bold' : 'fill-muted-foreground/60')}>{toothId}</text>
      <g transform="translate(2,16)">
        {(Object.keys(paths) as Surface[]).map(s => (
          <path
            key={s}
            d={paths[s]}
            fill={getSurfaceFill(s)}
            stroke={getSurfaceStroke(s)}
            strokeWidth="1"
            strokeDasharray={getSurfaceDash(s)}
            className="transition-colors duration-150"
          />
        ))}
        {isSelected && (
          <rect x="-1" y="-1" width="42" height="42" rx="4" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="2" />
        )}
      </g>
    </svg>
  );
}
