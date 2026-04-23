// Mock data for dentist search results

export interface DentistSearchResult {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  level: 'ouro' | 'prata' | 'bronze';
  specialties: string[];
  distance: number;
  clinics: { id: string; name: string; address: string; distance: number }[];
  nextAvailable: string;
  teleconsultaPrice: number;
  bio: string;
  previousPatient: boolean;
  plan: 'premium' | 'pro' | 'free';
}

export interface DentistReview {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface DentistAvailability {
  date: string;
  /** Key used by render layer to translate the day label (e.g. 'today', 'tomorrow', 'wed', 'thu', 'fri', 'sat', 'sun'). */
  dayKey: string;
  /** Fallback / legacy label (Portuguese). Prefer translating from dayKey at render time. */
  dayLabel: string;
  slots: string[];
}

export const MOCK_DENTIST_RESULTS: DentistSearchResult[] = [
  {
    id: '1',
    name: 'Dr. Gonçalo Pipo',
    avatar: 'goncalo',
    rating: 4.9,
    reviewCount: 127,
    level: 'ouro',
    specialties: ['Generalista', 'Estética Dentária'],
    distance: 2.5,
    clinics: [{ id: '1', name: 'Clínica SmileCheck', address: 'Rua Augusta 123, Lisboa', distance: 2.5 }],
    nextAvailable: 'Hoje, 15:30',
    teleconsultaPrice: 20,
    bio: 'Médico dentista com mais de 15 anos de experiência em clínica geral e estética dentária. Focado no conforto do paciente e nas técnicas mais recentes.',
    previousPatient: true,
    plan: 'premium',
  },
  {
    id: '2',
    name: 'Dr. Alexandre Bernardo',
    avatar: 'alexandre',
    rating: 4.8,
    reviewCount: 95,
    level: 'ouro',
    specialties: ['Generalista', 'Ortodontia', 'Multidisciplinar'],
    distance: 2.5,
    clinics: [{ id: '1', name: 'Clínica SmileCheck', address: 'Rua Augusta 123, Lisboa', distance: 2.5 }],
    nextAvailable: 'Hoje, 17:00',
    teleconsultaPrice: 25,
    bio: 'Especialista multidisciplinar com formação em ortodontia e implantologia. Atende todas as áreas da medicina dentária com excelência.',
    previousPatient: true,
    plan: 'premium',
  },
  {
    id: '3',
    name: 'Dr. Gil Santos',
    avatar: 'gil',
    rating: 4.7,
    reviewCount: 82,
    level: 'prata',
    specialties: ['Generalista'],
    distance: 2.5,
    clinics: [{ id: '1', name: 'Clínica SmileCheck', address: 'Rua Augusta 123, Lisboa', distance: 2.5 }],
    nextAvailable: 'Amanhã, 09:30',
    teleconsultaPrice: 18,
    bio: 'Dentista generalista dedicado à prevenção e tratamentos conservadores. Ambiente calmo e acolhedor.',
    previousPatient: false,
    plan: 'pro',
  },
  {
    id: '4',
    name: 'Dr. Frederico Cardoso',
    rating: 4.6,
    reviewCount: 68,
    level: 'prata',
    specialties: ['Cirurgia', 'Prótese'],
    distance: 4.2,
    clinics: [{ id: '2', name: 'Clínica Mitry-Mory', address: 'Avenue de la République 45, Mitry-Mory', distance: 4.2 }],
    nextAvailable: 'Amanhã, 10:00',
    teleconsultaPrice: 22,
    bio: 'Cirurgião oral especializado em extrações complexas e reabilitação protética. Formação avançada em cirurgia minimamente invasiva.',
    previousPatient: false,
    plan: 'pro',
  },
  {
    id: '5',
    name: 'Dr. Duarte Pereira',
    rating: 4.5,
    reviewCount: 54,
    level: 'bronze',
    specialties: ['Endodontia'],
    distance: 4.2,
    clinics: [{ id: '2', name: 'Clínica Mitry-Mory', address: 'Avenue de la République 45, Mitry-Mory', distance: 4.2 }],
    nextAvailable: 'Amanhã, 14:00',
    teleconsultaPrice: 20,
    bio: 'Endodontista com vasta experiência em tratamentos de canal e retratamentos. Utiliza microscopia operatória para máxima precisão.',
    previousPatient: false,
    plan: 'free',
  },
  {
    id: '6',
    name: 'Dr. Fábio Lobo',
    rating: 4.8,
    reviewCount: 73,
    level: 'prata',
    specialties: ['Cirurgia', 'Prótese', 'Implantologia'],
    distance: 6.0,
    clinics: [{ id: '3', name: 'Clínica Montfermeil', address: 'Rue de Paris 78, Montfermeil', distance: 6.0 }],
    nextAvailable: 'Qua, 11:00',
    teleconsultaPrice: 25,
    bio: 'Especialista em implantes dentários e reabilitação oral completa. Mais de 2000 implantes colocados com sucesso.',
    previousPatient: false,
    plan: 'premium',
  },
  {
    id: '7',
    name: 'Dra. Catarina Fernandes',
    rating: 4.9,
    reviewCount: 110,
    level: 'ouro',
    specialties: ['Ortodontia'],
    distance: 6.0,
    clinics: [{ id: '3', name: 'Clínica Montfermeil', address: 'Rue de Paris 78, Montfermeil', distance: 6.0 }],
    nextAvailable: 'Qua, 09:00',
    teleconsultaPrice: 30,
    bio: 'Ortodontista com especialização em alinhadores invisíveis e ortodontia lingual. Apaixonada por criar sorrisos perfeitos.',
    previousPatient: false,
    plan: 'pro',
  },
];

export const MOCK_REVIEWS: Record<string, DentistReview[]> = {
  '1': [
    { id: 'r1', patientName: 'Ana M.', rating: 5, date: '2025-01-28', comment: 'Excelente profissional! Muito atencioso e explicou tudo com calma.' },
    { id: 'r2', patientName: 'Carlos S.', rating: 5, date: '2025-01-25', comment: 'A melhor experiência que tive num dentista. Recomendo!' },
    { id: 'r3', patientName: 'Maria L.', rating: 4, date: '2025-01-20', comment: 'Muito bom, só tive que esperar um pouco.' },
    { id: 'r4', patientName: 'João P.', rating: 5, date: '2025-01-15', comment: 'Tratamento indolor, fantástico.' },
    { id: 'r5', patientName: 'Sofia R.', rating: 5, date: '2025-01-10', comment: 'Profissional de confiança.' },
    { id: 'r1-6', patientName: 'Helena N.', rating: 5, date: '2025-01-05', comment: 'Branqueamento ficou impecável e sem qualquer sensibilidade. Voltarei sem dúvida.' },
    { id: 'r1-7', patientName: 'Bruno P.', rating: 4, date: '2024-12-28', comment: 'Bom atendimento e explicações claras. A clínica podia ter mais estacionamento.' },
    { id: 'r1-8', patientName: 'Inês C.', rating: 5, date: '2024-12-18', comment: 'Sempre pontual e muito cuidadoso. Já levei toda a família.' },
    { id: 'r1-9', patientName: 'Tiago M.', rating: 5, date: '2024-12-04', comment: 'Resolveu uma urgência minha num sábado. Profissional 5 estrelas.' },
    { id: 'r1-10', patientName: 'Diana C.', rating: 4, date: '2024-11-22', comment: 'Muito simpático e competente. Preço justo pelo serviço.' },
    { id: 'r1-11', patientName: 'André G.', rating: 5, date: '2024-11-08', comment: 'A teleconsulta foi extremamente útil para tirar dúvidas pós-cirurgia.' },
    { id: 'r1-12', patientName: 'Rita O.', rating: 3, date: '2024-10-25', comment: 'Bom dentista, mas demorou mais do que o esperado a chamar-me.' },
  ],
  '2': [
    { id: 'r6', patientName: 'Pedro A.', rating: 5, date: '2025-01-27', comment: 'Muito competente e simpático.' },
    { id: 'r7', patientName: 'Rita F.', rating: 5, date: '2025-01-22', comment: 'Fez o meu aparelho e ficou perfeito!' },
    { id: 'r8', patientName: 'Bruno M.', rating: 4, date: '2025-01-18', comment: 'Bom profissional, clínica muito moderna.' },
    { id: 'r9', patientName: 'Inês C.', rating: 5, date: '2025-01-12', comment: 'Resolveu o meu problema rapidamente.' },
    { id: 'r10', patientName: 'Tiago N.', rating: 5, date: '2025-01-08', comment: 'Recomendo sem hesitar.' },
  ],
};

// Default reviews for dentists without specific reviews
const defaultReviews: DentistReview[] = [
  { id: 'dr1', patientName: 'Paciente A.', rating: 5, date: '2025-01-26', comment: 'Muito profissional e atencioso.' },
  { id: 'dr2', patientName: 'Paciente B.', rating: 4, date: '2025-01-20', comment: 'Boa experiência geral.' },
  { id: 'dr3', patientName: 'Paciente C.', rating: 5, date: '2025-01-15', comment: 'Recomendo este dentista.' },
];

export function getReviewsForDentist(dentistId: string): DentistReview[] {
  return MOCK_REVIEWS[dentistId] || defaultReviews;
}

// Deterministic availability based on dentist ID (seeded)
const AVAILABILITY_MAP: Record<string, string[][]> = {
  '1': [['09:00', '14:30', '15:00'], ['10:00', '11:00'], ['09:30', '14:00', '16:00'], ['10:00', '15:30'], ['09:00', '11:00', '14:30'], ['10:00'], ['18:00', '19:00']],
  '2': [['09:30', '14:00', '17:00'], ['09:00', '10:30'], ['11:00', '14:30', '16:30'], ['09:00', '15:00'], ['10:30', '14:00'], ['11:00'], ['17:00', '19:30']],
  '3': [['10:00', '15:00'], ['09:30', '11:00', '14:00'], ['09:00', '16:00'], ['10:30', '14:30'], ['09:00', '15:30', '17:00'], ['09:30'], ['18:30']],
  '4': [['09:00', '10:30', '14:00'], ['11:00', '15:00'], ['09:30', '14:30'], ['10:00', '16:00'], ['09:00', '14:00', '15:30'], ['10:30'], ['17:30', '19:00']],
  '5': [['10:00', '14:30'], ['09:00', '11:00', '15:00'], ['10:30', '16:00'], ['09:30', '14:00'], ['10:00', '15:00', '17:00'], ['09:00'], ['18:00']],
  '6': [['09:30', '11:00', '15:00'], ['10:00', '14:30'], ['09:00', '15:30', '17:00'], ['10:30', '14:00'], ['09:30', '16:00'], ['11:00'], ['17:00', '19:00']],
  '7': [['09:00', '10:30', '14:00'], ['11:00', '14:30', '16:00'], ['09:30', '15:00'], ['10:00', '17:00'], ['09:00', '14:30', '15:30'], ['10:00'], ['18:00', '19:30']],
};

export function getAvailabilityForDentist(dentistId: string): DentistAvailability[] {
  const days: Array<{ key: string; label: string }> = [
    { key: 'today', label: 'Hoje' },
    { key: 'tomorrow', label: 'Amanhã' },
    { key: 'wed', label: 'Qua' },
    { key: 'thu', label: 'Qui' },
    { key: 'fri', label: 'Sex' },
    { key: 'sat', label: 'Sáb' },
    { key: 'sun', label: 'Dom' },
  ];
  const dentistSlots = AVAILABILITY_MAP[dentistId] || AVAILABILITY_MAP['1'];
  return days.map((day, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const isSunday = day.key === 'sun';
    // Sunday: only teleconsulta slots (evening times)
    const slots = isSunday
      ? (dentistSlots[i] || []).filter(s => s >= '17:00')
      : (dentistSlots[i] || []);
    return {
      date: date.toISOString().split('T')[0],
      dayKey: day.key,
      dayLabel: day.label,
      slots,
    };
  });
}

export const SPECIALTIES = [
  'Todas',
  'Generalista',
  'Ortodontia',
  'Implantologia',
  'Cirurgia',
  'Endodontia',
  'Prótese',
  'Estética Dentária',
  'Multidisciplinar',
];

export const DISTANCE_FILTERS = [
  { label: 'Todos', value: 0 },
  { label: 'Até 5km', value: 5 },
  { label: 'Até 10km', value: 10 },
  { label: 'Até 20km', value: 20 },
];

export interface AvailabilityFilter {
  /** Stable identifier used for filter state and equality checks. */
  key: string;
  /** i18next key that resolves to the displayed label. */
  labelKey: string;
}

export const AVAILABILITY_FILTERS: AvailabilityFilter[] = [
  { key: 'any', labelKey: 'search.anyDay' },
  { key: 'today', labelKey: 'common.today' },
  { key: 'tomorrow', labelKey: 'common.tomorrow' },
  { key: 'thisWeek', labelKey: 'export.thisWeek' },
];

export const SORT_OPTIONS = [
  { label: 'Recomendados', value: 'recommended' },
  { label: 'Distância', value: 'distance' },
  { label: 'Rating', value: 'rating' },
  { label: 'Preço', value: 'price' },
];

export const LEVEL_CONFIG: Record<string, { labelKey: string; label: string; color: string; bg: string }> = {
  lata: { labelKey: 'onboarding.levels.tin', label: 'Lata', color: 'text-slate-400', bg: 'bg-slate-400/15 border-slate-400/30' },
  bronze: { labelKey: 'onboarding.levels.bronze', label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/15 border-orange-400/30' },
  prata: { labelKey: 'onboarding.levels.silver', label: 'Prata', color: 'text-slate-300', bg: 'bg-slate-300/15 border-slate-300/30' },
  ouro: { labelKey: 'onboarding.levels.gold', label: 'Ouro', color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/30' },
  platina: { labelKey: 'onboarding.levels.platinum', label: 'Platina', color: 'text-purple-400', bg: 'bg-purple-400/15 border-purple-400/30' },
  diamante: { labelKey: 'onboarding.levels.diamond', label: 'Diamante', color: 'text-blue-400', bg: 'bg-blue-400/15 border-blue-400/30' },
  adamantino: { labelKey: 'onboarding.levels.adamantine', label: 'Adamantino', color: 'text-red-400', bg: 'bg-red-400/15 border-red-400/30' },
};

export const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  premium: { label: 'Premium', color: 'text-amber-300', bg: 'bg-amber-300/15 border-amber-300/30' },
  pro: { label: 'Pro', color: 'text-blue-400', bg: 'bg-blue-400/15 border-blue-400/30' },
  free: { label: 'Free', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
};
