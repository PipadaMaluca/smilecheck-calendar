DROP POLICY IF EXISTS "Waiting list update" ON public.waiting_list;
DROP POLICY IF EXISTS "Waiting list delete" ON public.waiting_list;
DROP POLICY IF EXISTS "Waiting list patient or provider update" ON public.waiting_list;
DROP POLICY IF EXISTS "Waiting list patient or provider delete" ON public.waiting_list;

CREATE POLICY "Waiting list manage update"
ON public.waiting_list
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

CREATE POLICY "Waiting list manage delete"
ON public.waiting_list
FOR DELETE
TO authenticated
USING (
  patient_id = auth.uid()
  OR dentist_id = auth.uid()
  OR public.owns_clinic(clinic_id)
  OR public.is_clinic_member(clinic_id)
);