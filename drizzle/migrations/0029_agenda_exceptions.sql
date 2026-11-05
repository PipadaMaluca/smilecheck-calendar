CREATE TABLE public.agenda_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'ausencia' CHECK (kind IN ('ausencia','abertura')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  full_day boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '' CHECK (length(reason) <= 120),
  note text CHECK (note IS NULL OR length(note) <= 1000),
  color text CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (ends_at - starts_at <= interval '366 days')
);
CREATE INDEX agenda_exceptions_dentist_idx ON public.agenda_exceptions (dentist_id, starts_at);
CREATE INDEX agenda_exceptions_clinic_idx ON public.agenda_exceptions (clinic_id);
CREATE INDEX agenda_exceptions_created_by_idx ON public.agenda_exceptions (created_by);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_exceptions TO authenticated;
GRANT ALL ON public.agenda_exceptions TO service_role;
ALTER TABLE public.agenda_exceptions ENABLE ROW LEVEL SECURITY;

-- Read: the dentist, and professionals/owner of the clinic the exception belongs to.
CREATE POLICY "agenda_exceptions read" ON public.agenda_exceptions FOR SELECT TO authenticated
  USING (dentist_id = (SELECT auth.uid()) OR (clinic_id IS NOT NULL AND (public.is_professional_of_clinic(clinic_id) OR public.owns_clinic(clinic_id))));
-- Write: the dentist for himself (clinic must be one of his), or the clinic owner for a member dentist.
CREATE POLICY "agenda_exceptions insert" ON public.agenda_exceptions FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()) AND (
    (dentist_id = (SELECT auth.uid()) AND public.current_role_is('dentist') AND (clinic_id IS NULL OR public.is_professional_of_clinic(clinic_id)))
    OR (clinic_id IS NOT NULL AND public.owns_clinic(clinic_id) AND EXISTS (SELECT 1 FROM public.clinic_members m WHERE m.clinic_id = agenda_exceptions.clinic_id AND m.dentist_id = agenda_exceptions.dentist_id))));
CREATE POLICY "agenda_exceptions update" ON public.agenda_exceptions FOR UPDATE TO authenticated
  USING (dentist_id = (SELECT auth.uid()) OR (clinic_id IS NOT NULL AND public.owns_clinic(clinic_id)))
  WITH CHECK (dentist_id = (SELECT auth.uid()) OR (clinic_id IS NOT NULL AND public.owns_clinic(clinic_id)));
CREATE POLICY "agenda_exceptions delete" ON public.agenda_exceptions FOR DELETE TO authenticated
  USING (dentist_id = (SELECT auth.uid()) OR (clinic_id IS NOT NULL AND public.owns_clinic(clinic_id)));