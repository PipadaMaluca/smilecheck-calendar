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
  dayLabel: string;
  slots: string[];
}

export const MOCK_DENTIST_RESULTS: DentistSearchResult[] = [
  {
    id: '1',
    name: 'Dr. Gonçalo Pipo',
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

export function getAvailabilityForDentist(_dentistId: string): DentistAvailability[] {
  const days = ['Hoje', 'Amanhã', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return days.map((dayLabel, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const slotsCount = Math.floor(Math.random() * 4) + 1;
    const possibleSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '17:00'];
    const slots = possibleSlots.sort(() => Math.random() - 0.5).slice(0, slotsCount).sort();
    return {
      date: date.toISOString().split('T')[0],
      dayLabel,
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

export const AVAILABILITY_FILTERS = ['Qualquer Dia', 'Hoje', 'Amanhã', 'Esta Semana'];

export const SORT_OPTIONS = [
  { label: 'Recomendados', value: 'recommended' },
  { label: 'Distância', value: 'distance' },
  { label: 'Rating', value: 'rating' },
  { label: 'Preço', value: 'price' },
];

export const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ouro: { label: 'Ouro', color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/30' },
  prata: { label: 'Prata', color: 'text-slate-300', bg: 'bg-slate-300/15 border-slate-300/30' },
  bronze: { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/15 border-orange-400/30' },
};
