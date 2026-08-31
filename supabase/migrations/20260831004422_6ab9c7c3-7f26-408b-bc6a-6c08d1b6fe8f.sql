CREATE OR REPLACE FUNCTION public.can_notify_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _profile_id = auth.uid()
     OR public.treats_patient(_profile_id)
     OR EXISTS (
       SELECT 1 FROM public.waiting_list w
        WHERE w.patient_id = _profile_id
          AND (w.dentist_id = auth.uid()
               OR public.owns_clinic(w.clinic_id)
               OR public.is_clinic_member(w.clinic_id))
     );
$$;

DROP POLICY IF EXISTS "Notifications create for self or treated patient" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insert for self or treated patient" ON public.notifications;

CREATE POLICY "Notifications create authorized"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.can_notify_profile(profile_id));