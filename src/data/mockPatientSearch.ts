export interface PatientSearchResult {
  id: string;
  name: string;
  age: number;
  level: 'lata' | 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante' | 'adamantino';
  rating: number | null;
  reviewCount: number;
  totalConsultations: number;
  lastConsultationDate: string; // pretty PT
  lastConsultationType: string;
  clinicName: string;
  primaryDentistId?: string;
  primaryDentistName?: string;
  status: 'active' | 'new' | 'inactive';
  alerts?: string[];
}

export const MOCK_PATIENT_RESULTS: PatientSearchResult[] = [
  {
    id: 'pat-1', name: 'João Silva', age: 45, level: 'ouro', rating: 4.7, reviewCount: 8,
    totalConsultations: 23, lastConsultationDate: '28 Jan 2026', lastConsultationType: 'Destartarização',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd1', primaryDentistName: 'Dr. Gonçalo Pipo',
    status: 'active', alerts: ['Penicilina', 'Látex'],
  },
  {
    id: 'pat-2', name: 'Maria Silva', age: 42, level: 'prata', rating: 4.5, reviewCount: 5,
    totalConsultations: 15, lastConsultationDate: '15 Jan 2026', lastConsultationType: 'Consulta de rotina',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd1', primaryDentistName: 'Dr. Gonçalo Pipo',
    status: 'active',
  },
  {
    id: 'pat-3', name: 'Pedro Almeida', age: 34, level: 'bronze', rating: 4.8, reviewCount: 3,
    totalConsultations: 5, lastConsultationDate: '31 Jan 2026', lastConsultationType: 'Endodontia',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd2', primaryDentistName: 'Dr. Alexandre Bernardo',
    status: 'new',
  },
  {
    id: 'pat-4', name: 'Ana Ferreira', age: 51, level: 'prata', rating: 4.2, reviewCount: 6,
    totalConsultations: 18, lastConsultationDate: '31 Jan 2026', lastConsultationType: 'Implante',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd3', primaryDentistName: 'Dr. Gil Santos',
    status: 'active', alerts: ['Diabetes'],
  },
  {
    id: 'pat-5', name: 'Carlos Santos', age: 39, level: 'ouro', rating: 4.9, reviewCount: 12,
    totalConsultations: 30, lastConsultationDate: '31 Jan 2026', lastConsultationType: 'Branqueamento',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd1', primaryDentistName: 'Dr. Gonçalo Pipo',
    status: 'active',
  },
  {
    id: 'pat-6', name: 'Rita Oliveira', age: 45, level: 'bronze', rating: 4.6, reviewCount: 4,
    totalConsultations: 8, lastConsultationDate: '20 Jan 2026', lastConsultationType: 'Ortodontia',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd2', primaryDentistName: 'Dr. Alexandre Bernardo',
    status: 'active',
  },
  {
    id: 'pat-7', name: 'Sofia Rodrigues', age: 27, level: 'lata', rating: null, reviewCount: 0,
    totalConsultations: 1, lastConsultationDate: '10 Jan 2026', lastConsultationType: 'Primeira consulta',
    clinicName: 'Clínica SmileCheck', primaryDentistId: 'd3', primaryDentistName: 'Dr. Gil Santos',
    status: 'new',
  },
];

export const CLINIC_DENTIST_FILTER = [
  { id: 'all', name: 'Todos' },
  { id: 'd1', name: 'Dr. Gonçalo Pipo' },
  { id: 'd2', name: 'Dr. Alexandre Bernardo' },
  { id: 'd3', name: 'Dr. Gil Santos' },
];
