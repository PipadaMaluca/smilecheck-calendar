-- Server-side maintenance writes in this migration (seed backfill) pass the guard triggers.
SELECT set_config('app.trusted_write', 'on', true);

-- ========== 1. Function privileges: nothing executable by PUBLIC/anon by default ==========
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;
-- Kept for anon: evaluated inside guard triggers on any request path (signup included); returns only a boolean.
GRANT EXECUTE ON FUNCTION public.is_untrusted_caller() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_patient(uuid) TO authenticated;

-- ========== 2. Seed flag ==========
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET is_seed = true WHERE email LIKE '%@seed.smilecheck.app';
UPDATE public.patients pa SET is_seed = true FROM public.profiles p WHERE p.id = pa.id AND p.is_seed;
UPDATE public.appointments a SET is_seed = true
  FROM public.profiles p, public.profiles d
 WHERE p.id = a.patient_id AND d.id = a.dentist_id AND p.is_seed AND d.is_seed;
CREATE INDEX IF NOT EXISTS idx_appointments_is_seed ON public.appointments (is_seed) WHERE is_seed;

CREATE OR REPLACE FUNCTION public.refresh_seed_appointments()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'not allowed'; END IF;
  PERFORM set_config('app.trusted_write', 'on', true);
  UPDATE appointments a SET scheduled_at = a.scheduled_at + interval '28 days'
   WHERE a.is_seed AND a.scheduled_at < now() - interval '14 days';
  UPDATE appointments a SET status = CASE
       WHEN a.scheduled_at + make_interval(mins => a.duration_minutes) <= now() THEN
         CASE abs(hashtext(a.id::text)) % 10 WHEN 0 THEN 'falta'::appointment_status WHEN 1 THEN 'cancelada'::appointment_status ELSE 'visto'::appointment_status END
       WHEN a.scheduled_at <= now() THEN 'em_consulta'::appointment_status
       ELSE CASE abs(hashtext(a.id::text)) % 4 WHEN 0 THEN 'agendada'::appointment_status ELSE 'confirmada'::appointment_status END
     END
   WHERE a.is_seed;
  PERFORM set_config('app.trusted_write', 'off', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.refresh_seed_appointments() FROM PUBLIC, anon, authenticated;

-- ========== 3. Plan + referral code on profiles (server-managed) ==========
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free','pro','premium'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text DEFAULT ('SMILE-' || upper(substr(md5(gen_random_uuid()::text), 1, 8)));
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_referral_code ON public.profiles (referral_code);

CREATE OR REPLACE FUNCTION public.guard_profile_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.phone_verified_at := NULL;
    NEW.plan := 'free';
    NEW.is_seed := false;
    NEW.referral_code := 'SMILE-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN RAISE EXCEPTION 'role_change_not_allowed'; END IF;
  IF NEW.phone_verified_at IS DISTINCT FROM OLD.phone_verified_at
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.is_seed IS DISTINCT FROM OLD.is_seed
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone_verified_at := NULL; END IF;
  RETURN NEW;
END $$;

-- ========== 4. Block sign-up with seed e-mails ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role; _lang public.app_language; _name text;
BEGIN
  IF lower(COALESCE(NEW.email, '')) LIKE '%@seed.smilecheck.app' THEN
    RAISE EXCEPTION 'reserved_email_domain';
  END IF;
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'patient');
  _lang := COALESCE(NULLIF(NEW.raw_user_meta_data->>'language','')::public.app_language, 'pt');
  _name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email);

  INSERT INTO public.profiles (id, role, full_name, email, phone, language)
  VALUES (NEW.id, _role, _name, NEW.email, NULLIF(NEW.raw_user_meta_data->>'phone',''), _lang)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_levels (id, current_xp, current_reward_points, level, streak_days, best_streak)
  VALUES (NEW.id, 0, 0, 'Lata', 0, 0) ON CONFLICT (id) DO NOTHING;
  IF _role = 'patient' THEN
    INSERT INTO public.patients (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'dentist' THEN
    INSERT INTO public.dentists (id, rpps_number) VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'rpps_number',''))
    ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'clinic' THEN
    INSERT INTO public.clinics (owner_profile_id, name, address, phone, email)
    VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'clinic_name',''), _name),
            NULLIF(NEW.raw_user_meta_data->>'address',''), NULLIF(NEW.raw_user_meta_data->>'phone',''), NEW.email);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ========== 5. Clinic time zone ==========
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Lisbon';
UPDATE public.clinics SET timezone = 'Europe/Paris' WHERE name IN ('Clínica Mitry-Mory', 'Clínica Montfermeil');
CREATE OR REPLACE FUNCTION public.validate_clinic_timezone()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.timezone) THEN
    RAISE EXCEPTION 'invalid_timezone';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_validate_clinic_timezone ON public.clinics;
CREATE TRIGGER trg_validate_clinic_timezone BEFORE INSERT OR UPDATE OF timezone ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.validate_clinic_timezone();

-- ========== 6. Fear scale ==========
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_fear_level_range;
ALTER TABLE public.patients ADD CONSTRAINT patients_fear_level_range CHECK (fear_level BETWEEN 0 AND 4);

-- ========== 7. Dossier: active relationship ==========
CREATE OR REPLACE FUNCTION public.can_read_dossier(_patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  last_done AS (
    SELECT a.dentist_id, a.clinic_id FROM appointments a
     WHERE a.patient_id = _patient_id AND a.status IN ('concluida','visto')
     ORDER BY a.scheduled_at DESC LIMIT 1
  ),
  upcoming AS (
    SELECT a.dentist_id, a.clinic_id FROM appointments a
     WHERE a.patient_id = _patient_id AND a.scheduled_at > now()
       AND a.status NOT IN ('cancelada','falta')
  ),
  active AS (SELECT * FROM last_done UNION SELECT * FROM upcoming)
  SELECT EXISTS (
    SELECT 1 FROM active, me
     WHERE me.uid IS NOT NULL
       AND (active.dentist_id = me.uid OR public.owns_clinic(active.clinic_id) OR public.is_clinic_member(active.clinic_id))
  )
$$;
REVOKE EXECUTE ON FUNCTION public.can_read_dossier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_read_dossier(uuid) TO authenticated;

DROP POLICY IF EXISTS "Patient or treating professional reads record" ON public.patients;
CREATE POLICY "Patient or active professional reads record" ON public.patients
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.can_read_dossier(id));

CREATE TABLE public.fear_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  level integer NOT NULL CHECK (level BETWEEN 0 AND 4),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fear_assessments_patient ON public.fear_assessments (patient_id, created_at DESC);
CREATE INDEX idx_fear_assessments_professional ON public.fear_assessments (professional_id);
CREATE INDEX idx_fear_assessments_appointment ON public.fear_assessments (appointment_id);
GRANT SELECT, INSERT ON public.fear_assessments TO authenticated;
GRANT ALL ON public.fear_assessments TO service_role;
ALTER TABLE public.fear_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Author or active professional reads fear assessments" ON public.fear_assessments
  FOR SELECT TO authenticated
  USING (professional_id = (SELECT auth.uid())
         OR (patient_id <> (SELECT auth.uid()) AND public.can_read_dossier(patient_id)));
CREATE POLICY "Treating professional records own fear assessment" ON public.fear_assessments
  FOR INSERT TO authenticated
  WITH CHECK (professional_id = (SELECT auth.uid())
              AND patient_id <> (SELECT auth.uid())
              AND (public.current_role_is('dentist') OR public.current_role_is('clinic'))
              AND public.can_edit_patient(patient_id));

CREATE TABLE public.dossier_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dossier_log_patient ON public.dossier_access_log (patient_id, accessed_at DESC);
CREATE INDEX idx_dossier_log_accessor ON public.dossier_access_log (accessor_id);
GRANT SELECT ON public.dossier_access_log TO authenticated;
GRANT ALL ON public.dossier_access_log TO service_role;
ALTER TABLE public.dossier_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient and accessor read access log" ON public.dossier_access_log
  FOR SELECT TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR accessor_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.log_dossier_access(_patient_id uuid, _section text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF auth.uid() = _patient_id THEN RETURN true; END IF;
  IF NOT public.can_read_dossier(_patient_id) THEN RETURN false; END IF;
  INSERT INTO dossier_access_log (patient_id, accessor_id, section)
  VALUES (_patient_id, auth.uid(), left(COALESCE(_section, 'dossier'), 40));
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.log_dossier_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_dossier_access(uuid, text) TO authenticated;

-- ========== 8. Points rules for ads and referrals ==========
INSERT INTO public.points_rules (role, action_key, xp, points, label, is_evaluation)
SELECT r.role, 'anuncios_10', 0, 2, '10 anúncios vistos', false
  FROM unnest(enum_range(NULL::public.app_role)) AS r(role)
 WHERE NOT EXISTS (SELECT 1 FROM public.points_rules p WHERE p.role = r.role AND p.action_key = 'anuncios_10');
INSERT INTO public.points_rules (role, action_key, xp, points, label, is_evaluation)
SELECT r.role, 'convite_nivel2', 0, 1, 'Convite de um convidado', false
  FROM unnest(enum_range(NULL::public.app_role)) AS r(role)
 WHERE NOT EXISTS (SELECT 1 FROM public.points_rules p WHERE p.role = r.role AND p.action_key = 'convite_nivel2');
INSERT INTO public.points_rules (role, action_key, xp, points, label, is_evaluation)
SELECT r.role, 'convidar_amigo', src.xp, src.points, src.label, false
  FROM unnest(enum_range(NULL::public.app_role)) AS r(role)
  CROSS JOIN (SELECT xp, points, label FROM public.points_rules WHERE role = 'patient' AND action_key = 'convidar_amigo' LIMIT 1) src
 WHERE NOT EXISTS (SELECT 1 FROM public.points_rules p WHERE p.role = r.role AND p.action_key = 'convidar_amigo');

-- ========== 9. Ads (server-side counters) ==========
CREATE TABLE public.ad_state (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  videos_watched integer NOT NULL DEFAULT 0,
  ad_free_until timestamptz,
  ads_seen integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ad_state TO authenticated;
GRANT ALL ON public.ad_state TO service_role;
ALTER TABLE public.ad_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ad state readable" ON public.ad_state FOR SELECT TO authenticated USING (profile_id = (SELECT auth.uid()));

CREATE TABLE public.ad_rewards_daily (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, reward_date)
);
GRANT SELECT ON public.ad_rewards_daily TO authenticated;
GRANT ALL ON public.ad_rewards_daily TO service_role;
ALTER TABLE public.ad_rewards_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ad rewards readable" ON public.ad_rewards_daily FOR SELECT TO authenticated USING (profile_id = (SELECT auth.uid()));

-- _kind: 'video' (towards 8 h ad-free) or 'ad' (towards 2 reward points, max once a day).
CREATE OR REPLACE FUNCTION public.record_ad_view(_kind text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _plan text; _verified timestamptz; _role public.app_role;
  _s public.ad_state;
  _awarded boolean := false;
  _rule public.points_rules;
  _today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT plan, phone_verified_at, role INTO _plan, _verified, _role FROM profiles WHERE id = _uid;
  IF _plan IS DISTINCT FROM 'free' THEN RAISE EXCEPTION 'no_ads_on_plan'; END IF;
  IF _kind NOT IN ('video','ad') THEN RAISE EXCEPTION 'invalid_kind'; END IF;

  INSERT INTO ad_state (profile_id) VALUES (_uid) ON CONFLICT (profile_id) DO NOTHING;
  SELECT * INTO _s FROM ad_state WHERE profile_id = _uid FOR UPDATE;

  IF _kind = 'video' THEN
    IF _s.ad_free_until IS NOT NULL AND _s.ad_free_until > now() THEN RAISE EXCEPTION 'already_ad_free'; END IF;
    IF _s.videos_watched + 1 >= 5 THEN
      UPDATE ad_state SET videos_watched = 0, ad_free_until = now() + interval '8 hours', updated_at = now() WHERE profile_id = _uid;
    ELSE
      UPDATE ad_state SET videos_watched = _s.videos_watched + 1, updated_at = now() WHERE profile_id = _uid;
    END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM ad_rewards_daily WHERE profile_id = _uid AND reward_date = _today) THEN
      RAISE EXCEPTION 'daily_limit_reached';
    END IF;
    IF _s.ads_seen + 1 >= 10 THEN
      UPDATE ad_state SET ads_seen = 0, updated_at = now() WHERE profile_id = _uid;
      IF _verified IS NOT NULL THEN
        INSERT INTO ad_rewards_daily (profile_id, reward_date) VALUES (_uid, _today) ON CONFLICT DO NOTHING;
        IF FOUND THEN
          SELECT * INTO _rule FROM points_rules WHERE role = _role AND action_key = 'anuncios_10';
          PERFORM set_config('app.trusted_write', 'on', true);
          PERFORM public.apply_points(_uid, 0, COALESCE(_rule.points, 2), '10 anúncios vistos', NULL, 1.0);
          PERFORM set_config('app.trusted_write', 'off', true);
          _awarded := true;
        END IF;
      END IF;
    ELSE
      UPDATE ad_state SET ads_seen = _s.ads_seen + 1, updated_at = now() WHERE profile_id = _uid;
    END IF;
  END IF;

  SELECT * INTO _s FROM ad_state WHERE profile_id = _uid;
  RETURN jsonb_build_object('videos_watched', _s.videos_watched, 'ad_free_until', _s.ad_free_until,
    'ads_seen', _s.ads_seen, 'points_awarded', _awarded,
    'phone_verified', _verified IS NOT NULL,
    'rewarded_today', EXISTS (SELECT 1 FROM ad_rewards_daily WHERE profile_id = _uid AND reward_date = _today));
END $$;
REVOKE EXECUTE ON FUNCTION public.record_ad_view(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_ad_view(text) TO authenticated;

-- ========== 10. Referrals (2 levels, server-only points) ==========
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  level2_awarded_at timestamptz,
  CONSTRAINT referrals_not_self CHECK (inviter_id <> invitee_id)
);
CREATE UNIQUE INDEX uq_referrals_invitee ON public.referrals (invitee_id);
CREATE INDEX idx_referrals_inviter ON public.referrals (inviter_id);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inviter and invitee read referral" ON public.referrals FOR SELECT TO authenticated
  USING (inviter_id = (SELECT auth.uid()) OR invitee_id = (SELECT auth.uid()));

-- Validates once per invitee: phone verified + first appointment completed (patients) or approved (professionals).
CREATE OR REPLACE FUNCTION public.try_validate_referral(_invitee uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _r referrals; _p profiles; _ok boolean := false; _up uuid;
  _rule points_rules; _inviter_role public.app_role; _up_verified timestamptz; _inv_verified timestamptz;
BEGIN
  SELECT * INTO _r FROM referrals WHERE invitee_id = _invitee FOR UPDATE;
  IF NOT FOUND OR _r.validated_at IS NOT NULL THEN RETURN; END IF;
  SELECT * INTO _p FROM profiles WHERE id = _invitee;
  IF _p.phone_verified_at IS NULL THEN RETURN; END IF;
  IF _p.role = 'patient' THEN
    _ok := EXISTS (SELECT 1 FROM appointments WHERE patient_id = _invitee AND status IN ('concluida','visto'));
  ELSIF _p.role = 'dentist' THEN
    _ok := EXISTS (SELECT 1 FROM dentists WHERE id = _invitee AND verification_status = 'aprovado');
  ELSE
    _ok := EXISTS (SELECT 1 FROM clinics WHERE owner_profile_id = _invitee AND verification_status = 'aprovado');
  END IF;
  IF NOT _ok THEN RETURN; END IF;

  UPDATE referrals SET validated_at = now() WHERE id = _r.id;
  PERFORM set_config('app.trusted_write', 'on', true);

  SELECT role, phone_verified_at INTO _inviter_role, _inv_verified FROM profiles WHERE id = _r.inviter_id;
  IF _inv_verified IS NOT NULL THEN
    SELECT * INTO _rule FROM points_rules WHERE role = _inviter_role AND action_key = 'convidar_amigo';
    IF FOUND THEN PERFORM public.apply_points(_r.inviter_id, _rule.xp, _rule.points, 'Convite validado', NULL, NULL); END IF;
  END IF;

  -- Level 2: whoever invited my inviter gets 1 point. Never deeper.
  SELECT inviter_id INTO _up FROM referrals WHERE invitee_id = _r.inviter_id;
  IF _up IS NOT NULL THEN
    SELECT role, phone_verified_at INTO _inviter_role, _up_verified FROM profiles WHERE id = _up;
    IF _up_verified IS NOT NULL THEN
      SELECT * INTO _rule FROM points_rules WHERE role = _inviter_role AND action_key = 'convite_nivel2';
      IF FOUND THEN PERFORM public.apply_points(_up, _rule.xp, _rule.points, 'Convite de um convidado', NULL, 1.0); END IF;
      UPDATE referrals SET level2_awarded_at = now() WHERE id = _r.id;
    END IF;
  END IF;
  PERFORM set_config('app.trusted_write', 'off', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.try_validate_referral(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.register_referral(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _inviter uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT id INTO _inviter FROM profiles WHERE referral_code = upper(trim(_code));
  IF _inviter IS NULL THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF _inviter = _uid THEN RAISE EXCEPTION 'self_referral'; END IF;
  IF EXISTS (SELECT 1 FROM referrals WHERE inviter_id = _uid AND invitee_id = _inviter) THEN RAISE EXCEPTION 'invalid_code'; END IF;
  INSERT INTO referrals (inviter_id, invitee_id) VALUES (_inviter, _uid) ON CONFLICT (invitee_id) DO NOTHING;
  IF NOT FOUND THEN RAISE EXCEPTION 'already_referred'; END IF;
  PERFORM public.try_validate_referral(_uid);
  RETURN jsonb_build_object('ok', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.register_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_referral(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.referral_validation_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'appointments' THEN
    IF NEW.status IN ('concluida','visto') AND OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.try_validate_referral(NEW.patient_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.phone_verified_at IS NOT NULL AND OLD.phone_verified_at IS NULL THEN
      PERFORM public.try_validate_referral(NEW.id);
    END IF;
  ELSIF TG_TABLE_NAME = 'dentists' THEN
    IF NEW.verification_status = 'aprovado' AND OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
      PERFORM public.try_validate_referral(NEW.id);
    END IF;
  ELSIF TG_TABLE_NAME = 'clinics' THEN
    IF NEW.verification_status = 'aprovado' AND OLD.verification_status IS DISTINCT FROM NEW.verification_status
       AND NEW.owner_profile_id IS NOT NULL THEN
      PERFORM public.try_validate_referral(NEW.owner_profile_id);
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.referral_validation_trigger() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_referral_on_appointment AFTER UPDATE OF status ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.referral_validation_trigger();
CREATE TRIGGER trg_referral_on_profile AFTER UPDATE OF phone_verified_at ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.referral_validation_trigger();
CREATE TRIGGER trg_referral_on_dentist AFTER UPDATE OF verification_status ON public.dentists FOR EACH ROW EXECUTE FUNCTION public.referral_validation_trigger();
CREATE TRIGGER trg_referral_on_clinic AFTER UPDATE OF verification_status ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.referral_validation_trigger();

-- Re-assert grants the app relies on (revoked from PUBLIC above).
GRANT EXECUTE ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_reschedule(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_clinic(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.treats_patient(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_role_is(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_notify_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_rate_appointment(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.level_for_xp(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.level_multiplier(public.level_tier) TO authenticated;

SELECT set_config('app.trusted_write', 'off', true);