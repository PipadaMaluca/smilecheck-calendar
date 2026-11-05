ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_visibility text CHECK (avatar_visibility IN ('public','contacts'));
UPDATE public.profiles SET avatar_visibility = CASE WHEN role = 'patient' THEN 'contacts' ELSE 'public' END WHERE avatar_visibility IS NULL;

CREATE OR REPLACE FUNCTION public.default_avatar_visibility()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.avatar_visibility IS NULL THEN
    NEW.avatar_visibility := CASE WHEN NEW.role = 'patient' THEN 'contacts' ELSE 'public' END;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_default_avatar_visibility ON public.profiles;
CREATE TRIGGER trg_default_avatar_visibility BEFORE INSERT OR UPDATE OF role, avatar_visibility ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.default_avatar_visibility();
GRANT EXECUTE ON FUNCTION public.default_avatar_visibility() TO authenticated, anon;

UPDATE public.profiles
   SET avatar_url = regexp_replace(avatar_url, '^(https?://[^/]+)/storage/v1/object/(sign|public)/avatars/[0-9a-f-]+/avatar-([0-9]+)\.webp.*$', '\1/functions/v1/avatar?u=' || id::text || '&v=\3')
 WHERE avatar_url ~ '/storage/v1/object/(sign|public)/avatars/[0-9a-f-]+/avatar-[0-9]+\.webp';

CREATE OR REPLACE FUNCTION public.guard_avatar_url()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
     AND NEW.avatar_url !~ ('^https://[^/?#]+/functions/v1/avatar\?u=' || NEW.id::text || '&v=[0-9]{1,16}$') THEN
    RAISE EXCEPTION 'invalid_avatar_url';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.can_view_avatar(_viewer uuid, _owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = _owner AND p.avatar_visibility = 'public')
    OR (_viewer IS NOT NULL AND (
      _viewer = _owner
      OR EXISTS (SELECT 1 FROM appointments a LEFT JOIN clinics c ON c.id = a.clinic_id
                 WHERE (a.patient_id = _owner AND (a.dentist_id = _viewer OR c.owner_profile_id = _viewer))
                    OR (a.patient_id = _viewer AND (a.dentist_id = _owner OR c.owner_profile_id = _owner)))
      OR EXISTS (SELECT 1 FROM conversations cv
                 WHERE (cv.profile_a = _viewer AND cv.profile_b = _owner) OR (cv.profile_a = _owner AND cv.profile_b = _viewer))
      OR EXISTS (
        WITH v AS (SELECT clinic_id FROM clinic_members WHERE dentist_id = _viewer UNION SELECT id FROM clinics WHERE owner_profile_id = _viewer),
             o AS (SELECT clinic_id FROM clinic_members WHERE dentist_id = _owner UNION SELECT id FROM clinics WHERE owner_profile_id = _owner)
        SELECT 1 FROM v JOIN o USING (clinic_id))
    ))
$$;
GRANT EXECUTE ON FUNCTION public.can_view_avatar(uuid, uuid) TO service_role;