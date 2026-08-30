CREATE POLICY "Treating professionals read patient profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  role = 'patient'::app_role AND EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_id = profiles.id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
  )
);

DROP POLICY "Patient reads own record" ON public.patients;
CREATE POLICY "Patient or treating professional reads record"
ON public.patients FOR SELECT TO authenticated
USING (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_id = patients.id
      AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
  )
);