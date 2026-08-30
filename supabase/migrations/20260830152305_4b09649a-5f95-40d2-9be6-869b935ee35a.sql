-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('patient','dentist','clinic');
CREATE TYPE public.app_language AS ENUM ('pt','fr','en');
CREATE TYPE public.consultation_type AS ENUM ('primeira_consulta','destartarizacao','cirurgia','endodontia','odontopediatria','ortodontia','protese','restauracao','urgencia','teleconsulta','avaliacao');
CREATE TYPE public.appointment_status AS ENUM ('agendada','confirmada','em_sala_de_espera','em_consulta','concluida','cancelada','falta','visto');
CREATE TYPE public.payment_status AS ENUM ('a_pagar','pago','nao_aplicavel');
CREATE TYPE public.waiting_urgency AS ENUM ('normal','urgente');
CREATE TYPE public.waiting_status AS ENUM ('em_espera','notificado','confirmado');
CREATE TYPE public.points_type AS ENUM ('xp','reward_points');
CREATE TYPE public.level_tier AS ENUM ('Lata','Bronze','Prata','Ouro','Platina','Diamante','Adamantino');

-- ============ SHARED updated_at TRIGGER FN ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'patient',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  date_of_birth date,
  language public.app_language NOT NULL DEFAULT 'pt',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- helper functions (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.current_role_is(_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = _role);
$$;

-- ============ CLINICS ============
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  hds_certified boolean NOT NULL DEFAULT false,
  opening_hour time,
  closing_hour time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CLINIC MEMBERS ============
CREATE TABLE public.clinic_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_clinic text,
  working_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, dentist_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_members TO authenticated;
GRANT ALL ON public.clinic_members TO service_role;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER clinic_members_updated_at BEFORE UPDATE ON public.clinic_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_clinic(_clinic_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.clinics c WHERE c.id = _clinic_id AND c.owner_profile_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_clinic_member(_clinic_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.clinic_members m WHERE m.clinic_id = _clinic_id AND m.dentist_id = auth.uid());
$$;

-- ============ PATIENTS ============
CREATE TABLE public.patients (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  allergies jsonb NOT NULL DEFAULT '[]'::jsonb,
  medical_notes text,
  fear_level integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FAMILY MEMBERS ============
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  relationship text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DENTISTS ============
CREATE TABLE public.dentists (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  rpps_number text,
  specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
  bio text,
  rating numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dentists TO authenticated;
GRANT ALL ON public.dentists TO service_role;
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER dentists_updated_at BEFORE UPDATE ON public.dentists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dentist_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  consultation_type public.consultation_type NOT NULL DEFAULT 'primeira_consulta',
  status public.appointment_status NOT NULL DEFAULT 'agendada',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  notes text,
  observation text,
  is_teleconsultation boolean NOT NULL DEFAULT false,
  payment_status public.payment_status NOT NULL DEFAULT 'a_pagar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_patient_idx ON public.appointments(patient_id);
CREATE INDEX appointments_dentist_idx ON public.appointments(dentist_id);
CREATE INDEX appointments_clinic_idx ON public.appointments(clinic_id);
CREATE INDEX appointments_scheduled_idx ON public.appointments(scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WAITING LIST ============
CREATE TABLE public.waiting_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dentist_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  consultation_type public.consultation_type NOT NULL DEFAULT 'primeira_consulta',
  preferred_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  generic_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  urgency public.waiting_urgency NOT NULL DEFAULT 'normal',
  observation text,
  status public.waiting_status NOT NULL DEFAULT 'em_espera',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiting_list TO authenticated;
GRANT ALL ON public.waiting_list TO service_role;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER waiting_list_updated_at BEFORE UPDATE ON public.waiting_list FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ POINTS LEDGER ============
CREATE TABLE public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.points_type NOT NULL,
  amount integer NOT NULL,
  reason text,
  multiplier_applied numeric(4,2) NOT NULL DEFAULT 1,
  related_appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX points_ledger_profile_idx ON public.points_ledger(profile_id);
GRANT SELECT ON public.points_ledger TO authenticated;
GRANT ALL ON public.points_ledger TO service_role;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- ============ USER LEVELS ============
CREATE TABLE public.user_levels (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_xp integer NOT NULL DEFAULT 0,
  current_reward_points integer NOT NULL DEFAULT 0,
  level public.level_tier NOT NULL DEFAULT 'Lata',
  streak_days integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_levels TO authenticated;
GRANT ALL ON public.user_levels TO service_role;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER user_levels_updated_at BEFORE UPDATE ON public.user_levels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ACHIEVEMENTS ============
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  unlocked boolean NOT NULL DEFAULT false,
  progress integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 1,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, achievement_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FEEDBACK ============
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  from_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_profile_idx ON public.notifications(profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ POLICIES ============
-- profiles
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Professional profiles readable" ON public.profiles FOR SELECT TO authenticated USING (role IN ('dentist','clinic'));
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- clinics
CREATE POLICY "Clinics readable" ON public.clinics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clinic owner creates clinic" ON public.clinics FOR INSERT TO authenticated WITH CHECK (owner_profile_id = auth.uid());
CREATE POLICY "Clinic owner updates clinic" ON public.clinics FOR UPDATE TO authenticated USING (owner_profile_id = auth.uid()) WITH CHECK (owner_profile_id = auth.uid());
CREATE POLICY "Clinic owner deletes clinic" ON public.clinics FOR DELETE TO authenticated USING (owner_profile_id = auth.uid());

-- clinic_members
CREATE POLICY "Members visible to clinic and dentist" ON public.clinic_members FOR SELECT TO authenticated
  USING (dentist_id = auth.uid() OR public.owns_clinic(clinic_id));
CREATE POLICY "Clinic owner manages members" ON public.clinic_members FOR INSERT TO authenticated WITH CHECK (public.owns_clinic(clinic_id));
CREATE POLICY "Clinic owner or dentist updates member" ON public.clinic_members FOR UPDATE TO authenticated
  USING (public.owns_clinic(clinic_id) OR dentist_id = auth.uid())
  WITH CHECK (public.owns_clinic(clinic_id) OR dentist_id = auth.uid());
CREATE POLICY "Clinic owner or dentist removes member" ON public.clinic_members FOR DELETE TO authenticated
  USING (public.owns_clinic(clinic_id) OR dentist_id = auth.uid());

-- patients
CREATE POLICY "Patient reads own record" ON public.patients FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments a WHERE a.patient_id = patients.id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id))));
CREATE POLICY "Patient inserts own record" ON public.patients FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Patient or treating professional updates record" ON public.patients FOR UPDATE TO authenticated
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments a WHERE a.patient_id = patients.id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id))))
  WITH CHECK (true);
CREATE POLICY "Patient deletes own record" ON public.patients FOR DELETE TO authenticated USING (id = auth.uid());

-- family_members
CREATE POLICY "Family visible to primary patient" ON public.family_members FOR SELECT TO authenticated
  USING (primary_patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments a WHERE a.family_member_id = family_members.id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id))));
CREATE POLICY "Primary patient manages family insert" ON public.family_members FOR INSERT TO authenticated WITH CHECK (primary_patient_id = auth.uid());
CREATE POLICY "Primary patient manages family update" ON public.family_members FOR UPDATE TO authenticated USING (primary_patient_id = auth.uid()) WITH CHECK (primary_patient_id = auth.uid());
CREATE POLICY "Primary patient manages family delete" ON public.family_members FOR DELETE TO authenticated USING (primary_patient_id = auth.uid());

-- dentists
CREATE POLICY "Dentist profiles readable" ON public.dentists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dentist inserts own record" ON public.dentists FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Dentist updates own record" ON public.dentists FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Dentist deletes own record" ON public.dentists FOR DELETE TO authenticated USING (id = auth.uid());

-- appointments
CREATE POLICY "Appointment parties read" ON public.appointments FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id) OR public.is_clinic_member(clinic_id));
CREATE POLICY "Appointment create" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));
CREATE POLICY "Appointment update" ON public.appointments FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id))
  WITH CHECK (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));
CREATE POLICY "Appointment delete" ON public.appointments FOR DELETE TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));

-- waiting_list
CREATE POLICY "Waiting list parties read" ON public.waiting_list FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id) OR public.is_clinic_member(clinic_id));
CREATE POLICY "Waiting list create" ON public.waiting_list FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));
CREATE POLICY "Waiting list update" ON public.waiting_list FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id))
  WITH CHECK (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));
CREATE POLICY "Waiting list delete" ON public.waiting_list FOR DELETE TO authenticated
  USING (patient_id = auth.uid() OR dentist_id = auth.uid() OR public.owns_clinic(clinic_id));

-- points_ledger (read own only; writes via service role)
CREATE POLICY "Own points readable" ON public.points_ledger FOR SELECT TO authenticated USING (profile_id = auth.uid());

-- user_levels
CREATE POLICY "Levels readable" ON public.user_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own level insert" ON public.user_levels FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own level update" ON public.user_levels FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- achievements
CREATE POLICY "Own achievements read" ON public.achievements FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Own achievements insert" ON public.achievements FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Own achievements update" ON public.achievements FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Own achievements delete" ON public.achievements FOR DELETE TO authenticated USING (profile_id = auth.uid());

-- feedback
CREATE POLICY "Feedback parties read" ON public.feedback FOR SELECT TO authenticated
  USING (from_profile_id = auth.uid() OR to_profile_id = auth.uid());
CREATE POLICY "Feedback author creates" ON public.feedback FOR INSERT TO authenticated WITH CHECK (from_profile_id = auth.uid());
CREATE POLICY "Feedback author updates" ON public.feedback FOR UPDATE TO authenticated USING (from_profile_id = auth.uid()) WITH CHECK (from_profile_id = auth.uid());
CREATE POLICY "Feedback author deletes" ON public.feedback FOR DELETE TO authenticated USING (from_profile_id = auth.uid());

-- notifications
CREATE POLICY "Own notifications read" ON public.notifications FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Own notifications insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (profile_id = auth.uid());
