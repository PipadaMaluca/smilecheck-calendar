DROP POLICY IF EXISTS "Notifications create" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insert own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications owner create" ON public.notifications;

CREATE POLICY "Notifications create for self or treated patient"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid()
  OR public.treats_patient(profile_id)
  OR EXISTS (
    SELECT 1 FROM public.waiting_list w
    WHERE w.patient_id = notifications.profile_id
      AND (w.dentist_id = auth.uid() OR public.owns_clinic(w.clinic_id) OR public.is_clinic_member(w.clinic_id))
  )
);