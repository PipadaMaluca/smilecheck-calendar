import { DentistInfo } from './TeamDentistCard';

export const clinicTeamMembers: DentistInfo[] = [
  {
    id: '1', name: 'Dr. Gonçalo Pipo', specialty: 'Generalista',
    rating: 4.8, level: 'Ouro', consultationsThisMonth: 142,
    teleconsultationsThisMonth: 18, confirmationRate: 95,
    memberSince: 'Mar 2024', status: 'active',
    scheduleSummary: 'Seg-Sex 09:00-19:00',
    teleconsultas: true,
    specialties: ['Generalista', 'Dentisteria'],
  },
  {
    id: '2', name: 'Dr. Alexandre Bernardo', specialty: 'Generalista (faz tudo)',
    rating: 4.9, level: 'Platina', consultationsThisMonth: 118,
    teleconsultationsThisMonth: 12, confirmationRate: 93,
    memberSince: 'Jan 2024', status: 'active',
    scheduleSummary: 'Seg-Sex 09:00-19:00',
    teleconsultas: true,
    specialties: ['Generalista', 'Ortodontia', 'Cirurgia', 'Prótese'],
  },
  {
    id: '3', name: 'Dr. Gil Santos', specialty: 'Generalista',
    rating: 4.5, level: 'Prata', consultationsThisMonth: 95,
    teleconsultationsThisMonth: 8, confirmationRate: 88,
    memberSince: 'Jun 2024', status: 'active',
    scheduleSummary: 'Seg-Sex 09:00-19:00',
    teleconsultas: false,
    specialties: ['Generalista'],
  },
];

export const pendingInvites = [
  { id: 'inv1', name: 'Dra. Sofia Mendes', email: 'sofia.mendes@email.com', sentAt: '28 Jan 2026', status: 'pending' as const },
];

export const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;

export const clinicHours = [
  { day: 'Segunda', open: true, start: '09:00', end: '19:00' },
  { day: 'Terça', open: true, start: '09:00', end: '19:00' },
  { day: 'Quarta', open: true, start: '09:00', end: '19:00' },
  { day: 'Quinta', open: true, start: '09:00', end: '19:00' },
  { day: 'Sexta', open: true, start: '09:00', end: '19:00' },
  { day: 'Sábado', open: true, start: '09:00', end: '13:00' },
  { day: 'Domingo', open: false, start: '', end: '' },
];

export const dentistSchedules: Record<string, { clinicId: string; clinicName: string; schedule: typeof clinicHours }> = {
  '1-1': {
    clinicId: '1', clinicName: 'Clínica SmileCheck',
    schedule: [
      { day: 'Segunda', open: true, start: '09:00', end: '19:00' },
      { day: 'Terça', open: true, start: '09:00', end: '19:00' },
      { day: 'Quarta', open: true, start: '09:00', end: '19:00' },
      { day: 'Quinta', open: true, start: '09:00', end: '19:00' },
      { day: 'Sexta', open: true, start: '09:00', end: '19:00' },
      { day: 'Sábado', open: false, start: '', end: '' },
      { day: 'Domingo', open: false, start: '', end: '' },
    ],
  },
  '1-2': {
    clinicId: '2', clinicName: 'Clínica Mitry-Mory',
    schedule: [
      { day: 'Segunda', open: false, start: '', end: '' },
      { day: 'Terça', open: false, start: '', end: '' },
      { day: 'Quarta', open: true, start: '14:00', end: '19:00' },
      { day: 'Quarta', open: false, start: '', end: '' },
      { day: 'Quinta', open: false, start: '', end: '' },
      { day: 'Sexta', open: false, start: '', end: '' },
      { day: 'Sábado', open: true, start: '09:00', end: '13:00' },
      { day: 'Domingo', open: false, start: '', end: '' },
    ],
  },
  '1-3': {
    clinicId: '3', clinicName: 'Clínica Montfermeil',
    schedule: [
      { day: 'Segunda', open: true, start: '08:00', end: '20:00' },
      { day: 'Terça', open: true, start: '08:00', end: '20:00' },
      { day: 'Quarta', open: true, start: '08:00', end: '20:00' },
      { day: 'Quinta', open: true, start: '08:00', end: '20:00' },
      { day: 'Sexta', open: true, start: '08:00', end: '20:00' },
      { day: 'Sábado', open: true, start: '09:00', end: '14:00' },
      { day: 'Domingo', open: false, start: '', end: '' },
    ],
  },
};

export const holidays = [
  { date: '01 Jan 2026', name: 'Ano Novo', type: 'national' as const },
  { date: '25 Abr 2026', name: 'Dia da Liberdade', type: 'national' as const },
  { date: '01 Mai 2026', name: 'Dia do Trabalhador', type: 'national' as const },
  { date: '10 Jun 2026', name: 'Dia de Portugal', type: 'national' as const },
  { date: '15 Ago 2026', name: 'Assunção de N. Senhora', type: 'national' as const },
  { date: '05 Out 2026', name: 'Implantação da República', type: 'national' as const },
  { date: '01 Nov 2026', name: 'Dia de Todos os Santos', type: 'national' as const },
  { date: '01 Dez 2026', name: 'Restauração da Independência', type: 'national' as const },
  { date: '08 Dez 2026', name: 'Imaculada Conceição', type: 'national' as const },
  { date: '25 Dez 2026', name: 'Natal', type: 'national' as const },
];

export const customClosures = [
  { date: '15 Ago 2026', name: 'Obras', type: 'custom' as const },
];

export const dentistVacations = [
  { id: 'v1', dentistId: '1', start: '15 Jul 2026', end: '31 Jul 2026', days: 17 },
];

export const dentistExceptions = [
  { id: 'e1', dentistId: '1', date: '25 Dez 2026', type: 'unavailable' as const, reason: 'Feriado' },
];
