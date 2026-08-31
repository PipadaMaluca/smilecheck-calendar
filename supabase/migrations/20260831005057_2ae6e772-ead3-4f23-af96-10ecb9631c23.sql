DROP POLICY IF EXISTS "Appointment create" ON public.appointments;
DROP POLICY IF EXISTS "Appointment update" ON public.appointments;
DROP POLICY IF EXISTS "Appointment delete" ON public.appointments;

CREATE POLICY "Appointment create"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = auth.uid()
  OR dentist_id = auth.uid()
  OR public.owns_clinic(clinic_id)
  OR public.is_clinic_member(clinic_id)
);

CREATE POLICY "Appointment update"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  patient_id = auth.uid()
  OR dentist_id = auth.uid()
  OR public.owns_clinic(clinic_id)
  OR public.is_clinic_member(clinic_id)
)
WITH CHECK (
  patient_id = auth.uid()
  OR dentist_id = auth.uid()
  OR public.owns_clinic(clinic_id)
  OR public.is_clinic_member(clinic_id)
);

CREATE POLICY "Appointment delete"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  patient_id = auth.uid()
  OR dentist_id = auth.uid()
  OR public.owns_clinic(clinic_id)
  OR public.is_clinic_member(clinic_id)
);