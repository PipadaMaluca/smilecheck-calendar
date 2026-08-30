-- 1. Data integrity: valid range, no self-rating, one rating per direction
ALTER TABLE public.feedback
  ADD CONSTRAINT feedback_rating_range CHECK (rating >= 1 AND rating <= 5),
  ADD CONSTRAINT feedback_no_self CHECK (from_profile_id <> to_profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS feedback_unique_direction
  ON public.feedback (appointment_id, from_profile_id, to_profile_id);

-- 2. Only real counterparties of an appointment may be rated
CREATE OR REPLACE FUNCTION public.can_rate_appointment(_appointment_id uuid, _to_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.appointments a
      LEFT JOIN public.clinics c ON c.id = a.clinic_id
     WHERE a.id = _appointment_id
       -- the caller took part in this appointment
       AND (a.patient_id = auth.uid() OR a.dentist_id = auth.uid()
            OR c.owner_profile_id = auth.uid() OR public.is_clinic_member(a.clinic_id))
       -- the recipient is another party of the same appointment
       AND _to_profile_id IN (a.patient_id, a.dentist_id, c.owner_profile_id)
  );
$$;

DROP POLICY IF EXISTS "Feedback author creates" ON public.feedback;
CREATE POLICY "Feedback author creates on own appointments"
  ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (
    from_profile_id = auth.uid()
    AND appointment_id IS NOT NULL
    AND public.can_rate_appointment(appointment_id, to_profile_id)
  );

DROP POLICY IF EXISTS "Feedback author updates" ON public.feedback;
CREATE POLICY "Feedback author updates"
  ON public.feedback FOR UPDATE TO authenticated
  USING (from_profile_id = auth.uid())
  WITH CHECK (
    from_profile_id = auth.uid()
    AND public.can_rate_appointment(appointment_id, to_profile_id)
  );

-- 3. Public reviews: feedback about dentists and clinic owners is readable
CREATE POLICY "Professional feedback publicly readable"
  ON public.feedback FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = feedback.to_profile_id
         AND p.role IN ('dentist', 'clinic')
    )
  );

-- 4. Average ratings kept in sync server-side
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS rating numeric;

CREATE OR REPLACE FUNCTION public.recompute_profile_rating(_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _avg numeric;
  _role public.app_role;
BEGIN
  IF _profile_id IS NULL THEN RETURN; END IF;
  SELECT role INTO _role FROM public.profiles WHERE id = _profile_id;
  SELECT round(avg(rating)::numeric, 2) INTO _avg
    FROM public.feedback WHERE to_profile_id = _profile_id;

  IF _role = 'dentist' THEN
    UPDATE public.dentists SET rating = _avg WHERE id = _profile_id;
  ELSIF _role = 'patient' THEN
    UPDATE public.patients SET rating = _avg WHERE id = _profile_id;
  ELSIF _role = 'clinic' THEN
    UPDATE public.clinics SET rating = _avg WHERE owner_profile_id = _profile_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.feedback_sync_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM public.recompute_profile_rating(OLD.to_profile_id);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    PERFORM public.recompute_profile_rating(NEW.to_profile_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS feedback_rating_sync ON public.feedback;
CREATE TRIGGER feedback_rating_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.feedback_sync_rating();
