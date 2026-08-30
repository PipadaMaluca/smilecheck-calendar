CREATE OR REPLACE FUNCTION public.treats_patient(_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_id = _patient_id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
  ) OR EXISTS (
    SELECT 1 FROM public.waiting_list w
    WHERE w.patient_id = _patient_id
      AND (w.dentist_id = auth.uid() OR public.owns_clinic(w.clinic_id) OR public.is_clinic_member(w.clinic_id))
  );
$$;

DROP POLICY IF EXISTS "Own notifications insert" ON public.notifications;

CREATE POLICY "Notifications insert for self or treated patient"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid() OR public.treats_patient(profile_id));