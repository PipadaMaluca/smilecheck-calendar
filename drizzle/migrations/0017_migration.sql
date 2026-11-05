CREATE OR REPLACE FUNCTION public.next_free_slot(_dentist uuid, _clinic uuid)
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Follows the saved working hours only: Sunday counts when the dentist has Sunday hours.
  SELECT min(s.slot) FROM (
    SELECT ((d.day + (iv->>0)::time + make_interval(mins => 30 * g)) AT TIME ZONE c.timezone) AS slot, m.dentist_id
      FROM clinic_members m
      JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
      CROSS JOIN LATERAL (SELECT ((now() AT TIME ZONE c.timezone)::date + k) AS day FROM generate_series(0, 6) k) d
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(m.working_hours -> (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[extract(dow FROM d.day)::int + 1]) = 'array'
             THEN m.working_hours -> (ARRAY['sun','mon','tue','wed','thu','fri','sat'])[extract(dow FROM d.day)::int + 1] ELSE '[]'::jsonb END) iv
      CROSS JOIN LATERAL generate_series(0, GREATEST(0, (extract(epoch FROM ((iv->>1)::time - (iv->>0)::time)) / 1800)::int - 1)) g
     WHERE (_dentist IS NULL OR m.dentist_id = _dentist)
       AND (_clinic IS NULL OR m.clinic_id = _clinic)
  ) s
  WHERE s.slot > now()
    AND NOT EXISTS (
      SELECT 1 FROM appointments a
       WHERE a.dentist_id = s.dentist_id
         AND a.status NOT IN ('cancelada','falta')
         AND a.scheduled_at < s.slot + interval '30 minutes'
         AND a.scheduled_at + make_interval(mins => a.duration_minutes) > s.slot)
$function$;