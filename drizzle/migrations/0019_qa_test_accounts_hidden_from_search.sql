-- QA/test accounts: never in public search; only the server can set the flag.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.profiles.is_test IS 'QA/test account: hidden from public search; server-set only';

CREATE OR REPLACE FUNCTION public.guard_profile_write()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.phone_verified_at := NULL;
    NEW.plan := 'free';
    NEW.is_seed := false;
    NEW.is_test := false;
    NEW.referral_code := 'SMILE-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN RAISE EXCEPTION 'role_change_not_allowed'; END IF;
  IF NEW.phone_verified_at IS DISTINCT FROM OLD.phone_verified_at
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.is_seed IS DISTINCT FROM OLD.is_seed
     OR NEW.is_test IS DISTINCT FROM OLD.is_test
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.terms_accepted_at IS DISTINCT FROM OLD.terms_accepted_at
     OR NEW.terms_version IS DISTINCT FROM OLD.terms_version THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone_verified_at := NULL; END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.search_professionals(_q text DEFAULT NULL::text, _kind text DEFAULT 'all'::text, _specialty text DEFAULT NULL::text, _city_or_postal text DEFAULT NULL::text, _lat numeric DEFAULT NULL::numeric, _lng numeric DEFAULT NULL::numeric, _max_km numeric DEFAULT NULL::numeric, _language text DEFAULT NULL::text, _available text DEFAULT 'any'::text, _sort text DEFAULT 'distance'::text, _limit integer DEFAULT 20, _cursor integer DEFAULT 0)
 RETURNS TABLE(id uuid, kind text, name text, avatar_url text, specialties jsonb, languages text[], clinics jsonb, distance_km numeric, next_slot timestamp with time zone, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
     WHERE p.role = 'dentist' AND d.verification_status = 'aprovado' AND NOT p.is_test
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
       AND NOT EXISTS (SELECT 1 FROM profiles o WHERE o.id = c.owner_profile_id AND o.is_test)
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
END $function$;