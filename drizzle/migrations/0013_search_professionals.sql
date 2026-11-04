CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS teleconsultation_available boolean NOT NULL DEFAULT false;
ALTER TABLE public.dentists
  ADD COLUMN IF NOT EXISTS spoken_languages text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.validate_search_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'clinics' THEN
    IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN RAISE EXCEPTION 'invalid_latitude'; END IF;
    IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN RAISE EXCEPTION 'invalid_longitude'; END IF;
    IF (NEW.latitude IS NULL) <> (NEW.longitude IS NULL) THEN RAISE EXCEPTION 'coordinates_incomplete'; END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM unnest(NEW.spoken_languages) l WHERE l NOT IN ('pt','fr','en','es')) THEN
      RAISE EXCEPTION 'invalid_language';
    END IF;
    NEW.spoken_languages := ARRAY(SELECT DISTINCT l FROM unnest(NEW.spoken_languages) l ORDER BY l);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_search_fields() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_validate_clinic_search ON public.clinics;
CREATE TRIGGER trg_validate_clinic_search BEFORE INSERT OR UPDATE OF latitude, longitude ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.validate_search_fields();
DROP TRIGGER IF EXISTS trg_validate_dentist_languages ON public.dentists;
CREATE TRIGGER trg_validate_dentist_languages BEFORE INSERT OR UPDATE OF spoken_languages ON public.dentists
  FOR EACH ROW EXECUTE FUNCTION public.validate_search_fields();

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm ON public.profiles USING gin (full_name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clinics_name_trgm ON public.clinics USING gin (name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clinics_verification ON public.clinics (verification_status);
CREATE INDEX IF NOT EXISTS idx_clinics_postal ON public.clinics (postal_code);
CREATE INDEX IF NOT EXISTS idx_clinics_city ON public.clinics (lower(city));
CREATE INDEX IF NOT EXISTS idx_dentists_specialties ON public.dentists USING gin (specialties);
CREATE INDEX IF NOT EXISTS idx_dentists_languages ON public.dentists USING gin (spoken_languages);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_time ON public.appointments (dentist_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_time ON public.appointments (clinic_id, scheduled_at);

-- Public directory: approved clinics, public columns only (no phone/email/rating/owner).
CREATE OR REPLACE VIEW public.public_clinic_directory AS
  SELECT id, name, address, city, postal_code, latitude, longitude, timezone, country,
         accepts_cheque_dentista, accepts_cheque_protese, teleconsultation_available
    FROM public.clinics WHERE verification_status = 'aprovado';
COMMENT ON VIEW public.public_clinic_directory IS 'Approved clinics, public columns only. Never add phone, email, rating or owner.';
GRANT SELECT ON public.public_clinic_directory TO authenticated;

-- Haversine distance in km.
CREATE OR REPLACE FUNCTION public.km_between(_lat1 numeric, _lng1 numeric, _lat2 numeric, _lng2 numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _lat1 IS NULL OR _lng1 IS NULL OR _lat2 IS NULL OR _lng2 IS NULL THEN NULL ELSE
    round((6371 * 2 * asin(sqrt(
      power(sin(radians(_lat2 - _lat1) / 2), 2) +
      cos(radians(_lat1)) * cos(radians(_lat2)) * power(sin(radians(_lng2 - _lng1) / 2), 2))))::numeric, 1) END
$$;
REVOKE EXECUTE ON FUNCTION public.km_between(numeric, numeric, numeric, numeric) FROM PUBLIC, anon;

-- First free 30-min slot in the next 7 days, from clinic_members.working_hours
-- ({"mon":[["09:00","13:00"],...],...}), clinic timezone, no Sundays. Returns only a time.
CREATE OR REPLACE FUNCTION public.next_free_slot(_dentist uuid, _clinic uuid)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
       AND extract(dow FROM d.day) <> 0
  ) s
  WHERE s.slot > now()
    AND NOT EXISTS (
      SELECT 1 FROM appointments a
       WHERE a.dentist_id = s.dentist_id
         AND a.status NOT IN ('cancelada','falta')
         AND a.scheduled_at < s.slot + interval '30 minutes'
         AND a.scheduled_at + make_interval(mins => a.duration_minutes) > s.slot)
$$;
REVOKE EXECUTE ON FUNCTION public.next_free_slot(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_professionals(
  _q text DEFAULT NULL, _kind text DEFAULT 'all', _specialty text DEFAULT NULL,
  _city_or_postal text DEFAULT NULL, _lat numeric DEFAULT NULL, _lng numeric DEFAULT NULL,
  _max_km numeric DEFAULT NULL, _language text DEFAULT NULL, _available text DEFAULT 'any',
  _sort text DEFAULT 'distance', _limit int DEFAULT 20, _cursor int DEFAULT 0)
RETURNS TABLE (id uuid, kind text, name text, avatar_url text, specialties jsonb, languages text[],
               clinics jsonb, distance_km numeric, next_slot timestamptz, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  _lim int := LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
  _off int := GREATEST(COALESCE(_cursor, 0), 0);
  _qq text := NULLIF(btrim(COALESCE(_q, '')), '');
  _loc text := NULLIF(lower(btrim(COALESCE(_city_or_postal, ''))), '');
  _until timestamptz;
BEGIN
  IF (select auth.uid()) IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  _until := CASE _available
    WHEN 'today' THEN (date_trunc('day', now() AT TIME ZONE 'Europe/Lisbon') + interval '1 day') AT TIME ZONE 'Europe/Lisbon'
    WHEN 'tomorrow' THEN (date_trunc('day', now() AT TIME ZONE 'Europe/Lisbon') + interval '2 day') AT TIME ZONE 'Europe/Lisbon'
    WHEN 'week' THEN now() + interval '7 days' ELSE NULL END;

  RETURN QUERY
  WITH cands AS (
    SELECT p.id, 'dentist'::text AS kind, p.full_name AS name, p.avatar_url,
           d.specialties, d.spoken_languages AS languages,
           COALESCE((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city,
                       'postal_code', c.postal_code, 'address', c.address, 'lat', c.latitude, 'lng', c.longitude,
                       'distance_km', public.km_between(_lat, _lng, c.latitude, c.longitude)) ORDER BY c.name)
                      FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
                     WHERE m.dentist_id = p.id), '[]'::jsonb) AS clinics,
           (SELECT min(public.km_between(_lat, _lng, c.latitude, c.longitude))
              FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
             WHERE m.dentist_id = p.id) AS distance_km,
           EXISTS (SELECT 1 FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
                    WHERE m.dentist_id = p.id AND (lower(c.city) = _loc OR lower(c.postal_code) LIKE _loc || '%')) AS loc_ok,
           CASE WHEN _until IS NULL THEN NULL ELSE public.next_free_slot(p.id, NULL) END AS next_slot
      FROM profiles p JOIN dentists d ON d.id = p.id
     WHERE p.role = 'dentist' AND d.verification_status = 'aprovado'
       AND _kind IN ('all', 'dentist')
       AND (_specialty IS NULL OR d.specialties ? _specialty)
       AND (_language IS NULL OR _language = ANY (d.spoken_languages))
    UNION ALL
    SELECT c.id, 'clinic', c.name, NULL::text, '[]'::jsonb, '{}'::text[],
           jsonb_build_array(jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city, 'postal_code', c.postal_code,
             'address', c.address, 'lat', c.latitude, 'lng', c.longitude,
             'distance_km', public.km_between(_lat, _lng, c.latitude, c.longitude))),
           public.km_between(_lat, _lng, c.latitude, c.longitude),
           (lower(c.city) = _loc OR lower(c.postal_code) LIKE _loc || '%'),
           CASE WHEN _until IS NULL THEN NULL ELSE public.next_free_slot(NULL, c.id) END
      FROM clinics c
     WHERE c.verification_status = 'aprovado' AND _kind IN ('all', 'clinic')
       AND _specialty IS NULL AND _language IS NULL
  ), filtered AS (
    SELECT x.*, CASE WHEN _qq IS NULL THEN 0 ELSE extensions.similarity(x.name, _qq) END AS rel
      FROM cands x
     WHERE (_qq IS NULL OR x.name ILIKE '%' || _qq || '%' OR extensions.similarity(x.name, _qq) > 0.25)
       AND (_loc IS NULL OR x.loc_ok)
       AND (_max_km IS NULL OR _lat IS NULL OR (x.distance_km IS NOT NULL AND x.distance_km <= _max_km))
       AND (_until IS NULL OR (x.next_slot IS NOT NULL AND x.next_slot < _until))
  )
  SELECT f.id, f.kind, f.name, f.avatar_url, f.specialties, f.languages, f.clinics, f.distance_km, f.next_slot,
         count(*) OVER () AS total
    FROM filtered f
   ORDER BY
     CASE WHEN _sort = 'relevance' THEN -f.rel END NULLS LAST,
     CASE WHEN _sort = 'distance' THEN f.distance_km END NULLS LAST,
     lower(f.name), f.id
   LIMIT _lim OFFSET _off;
END $$;
REVOKE EXECUTE ON FUNCTION public.search_professionals(text, text, text, text, numeric, numeric, numeric, text, text, text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_professionals(text, text, text, text, numeric, numeric, numeric, text, text, text, int, int) TO authenticated;