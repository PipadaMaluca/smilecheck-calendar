-- Colleagues of the same clinic can read each other's membership (names/hours), never other clinics.
CREATE POLICY "Clinic colleagues see members" ON public.clinic_members
  FOR SELECT TO authenticated USING (public.is_clinic_member(clinic_id));

-- Nobody is added without accepting an invite: direct inserts by the owner are removed.
DROP POLICY IF EXISTS "Clinic owner manages members" ON public.clinic_members;

-- ===== Invites =====
CREATE TABLE public.clinic_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aceite','recusado','cancelado')),
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);
CREATE INDEX idx_clinic_invites_clinic ON public.clinic_invites(clinic_id);
CREATE INDEX idx_clinic_invites_invited_by ON public.clinic_invites(invited_by);
CREATE INDEX idx_clinic_invites_email ON public.clinic_invites(lower(email));
CREATE UNIQUE INDEX uq_clinic_invites_pending ON public.clinic_invites(clinic_id, lower(email)) WHERE status = 'pendente';
COMMENT ON COLUMN public.clinic_invites.email_sent_at IS 'Reserved for a future email delivery step; no email service is connected yet.';

GRANT SELECT ON public.clinic_invites TO authenticated;
GRANT ALL ON public.clinic_invites TO service_role;
ALTER TABLE public.clinic_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or invitee reads invites" ON public.clinic_invites
  FOR SELECT TO authenticated USING (
    public.owns_clinic(clinic_id)
    OR lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', '')));

CREATE OR REPLACE FUNCTION public.invite_dentist(_clinic_id uuid, _email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _e text := lower(btrim(coalesce(_email,''))); _target uuid; _cname text;
BEGIN
  IF NOT public.owns_clinic(_clinic_id) THEN RAISE EXCEPTION 'not_clinic_owner'; END IF;
  IF _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid_email'; END IF;
  SELECT p.id INTO _target FROM profiles p WHERE lower(p.email) = _e LIMIT 1;
  IF _target IS NOT NULL AND EXISTS (SELECT 1 FROM clinic_members WHERE clinic_id = _clinic_id AND dentist_id = _target) THEN
    RAISE EXCEPTION 'already_member';
  END IF;
  IF EXISTS (SELECT 1 FROM clinic_invites WHERE clinic_id = _clinic_id AND lower(email) = _e AND status = 'pendente') THEN
    RAISE EXCEPTION 'already_invited';
  END IF;
  INSERT INTO clinic_invites(clinic_id, email, invited_by) VALUES (_clinic_id, _e, auth.uid()) RETURNING id INTO _id;
  IF _target IS NOT NULL THEN
    SELECT name INTO _cname FROM clinics WHERE id = _clinic_id;
    PERFORM public.create_notification(_target, 'new_dentist', coalesce(_cname,''), 'clinic_invite', '/app?tab=equipa');
  END IF;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.respond_clinic_invite(_invite_id uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv clinic_invites; _role app_role;
BEGIN
  SELECT * INTO _inv FROM clinic_invites WHERE id = _invite_id FOR UPDATE;
  IF _inv.id IS NULL OR _inv.status <> 'pendente' THEN RAISE EXCEPTION 'invite_not_pending'; END IF;
  IF lower(_inv.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) THEN RAISE EXCEPTION 'not_invitee'; END IF;
  SELECT role INTO _role FROM profiles WHERE id = auth.uid();
  IF _accept AND _role IS DISTINCT FROM 'dentist' THEN RAISE EXCEPTION 'not_dentist'; END IF;
  UPDATE clinic_invites SET status = CASE WHEN _accept THEN 'aceite' ELSE 'recusado' END, responded_at = now() WHERE id = _invite_id;
  IF _accept THEN
    INSERT INTO clinic_members(clinic_id, dentist_id) VALUES (_inv.clinic_id, auth.uid())
      ON CONFLICT DO NOTHING;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_clinic_invite(_invite_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE clinic_invites SET status = 'cancelado', responded_at = now()
   WHERE id = _invite_id AND status = 'pendente' AND public.owns_clinic(clinic_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'invite_not_cancellable'; END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.invite_dentist(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.respond_clinic_invite(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_clinic_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_dentist(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_clinic_invite(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_clinic_invite(uuid) TO authenticated;

-- ===== Membership guards =====
-- Working hours: {"mon":[["09:00","13:00"],["14:00","18:00"]], ...}; Sunday allowed in every clinic.
CREATE OR REPLACE FUNCTION public.guard_clinic_member_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _k text; _v jsonb; _iv jsonb; _prev_end time; _s time; _e time;
BEGIN
  IF public.is_untrusted_caller() AND TG_OP = 'UPDATE' THEN
    IF NEW.clinic_id <> OLD.clinic_id OR NEW.dentist_id <> OLD.dentist_id THEN RAISE EXCEPTION 'membership_immutable'; END IF;
    IF NEW.role_in_clinic IS DISTINCT FROM OLD.role_in_clinic AND NOT public.owns_clinic(NEW.clinic_id) THEN
      RAISE EXCEPTION 'role_in_clinic_owner_only';
    END IF;
  END IF;
  IF jsonb_typeof(NEW.working_hours) <> 'object' THEN RAISE EXCEPTION 'invalid_working_hours'; END IF;
  FOR _k, _v IN SELECT * FROM jsonb_each(NEW.working_hours) LOOP
    IF _k NOT IN ('mon','tue','wed','thu','fri','sat','sun') OR jsonb_typeof(_v) <> 'array' OR jsonb_array_length(_v) > 2 THEN
      RAISE EXCEPTION 'invalid_working_hours';
    END IF;
    _prev_end := NULL;
    FOR _iv IN SELECT * FROM jsonb_array_elements(_v) LOOP
      IF jsonb_typeof(_iv) <> 'array' OR jsonb_array_length(_iv) <> 2
         OR (_iv->>0) !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR (_iv->>1) !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
        RAISE EXCEPTION 'invalid_working_hours';
      END IF;
      _s := (_iv->>0)::time; _e := (_iv->>1)::time;
      IF _s >= _e OR (_prev_end IS NOT NULL AND _s < _prev_end) THEN RAISE EXCEPTION 'invalid_working_hours'; END IF;
      _prev_end := _e;
    END LOOP;
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_clinic_member_write BEFORE INSERT OR UPDATE ON public.clinic_members
  FOR EACH ROW EXECUTE FUNCTION public.guard_clinic_member_write();

-- A dentist cannot leave their last clinic (the owner may still remove them; appointments are kept).
CREATE OR REPLACE FUNCTION public.guard_last_clinic()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.is_untrusted_caller() AND OLD.dentist_id = auth.uid() AND NOT public.owns_clinic(OLD.clinic_id)
     AND NOT EXISTS (SELECT 1 FROM clinic_members WHERE dentist_id = OLD.dentist_id AND id <> OLD.id) THEN
    RAISE EXCEPTION 'last_clinic';
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER trg_guard_last_clinic BEFORE DELETE ON public.clinic_members
  FOR EACH ROW EXECUTE FUNCTION public.guard_last_clinic();
