-- Favorites: one row per (user, dentist) or (user, clinic); only the owner sees/writes.
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dentist_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_one_target CHECK ((dentist_id IS NULL) <> (clinic_id IS NULL))
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_favorites_dentist ON public.favorites(user_id, dentist_id) WHERE dentist_id IS NOT NULL;
CREATE UNIQUE INDEX uq_favorites_clinic ON public.favorites(user_id, clinic_id) WHERE clinic_id IS NOT NULL;
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_dentist ON public.favorites(dentist_id);
CREATE INDEX idx_favorites_clinic ON public.favorites(clinic_id);
CREATE POLICY "Own favorites read" ON public.favorites FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Own favorites insert" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Own favorites delete" ON public.favorites FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Short author name: "Maria Silva Santos" -> "Maria S."
CREATE OR REPLACE FUNCTION public.short_person_name(_full text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _full IS NULL OR btrim(_full) = '' THEN '—'
    WHEN array_length(regexp_split_to_array(btrim(_full), '\s+'), 1) = 1 THEN btrim(_full)
    ELSE split_part(btrim(_full), ' ', 1) || ' ' ||
         left((regexp_split_to_array(btrim(_full), '\s+'))[array_length(regexp_split_to_array(btrim(_full), '\s+'), 1)], 1) || '.'
  END
$$;

-- Verified reviews of an approved dentist or clinic. Count/average/list only when >= 3 reviews.
CREATE OR REPLACE FUNCTION public.professional_reviews(_dentist uuid DEFAULT NULL, _clinic uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _target uuid; _n int; _avg numeric; _list jsonb;
BEGIN
  IF (select auth.uid()) IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _dentist IS NOT NULL THEN
    SELECT d.id INTO _target FROM dentists d
     WHERE d.id = _dentist AND (d.verification_status = 'aprovado' OR d.id = (select auth.uid()));
  ELSIF _clinic IS NOT NULL THEN
    SELECT c.owner_profile_id INTO _target FROM clinics c
     WHERE c.id = _clinic AND (c.verification_status = 'aprovado' OR c.owner_profile_id = (select auth.uid()));
  END IF;
  IF _target IS NULL THEN RETURN jsonb_build_object('count', 0, 'average', NULL, 'reviews', '[]'::jsonb); END IF;

  SELECT count(*), round(avg(f.rating)::numeric, 1),
         COALESCE(jsonb_agg(jsonb_build_object('id', f.id, 'rating', f.rating, 'comment', f.comment,
                   'created_at', f.created_at, 'author', public.short_person_name(p.full_name))
                   ORDER BY f.created_at DESC), '[]'::jsonb)
    INTO _n, _avg, _list
    FROM feedback f
    JOIN appointments a ON a.id = f.appointment_id AND a.status IN ('visto', 'concluida')
    JOIN profiles p ON p.id = f.from_profile_id AND p.role = 'patient'
   WHERE f.to_profile_id = _target
     AND a.patient_id = f.from_profile_id
     AND (_clinic IS NULL OR a.clinic_id = _clinic)
     AND (_dentist IS NULL OR a.dentist_id = _dentist);

  IF _n < 3 THEN RETURN jsonb_build_object('count', _n, 'average', NULL, 'reviews', '[]'::jsonb); END IF;
  RETURN jsonb_build_object('count', _n, 'average', _avg, 'reviews', _list);
END $$;

-- Public dentist profile: public columns only (never phone/e-mail/birth date/rating/level/plan).
CREATE OR REPLACE FUNCTION public.public_dentist_profile(_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN (select auth.uid()) IS NULL THEN NULL ELSE (
    SELECT jsonb_build_object(
      'id', p.id, 'name', p.full_name, 'avatar_url', p.avatar_url,
      'specialties', d.specialties, 'bio', d.bio, 'languages', d.spoken_languages,
      'clinics', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'address', c.address,
                    'city', c.city, 'postal_code', c.postal_code, 'lat', c.latitude, 'lng', c.longitude, 'timezone', c.timezone) ORDER BY c.name)
                 FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id AND c.verification_status = 'aprovado'
                WHERE m.dentist_id = p.id), '[]'::jsonb))
      FROM profiles p JOIN dentists d ON d.id = p.id
     WHERE p.id = _id AND p.role = 'dentist'
       AND (d.verification_status = 'aprovado' OR p.id = (select auth.uid()))
  ) END
$$;

CREATE OR REPLACE FUNCTION public.public_clinic_profile(_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN (select auth.uid()) IS NULL THEN NULL ELSE (
    SELECT jsonb_build_object(
      'id', c.id, 'name', c.name, 'address', c.address, 'city', c.city, 'postal_code', c.postal_code,
      'country', c.country, 'timezone', c.timezone, 'lat', c.latitude, 'lng', c.longitude,
      'teleconsultation_available', c.teleconsultation_available,
      'dentists', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.full_name, 'avatar_url', p.avatar_url,
                     'specialties', d.specialties) ORDER BY p.full_name)
                  FROM clinic_members m JOIN profiles p ON p.id = m.dentist_id
                  JOIN dentists d ON d.id = p.id AND d.verification_status = 'aprovado'
                 WHERE m.clinic_id = c.id), '[]'::jsonb))
      FROM clinics c
     WHERE c.id = _id AND (c.verification_status = 'aprovado' OR c.owner_profile_id = (select auth.uid()) OR public.is_clinic_member(c.id))
  ) END
$$;

-- The caller's favourites with public card data.
CREATE OR REPLACE FUNCTION public.my_favorites()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'created_at') DESC), '[]'::jsonb) FROM (
    SELECT jsonb_build_object('kind', 'dentist', 'created_at', f.created_at) || public.public_dentist_profile(f.dentist_id) AS x
      FROM favorites f WHERE f.user_id = (select auth.uid()) AND f.dentist_id IS NOT NULL
       AND public.public_dentist_profile(f.dentist_id) IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object('kind', 'clinic', 'created_at', f.created_at) || public.public_clinic_profile(f.clinic_id)
      FROM favorites f WHERE f.user_id = (select auth.uid()) AND f.clinic_id IS NOT NULL
       AND public.public_clinic_profile(f.clinic_id) IS NOT NULL
  ) s
$$;

-- Patient search for professionals: only patients in an active relationship (can_read_dossier).
CREATE OR REPLACE FUNCTION public.search_my_patients(_q text DEFAULT NULL, _limit int DEFAULT 20, _offset int DEFAULT 0)
RETURNS TABLE(id uuid, full_name text, phone text, date_of_birth date, last_visit timestamptz, next_visit timestamptz, total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _me uuid := (select auth.uid());
  _qq text := NULLIF(btrim(COALESCE(_q, '')), '');
  _digits text := NULLIF(regexp_replace(COALESCE(_q, ''), '\D', '', 'g'), '');
  _lim int := LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
  _off int := GREATEST(COALESCE(_offset, 0), 0);
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = _me AND role IN ('dentist', 'clinic')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  WITH cands AS (
    SELECT DISTINCT a.patient_id AS pid FROM appointments a
     WHERE a.dentist_id = _me OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id)
  ), rel AS (
    SELECT c.pid FROM cands c WHERE public.can_read_dossier(c.pid)
  ), m AS (
    SELECT p.id, p.full_name, p.phone, p.date_of_birth,
      (SELECT max(a.scheduled_at) FROM appointments a WHERE a.patient_id = p.id AND a.status IN ('visto','concluida')) AS last_visit,
      (SELECT min(a.scheduled_at) FROM appointments a WHERE a.patient_id = p.id AND a.scheduled_at > now() AND a.status NOT IN ('cancelada','falta')) AS next_visit
      FROM rel JOIN profiles p ON p.id = rel.pid AND p.role = 'patient'
     WHERE _qq IS NULL
        OR p.full_name ILIKE '%' || _qq || '%'
        OR (_digits IS NOT NULL AND length(_digits) >= 3 AND regexp_replace(COALESCE(p.phone, ''), '\D', '', 'g') LIKE '%' || _digits || '%')
        OR to_char(p.date_of_birth, 'DD/MM/YYYY') = _qq
        OR to_char(p.date_of_birth, 'YYYY-MM-DD') = _qq
  )
  SELECT m.id, m.full_name, m.phone, m.date_of_birth, m.last_visit, m.next_visit, count(*) OVER () AS total
    FROM m ORDER BY m.full_name NULLS LAST, m.id LIMIT _lim OFFSET _off;
END $$;

REVOKE ALL ON FUNCTION public.short_person_name(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.professional_reviews(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.public_dentist_profile(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.public_clinic_profile(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_favorites() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_my_patients(text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.short_person_name(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.professional_reviews(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.public_dentist_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.public_clinic_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_favorites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_my_patients(text, int, int) TO authenticated;