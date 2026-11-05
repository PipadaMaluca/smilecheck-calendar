-- Availability rule shared by the booking guard, next-free-slot and the waiting list.
CREATE OR REPLACE FUNCTION public.slot_availability(_dentist uuid, _clinic uuid, _start timestamptz, _end timestamptz)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  wh jsonb; tz text; ls timestamp; le timestamp; dayarr jsonb; has_hours boolean;
BEGIN
  IF _dentist IS NULL OR _end <= _start THEN RETURN 'ok'; END IF;
  IF EXISTS (SELECT 1 FROM agenda_exceptions e
              WHERE e.dentist_id = _dentist AND e.kind = 'ausencia'
                AND (e.clinic_id IS NULL OR e.clinic_id IS NOT DISTINCT FROM _clinic)
                AND e.starts_at < _end AND e.ends_at > _start) THEN
    RETURN 'absence';
  END IF;
  IF _clinic IS NULL THEN RETURN 'ok'; END IF;
  SELECT m.working_hours, c.timezone INTO wh, tz
    FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id
   WHERE m.dentist_id = _dentist AND m.clinic_id = _clinic;
  IF wh IS NULL THEN RETURN 'ok'; END IF;
  -- No saved hours at all → the agenda is not restricted by hours.
  SELECT EXISTS (SELECT 1 FROM jsonb_each(wh) j WHERE jsonb_typeof(j.value) = 'array' AND jsonb_array_length(j.value) > 0) INTO has_hours;
  IF NOT has_hours THEN RETURN 'ok'; END IF;
  ls := _start AT TIME ZONE tz; le := _end AT TIME ZONE tz;
  IF ls::date = le::date OR le = date_trunc('day', le) AND le::date = ls::date + 1 THEN
    dayarr := wh -> (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[extract(dow FROM ls)::int + 1];
    IF jsonb_typeof(dayarr) = 'array' AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(dayarr) iv
       WHERE (iv->>0)::time <= ls::time
         AND (CASE WHEN le::date > ls::date THEN time '24:00' ELSE le::time END) <= (CASE WHEN iv->>1 IN ('24:00','00:00') THEN time '24:00' ELSE (iv->>1)::time END)) THEN
      RETURN 'ok';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM agenda_exceptions e
              WHERE e.dentist_id = _dentist AND e.kind = 'abertura'
                AND (e.clinic_id IS NULL OR e.clinic_id = _clinic)
                AND e.starts_at <= _start AND e.ends_at >= _end) THEN
    RETURN 'ok';
  END IF;
  RETURN 'outside_hours';
END $$;
REVOKE ALL ON FUNCTION public.slot_availability(uuid, uuid, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.slot_availability(uuid, uuid, timestamptz, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_appointment_availability()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  IF NEW.dentist_id IS NULL OR NEW.is_seed OR NEW.status IN ('cancelada','falta','concluida','visto') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.scheduled_at IS NOT DISTINCT FROM OLD.scheduled_at
     AND NEW.duration_minutes IS NOT DISTINCT FROM OLD.duration_minutes
     AND NEW.dentist_id IS NOT DISTINCT FROM OLD.dentist_id
     AND NEW.clinic_id IS NOT DISTINCT FROM OLD.clinic_id THEN
    RETURN NEW;
  END IF;
  r := public.slot_availability(NEW.dentist_id, NEW.clinic_id, NEW.scheduled_at,
                                NEW.scheduled_at + make_interval(mins => COALESCE(NEW.duration_minutes, 30)));
  IF r = 'absence' THEN RAISE EXCEPTION 'slot_in_absence' USING ERRCODE = 'P0001'; END IF;
  IF r = 'outside_hours' THEN RAISE EXCEPTION 'outside_working_hours' USING ERRCODE = 'P0001'; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_appointment_availability() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_guard_appointment_availability ON public.appointments;
CREATE TRIGGER trg_guard_appointment_availability
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_availability();

-- Next free 30-min slots: working hours + exceptional openings, minus absences and booked time.
CREATE OR REPLACE FUNCTION public.free_slots(_dentist uuid, _clinic uuid, _count integer DEFAULT 4, _days integer DEFAULT 14)
RETURNS TABLE(slot timestamptz, dentist_id uuid, clinic_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH cand AS (
    SELECT ((d.day + (iv->>0)::time + make_interval(mins => 30 * g)) AT TIME ZONE c.timezone) AS slot, m.dentist_id, m.clinic_id
      FROM clinic_members m
      JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
      CROSS JOIN LATERAL (SELECT ((now() AT TIME ZONE c.timezone)::date + k) AS day FROM generate_series(0, LEAST(GREATEST(_days, 1), 60) - 1) k) d
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(m.working_hours -> (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[extract(dow FROM d.day)::int + 1]) = 'array'
             THEN m.working_hours -> (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[extract(dow FROM d.day)::int + 1] ELSE '[]'::jsonb END) iv
      CROSS JOIN LATERAL generate_series(0, GREATEST(0, (extract(epoch FROM ((iv->>1)::time - (iv->>0)::time)) / 1800)::int - 1)) g
     WHERE (_dentist IS NULL OR m.dentist_id = _dentist) AND (_clinic IS NULL OR m.clinic_id = _clinic)
    UNION
    SELECT e.starts_at + make_interval(mins => 30 * g), e.dentist_id, m.clinic_id
      FROM agenda_exceptions e
      JOIN clinic_members m ON m.dentist_id = e.dentist_id AND (e.clinic_id IS NULL OR m.clinic_id = e.clinic_id)
      JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
      CROSS JOIN LATERAL generate_series(0, GREATEST(0, (extract(epoch FROM (e.ends_at - e.starts_at)) / 1800)::int - 1)) g
     WHERE e.kind = 'abertura' AND e.ends_at > now() AND e.starts_at < now() + make_interval(days => LEAST(GREATEST(_days, 1), 60))
       AND (_dentist IS NULL OR e.dentist_id = _dentist) AND (_clinic IS NULL OR m.clinic_id = _clinic)
  )
  SELECT s.slot, s.dentist_id, s.clinic_id FROM cand s
   WHERE s.slot > now()
     AND NOT EXISTS (SELECT 1 FROM agenda_exceptions e
                      WHERE e.dentist_id = s.dentist_id AND e.kind = 'ausencia'
                        AND (e.clinic_id IS NULL OR e.clinic_id = s.clinic_id)
                        AND e.starts_at < s.slot + interval '30 minutes' AND e.ends_at > s.slot)
     AND NOT EXISTS (SELECT 1 FROM appointments a
                      WHERE a.dentist_id = s.dentist_id AND a.status NOT IN ('cancelada','falta')
                        AND a.scheduled_at < s.slot + interval '30 minutes'
                        AND a.scheduled_at + make_interval(mins => a.duration_minutes) > s.slot)
   ORDER BY s.slot
   LIMIT LEAST(GREATEST(_count, 1), 50)
$$;
REVOKE ALL ON FUNCTION public.free_slots(uuid, uuid, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.free_slots(uuid, uuid, integer, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.next_free_slot(_dentist uuid, _clinic uuid)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.slot FROM public.free_slots(_dentist, _clinic, 1, 7) f LIMIT 1
$$;

-- Appointments already inside a newly created absence (warn only, never auto-cancel).
CREATE OR REPLACE FUNCTION public.appointments_in_range(_dentist uuid, _clinic uuid, _start timestamptz, _end timestamptz)
RETURNS TABLE(id uuid, scheduled_at timestamptz, duration_minutes integer, patient_id uuid, clinic_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.scheduled_at, a.duration_minutes, a.patient_id, a.clinic_id
    FROM appointments a
   WHERE a.dentist_id = _dentist
     AND (_clinic IS NULL OR a.clinic_id = _clinic)
     AND a.status NOT IN ('cancelada','falta','concluida','visto')
     AND a.scheduled_at < _end AND a.scheduled_at + make_interval(mins => a.duration_minutes) > _start
     AND (auth.uid() = _dentist OR EXISTS (SELECT 1 FROM clinics c WHERE c.id = a.clinic_id AND c.owner_profile_id = auth.uid()))
   ORDER BY a.scheduled_at
   LIMIT 200
$$;
REVOKE ALL ON FUNCTION public.appointments_in_range(uuid, uuid, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.appointments_in_range(uuid, uuid, timestamptz, timestamptz) TO authenticated;