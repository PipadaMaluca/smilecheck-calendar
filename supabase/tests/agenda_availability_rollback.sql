-- Availability guard (always rolled back). Expected: next_after skips the absence; inside_absence=absence;
-- outside_hours=outside_hours; opening_ok=ok; in_hours=ok; trigger_absence=slot_in_absence; trigger_ok=inserted.
BEGIN;
CREATE TEMP TABLE r(k text, v text) ON COMMIT DROP;
-- Pick any real dentist membership in an approved clinic and give it Mon–Sun 09:00–19:00.
CREATE TEMP TABLE t AS SELECT m.dentist_id d, m.clinic_id c, cl.timezone tz FROM clinic_members m JOIN clinics cl ON cl.id = m.clinic_id JOIN profiles p ON p.id = m.dentist_id WHERE NOT p.is_seed LIMIT 1;
UPDATE clinics SET verification_status='aprovado' WHERE id=(SELECT c FROM t);
UPDATE clinic_members SET working_hours='{"mon":[["09:00","19:00"]],"tue":[["09:00","19:00"]],"wed":[["09:00","19:00"]],"thu":[["09:00","19:00"]],"fri":[["09:00","19:00"]],"sat":[["09:00","19:00"]],"sun":[["09:00","19:00"]]}' WHERE dentist_id=(SELECT d FROM t) AND clinic_id=(SELECT c FROM t);
DELETE FROM appointments WHERE dentist_id=(SELECT d FROM t) AND scheduled_at > now();
INSERT INTO r SELECT 'next_before', next_free_slot(d, c)::text FROM t;
INSERT INTO agenda_exceptions(dentist_id, clinic_id, kind, starts_at, ends_at, reason, created_by) SELECT d, NULL, 'ausencia', now() - interval '1 hour', now() + interval '3 days', 'Férias', d FROM t;
INSERT INTO r SELECT 'next_after', next_free_slot(d, c)::text FROM t;
INSERT INTO r SELECT 'inside_absence', slot_availability(d, c, now() + interval '1 day', now() + interval '1 day 30 min') FROM t;
INSERT INTO r SELECT 'outside_hours', slot_availability(d, c, ((now() + interval '5 days')::date + time '21:00') AT TIME ZONE tz, ((now() + interval '5 days')::date + time '21:30') AT TIME ZONE tz) FROM t;
INSERT INTO agenda_exceptions(dentist_id, clinic_id, kind, starts_at, ends_at, reason, created_by) SELECT d, c, 'abertura', ((now() + interval '5 days')::date + time '20:00') AT TIME ZONE tz, ((now() + interval '5 days')::date + time '22:00') AT TIME ZONE tz, 'Extra', d FROM t;
INSERT INTO r SELECT 'opening_ok', slot_availability(d, c, ((now() + interval '5 days')::date + time '21:00') AT TIME ZONE tz, ((now() + interval '5 days')::date + time '21:30') AT TIME ZONE tz) FROM t;
INSERT INTO r SELECT 'in_hours', slot_availability(d, c, ((now() + interval '5 days')::date + time '10:00') AT TIME ZONE tz, ((now() + interval '5 days')::date + time '10:30') AT TIME ZONE tz) FROM t;
DO $$ BEGIN
  INSERT INTO appointments(patient_id, dentist_id, clinic_id, consultation_type, scheduled_at, duration_minutes)
  SELECT (SELECT id FROM profiles WHERE role='patient' AND NOT is_seed LIMIT 1), d, c, (enum_range(NULL::consultation_type))[1], now() + interval '1 day', 30 FROM t;
  INSERT INTO r VALUES ('trigger_absence','ALLOWED');
EXCEPTION WHEN others THEN INSERT INTO r VALUES ('trigger_absence', SQLERRM); END $$;
DO $$ BEGIN
  INSERT INTO appointments(patient_id, dentist_id, clinic_id, consultation_type, scheduled_at, duration_minutes)
  SELECT (SELECT id FROM profiles WHERE role='patient' AND NOT is_seed LIMIT 1), d, c, (enum_range(NULL::consultation_type))[1], ((now() + interval '5 days')::date + time '10:00') AT TIME ZONE tz, 30 FROM t;
  INSERT INTO r VALUES ('trigger_ok','inserted');
EXCEPTION WHEN others THEN INSERT INTO r VALUES ('trigger_ok', SQLERRM); END $$;
SELECT string_agg(k||'='||v, ' | ') FROM r;
ROLLBACK;
