import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Consultation,
  ConsultationCategory,
  ConsultationStatus,
} from '@/types/calendar';
import {
  mockConsultations,
  mockPatientConsultations,
  mockClinics,
  mockDentists,
} from '@/data/mockData';
import { SEED_CLINIC_ID_BY_UUID, SEED_DENTIST_ID_BY_UUID } from '@/data/seedIds';

/**
 * Phase 3 · sub-step 1 — READ path only.
 * Demo mode keeps using the mock arrays; real authenticated users read the
 * appointments from the backend. Writes (create/edit/cancel) are untouched.
 */

const DB_TYPE_TO_CATEGORY: Record<string, ConsultationCategory> = {
  primeira_consulta: 'primeira_consulta',
  destartarizacao: 'destartarizacao',
  cirurgia: 'cirurgia',
  endodontia: 'endodontia',
  odontopediatria: 'odontopediatria',
  ortodontia: 'ortodontia',
  protese: 'protese',
  restauracao: 'restauracao',
  urgencia: 'urgencia',
  teleconsulta: 'teleconsulta',
  avaliacao: 'outro',
};

const DB_STATUS_TO_STATUS: Record<string, ConsultationStatus> = {
  agendada: 'agendada',
  confirmada: 'confirmada',
  em_sala_de_espera: 'em_sala_espera',
  em_consulta: 'em_consulta',
  concluida: 'visto',
  visto: 'visto',
  falta: 'falta_nao_justificada',
  cancelada: 'agendada',
};

const DB_LEVEL_TO_LABEL: Record<string, string> = {
  Lata: 'Lata',
  Bronze: 'Bronze',
  Prata: 'Silver',
  Ouro: 'Gold',
  Platina: 'Platinum',
  Diamante: 'Diamond',
  Adamantino: 'Diamond',
};

interface AppointmentRow {
  id: string;
  patient_id: string;
  dentist_id: string | null;
  clinic_id: string | null;
  consultation_type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  is_teleconsultation: boolean;
  payment_status: string;
  price: number | null;
}

interface PatientInfo {
  name: string;
  phone: string;
  dateOfBirth?: string;
  rating: number;
  level: string;
}

function ageFrom(dob?: string, reference = new Date(2026, 0, 31)) {
  if (!dob) return undefined;
  const [d, m, y] = dob.split('/').map(Number);
  let age = reference.getFullYear() - y;
  if (reference.getMonth() + 1 < m || (reference.getMonth() + 1 === m && reference.getDate() < d)) age -= 1;
  return age;
}

function toDisplayDob(iso: string | null) {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function mapRow(row: AppointmentRow, patients: Map<string, PatientInfo>): Consultation {
  const scheduled = new Date(row.scheduled_at);
  const time = `${String(scheduled.getUTCHours()).padStart(2, '0')}:${String(scheduled.getUTCMinutes()).padStart(2, '0')}`;
  const date = new Date(scheduled.getUTCFullYear(), scheduled.getUTCMonth(), scheduled.getUTCDate());

  const dentistMockId = row.dentist_id ? SEED_DENTIST_ID_BY_UUID[row.dentist_id] : undefined;
  const dentist = mockDentists.find((d) => d.id === dentistMockId) ?? {
    id: row.dentist_id ?? 'unknown',
    name: '—',
    specialty: 'Generalista',
    workingHours: '9h-21h',
  };

  const clinicMockId = row.clinic_id ? SEED_CLINIC_ID_BY_UUID[row.clinic_id] : undefined;
  const clinic = mockClinics.find((c) => c.id === clinicMockId) ?? {
    id: row.clinic_id ?? 'unknown',
    name: '—',
    address: '',
  };

  const patient = patients.get(row.patient_id);

  return {
    id: row.id,
    type: row.is_teleconsultation ? 'teleconsulta' : 'presencial',
    category: DB_TYPE_TO_CATEGORY[row.consultation_type] ?? 'outro',
    status: DB_STATUS_TO_STATUS[row.status] ?? 'agendada',
    date,
    time,
    duration: row.duration_minutes,
    patient: {
      id: row.patient_id,
      name: patient?.name ?? 'Paciente',
      phone: patient?.phone ?? '',
      rating: patient?.rating ?? 0,
      level: patient?.level ?? 'Lata',
      age: ageFrom(patient?.dateOfBirth),
      dateOfBirth: patient?.dateOfBirth,
    },
    dentist,
    clinic,
    price: row.price ?? 0,
    isPaid: row.payment_status === 'pago',
    notes: row.notes ?? undefined,
  };
}

async function fetchConsultations(): Promise<Consultation[]> {
  // RLS keeps this to the appointments the signed-in user is a party to
  // (own appointments, own agenda as dentist, or the clinic they own / belong to).
  const { data, error } = await supabase
    .from('appointments')
    .select(
      'id, patient_id, dentist_id, clinic_id, consultation_type, status, scheduled_at, duration_minutes, notes, is_teleconsultation, payment_status, price'
    )
    .order('scheduled_at', { ascending: true })
    .limit(1000)
    .returns<AppointmentRow[]>();

  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];

  const patientIds = [...new Set(rows.map((r) => r.patient_id))];
  const [profilesRes, patientsRes, levelsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, date_of_birth').in('id', patientIds),
    supabase.from('patients').select('id, rating').in('id', patientIds),
    supabase.from('user_levels').select('id, level').in('id', patientIds),
  ]);

  const ratings = new Map((patientsRes.data ?? []).map((p) => [p.id, Number(p.rating ?? 0)]));
  const levels = new Map((levelsRes.data ?? []).map((l) => [l.id, DB_LEVEL_TO_LABEL[l.level] ?? l.level]));
  const patients = new Map<string, PatientInfo>(
    (profilesRes.data ?? []).map((p) => [
      p.id,
      {
        name: p.full_name ?? 'Paciente',
        phone: p.phone ?? '',
        dateOfBirth: toDisplayDob(p.date_of_birth),
        rating: ratings.get(p.id) ?? 0,
        level: levels.get(p.id) ?? 'Lata',
      },
    ])
  );

  return rows.map((row) => mapRow(row, patients));
}

interface AgendaDataValue {
  consultations: Consultation[];
  patientConsultations: Consultation[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  refresh: () => void;
}

const AgendaDataContext = createContext<AgendaDataValue>({
  consultations: mockConsultations,
  patientConsultations: mockPatientConsultations,
  loading: false,
  error: null,
  isDemo: true,
  refresh: () => {},
});

export function AgendaDataProvider({ children }: { children: React.ReactNode }) {
  const { demoMode, user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (demoMode || !user) {
      setConsultations(mockConsultations);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchConsultations()
      .then((rows) => {
        if (cancelled) return;
        setConsultations(rows);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setConsultations([]);
        setError(e?.message ?? 'Erro ao carregar consultas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [demoMode, user, reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const value = useMemo<AgendaDataValue>(() => {
    const isDemo = demoMode || !user;
    return {
      consultations,
      // Patient dashboard/agenda mock source stays as-is in demo; real users see their own rows.
      patientConsultations: isDemo ? mockPatientConsultations : consultations,
      loading,
      error,
      isDemo,
      refresh,
    };
  }, [consultations, demoMode, user, loading, error, refresh]);

  return <AgendaDataContext.Provider value={value}>{children}</AgendaDataContext.Provider>;
}


export function useAgendaData(): AgendaDataValue {
  return useContext(AgendaDataContext);
}
