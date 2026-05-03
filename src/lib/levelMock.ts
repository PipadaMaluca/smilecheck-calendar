import { LEVELS } from '@/data/pointsData';

/** Deterministic mock level assignment from a name string. */
export function getMockLevelForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % LEVELS.length;
  return LEVELS[idx].key;
}