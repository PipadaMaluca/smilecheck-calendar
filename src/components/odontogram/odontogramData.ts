export type ToothStatus = 'healthy' | 'cavity' | 'restoration' | 'crown' | 'missing' | 'implant' | 'rootCanal' | 'prosthesis' | 'toTreat';

export type Surface = 'M' | 'D' | 'O' | 'V' | 'L';

export const SURFACES: Surface[] = ['M', 'D', 'O', 'V', 'L'];

export const STATUS_COLORS: Record<ToothStatus, { fill: string; stroke?: string; dashed?: boolean }> = {
  healthy: { fill: 'transparent', stroke: '#4a6a8a' },
  cavity: { fill: '#F44336' },
  restoration: { fill: '#2196F3' },
  crown: { fill: '#FFD700' },
  missing: { fill: '#9E9E9E' },
  implant: { fill: '#4CAF50' },
  rootCanal: { fill: '#9C27B0' },
  prosthesis: { fill: 'transparent', stroke: '#FF9800' },
  toTreat: { fill: 'transparent', stroke: '#F44336', dashed: true },
};

export interface SurfaceData {
  status: ToothStatus;
}

export interface ToothData {
  surfaces: Record<Surface, SurfaceData>;
  notes: string;
  isMissing: boolean;
}

export interface OdontogramHistory {
  date: string;
  dentist: string;
  tooth: string;
  description: string;
}

export type OdontogramState = Record<string, ToothData>;

export function getJoaoSilvaMockData(): { state: OdontogramState; history: OdontogramHistory[] } {
  const state = getDefaultOdontogram();

  // Tooth 16: Restoration on occlusal
  state['16'].surfaces.O = { status: 'restoration' };
  state['16'].notes = 'Restauração oclusal em compósito';

  // Tooth 26: Crown (all surfaces)
  for (const s of SURFACES) state['26'].surfaces[s] = { status: 'crown' };
  state['26'].notes = 'Coroa metalocerâmica';

  // Tooth 36: Cavity on M and O
  state['36'].surfaces.M = { status: 'cavity' };
  state['36'].surfaces.O = { status: 'cavity' };
  state['36'].notes = 'Cárie mesio-oclusal a tratar';

  // Tooth 46: Root canal + crown
  for (const s of SURFACES) state['46'].surfaces[s] = { status: 'crown' };
  state['46'].surfaces.O = { status: 'rootCanal' };
  state['46'].notes = 'Endodontia + coroa definitiva';

  // Wisdom teeth missing
  for (const id of ['18', '28', '38', '48']) {
    state[id].isMissing = true;
    for (const s of SURFACES) state[id].surfaces[s] = { status: 'missing' };
    state[id].notes = 'Extraído (siso)';
  }

  const history: OdontogramHistory[] = [
    { date: '28 Jan 2026', dentist: 'Dr. Gonçalo Pipo', tooth: '36', description: 'odontogram.history.cavityDetected' },
    { date: '15 Jan 2026', dentist: 'Dr. Gonçalo Pipo', tooth: '16', description: 'odontogram.history.restorationDone' },
    { date: '02 Dez 2025', dentist: 'Dr. Alexandre Bernardo', tooth: '46', description: 'odontogram.history.rootCanalCrown' },
    { date: '18 Out 2025', dentist: 'Dr. Gonçalo Pipo', tooth: '26', description: 'odontogram.history.crownPlaced' },
  ];

  return { state, history };
}

// FDI tooth arrangement
export const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
export const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
export const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];
export const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
