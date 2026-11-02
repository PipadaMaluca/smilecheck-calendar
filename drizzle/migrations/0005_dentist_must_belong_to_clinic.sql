-- A dentist only receives bookings at a clinic they belong to (no clinic → no bookings).
CREATE OR REPLACE FUNCTION public.guard_appointment_dentist_clinic()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.dentist_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.dentist_id IS NOT DISTINCT FROM OLD.dentist_id AND NEW.clinic_id IS NOT DISTINCT FROM OLD.clinic_id THEN
    RETURN NEW;
  END IF;
  IF NEW.clinic_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM clinic_members m WHERE m.dentist_id = NEW.dentist_id AND m.clinic_id = NEW.clinic_id
  ) THEN
    RAISE EXCEPTION 'dentist_not_in_clinic';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_appointment_dentist_clinic() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_guard_appointment_dentist_clinic ON public.appointments;
CREATE TRIGGER trg_guard_appointment_dentist_clinic BEFORE INSERT OR UPDATE OF dentist_id, clinic_id ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_dentist_clinic();