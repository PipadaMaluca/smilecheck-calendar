-- 1) Missing FK indexes
CREATE INDEX IF NOT EXISTS idx_appointments_family_member_id ON public.appointments(family_member_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_dentist_id ON public.clinic_members(dentist_id);
CREATE INDEX IF NOT EXISTS idx_clinics_owner_profile_id ON public.clinics(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_family_members_primary_patient_id ON public.family_members(primary_patient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_from_profile_id ON public.feedback(from_profile_id);
CREATE INDEX IF NOT EXISTS idx_feedback_to_profile_id ON public.feedback(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_related_appointment_id ON public.points_ledger(related_appointment_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_clinic_id ON public.waiting_list(clinic_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_dentist_id ON public.waiting_list(dentist_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_patient_id ON public.waiting_list(patient_id);

-- 2) Privacy: professional profiles no longer fully readable by every user
DROP POLICY IF EXISTS "Approved professional profiles readable" ON public.profiles;
CREATE POLICY "Clinic reads member dentist profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    role = 'dentist'::app_role AND EXISTS (
      SELECT 1 FROM public.clinic_members m
      WHERE m.dentist_id = profiles.id AND public.owns_clinic(m.clinic_id)
    )
  );

-- Public-safe projection of approved professionals (no phone, email, birth date)
CREATE OR REPLACE VIEW public.professional_public_profiles
WITH (security_barrier = true) AS
SELECT p.id, p.full_name, p.avatar_url, p.role, p.language
FROM public.profiles p
WHERE (p.role = 'dentist'::app_role AND EXISTS (
         SELECT 1 FROM public.dentists d WHERE d.id = p.id AND d.verification_status = 'aprovado'::verification_status))
   OR (p.role = 'clinic'::app_role AND EXISTS (
         SELECT 1 FROM public.clinics c WHERE c.owner_profile_id = p.id AND c.verification_status = 'aprovado'::verification_status));
REVOKE ALL ON public.professional_public_profiles FROM anon, public;
GRANT SELECT ON public.professional_public_profiles TO authenticated;
GRANT SELECT ON public.professional_public_profiles TO service_role;

-- 3) RLS perf: evaluate auth.uid() once per query, same logic
DO $$
DECLARE r record; q text; c text; stmt text;
BEGIN
  FOR r IN SELECT tablename, policyname, qual, with_check FROM pg_policies WHERE schemaname = 'public' LOOP
    q := r.qual; c := r.with_check;
    IF (q IS NOT NULL AND q ~ 'auth\.uid\(\)' AND q !~ 'SELECT auth\.uid\(\)')
       OR (c IS NOT NULL AND c ~ 'auth\.uid\(\)' AND c !~ 'SELECT auth\.uid\(\)') THEN
      stmt := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
      IF q IS NOT NULL THEN stmt := stmt || ' USING (' || replace(q, 'auth.uid()', '(SELECT auth.uid())') || ')'; END IF;
      IF c IS NOT NULL THEN stmt := stmt || ' WITH CHECK (' || replace(c, 'auth.uid()', '(SELECT auth.uid())') || ')'; END IF;
      EXECUTE stmt;
    END IF;
  END LOOP;
END $$;

-- 4) Rolling demo window for SEED appointments only (both parties @seed.smilecheck.app)
CREATE OR REPLACE FUNCTION public.refresh_seed_appointments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the scheduler / backend roles may run this.
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- Move seed appointments older than 14 days forward 4 weeks (weekday preserved, so the Sunday rule holds).
  WITH seed AS (
    SELECT a.id FROM appointments a
    JOIN profiles p ON p.id = a.patient_id
    JOIN profiles d ON d.id = a.dentist_id
    WHERE p.email LIKE '%@seed.smilecheck.app' AND d.email LIKE '%@seed.smilecheck.app'
  )
  UPDATE appointments a
     SET scheduled_at = a.scheduled_at + interval '28 days'
    FROM seed
   WHERE a.id = seed.id AND a.scheduled_at < now() - interval '14 days';

  -- Statuses coherent with time: past → visto/falta/cancelada, future → agendada/confirmada.
  WITH seed AS (
    SELECT a.id FROM appointments a
    JOIN profiles p ON p.id = a.patient_id
    JOIN profiles d ON d.id = a.dentist_id
    WHERE p.email LIKE '%@seed.smilecheck.app' AND d.email LIKE '%@seed.smilecheck.app'
  )
  UPDATE appointments a
     SET status = CASE
       WHEN a.scheduled_at + make_interval(mins => a.duration_minutes) <= now() THEN
         CASE abs(hashtext(a.id::text)) % 10 WHEN 0 THEN 'falta'::appointment_status WHEN 1 THEN 'cancelada'::appointment_status ELSE 'visto'::appointment_status END
       WHEN a.scheduled_at <= now() THEN 'em_consulta'::appointment_status
       ELSE CASE abs(hashtext(a.id::text)) % 4 WHEN 0 THEN 'agendada'::appointment_status ELSE 'confirmada'::appointment_status END
     END
    FROM seed
   WHERE a.id = seed.id;
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_seed_appointments() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_seed_appointments() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;