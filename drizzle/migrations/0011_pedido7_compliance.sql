-- 1. Subscriptions: withdrawal waiver (consumers) + annual renewal reminder bookkeeping
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS withdrawal_waiver_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS renewal_notified_for timestamptz;
COMMENT ON COLUMN public.subscriptions.withdrawal_waiver_at IS 'When the consumer requested immediate start and acknowledged losing the 14-day withdrawal right (from checkout metadata).';
COMMENT ON COLUMN public.subscriptions.renewal_notified_for IS 'current_period_end for which the 30-day annual renewal reminder was already sent.';

-- 2. Terms acceptance at sign-up
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role; _lang public.app_language; _name text; _terms boolean;
BEGIN
  IF lower(COALESCE(NEW.email, '')) LIKE '%@seed.smilecheck.app' THEN
    RAISE EXCEPTION 'reserved_email_domain';
  END IF;
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'patient');
  _lang := COALESCE(NULLIF(NEW.raw_user_meta_data->>'language','')::public.app_language, 'pt');
  _name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email);
  _terms := COALESCE(NEW.raw_user_meta_data->>'terms_accepted', '') = 'true';

  INSERT INTO public.profiles (id, role, full_name, email, phone, language, terms_accepted_at, terms_version)
  VALUES (NEW.id, _role, _name, NEW.email, NULLIF(NEW.raw_user_meta_data->>'phone',''), _lang,
          CASE WHEN _terms THEN now() END,
          CASE WHEN _terms THEN left(NULLIF(NEW.raw_user_meta_data->>'terms_version',''), 40) END)
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
END $function$;

-- Clients may not rewrite their acceptance date
CREATE OR REPLACE FUNCTION public.guard_profile_write()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
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
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.terms_accepted_at IS DISTINCT FROM OLD.terms_accepted_at
     OR NEW.terms_version IS DISTINCT FROM OLD.terms_version THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone_verified_at := NULL; END IF;
  RETURN NEW;
END $function$;

-- 3. Professionals' highlights are never exposed to third parties (pending the Ordem's opinion)
CREATE OR REPLACE VIEW public.professional_public_profiles AS
 SELECT id, full_name, avatar_url, role, language, '{}'::text[] AS showcased_achievements
   FROM profiles p
  WHERE role = 'dentist'::app_role AND (EXISTS ( SELECT 1 FROM dentists d WHERE d.id = p.id AND d.verification_status = 'aprovado'::verification_status))
     OR role = 'clinic'::app_role AND (EXISTS ( SELECT 1 FROM clinics c WHERE c.owner_profile_id = p.id AND c.verification_status = 'aprovado'::verification_status));
COMMENT ON COLUMN public.professional_public_profiles.showcased_achievements IS 'DEPRECATED: always empty; professional highlights are visible only to the professional.';

-- 4. Account deletion requests (log)
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_profile ON public.account_deletion_requests(profile_id);
GRANT SELECT ON public.account_deletion_requests TO authenticated;
GRANT ALL ON public.account_deletion_requests TO service_role;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own deletion requests readable" ON public.account_deletion_requests
  FOR SELECT TO authenticated USING (profile_id = (select auth.uid()));

-- 5. Anonymise an account. Clinical records (appointments, dossier, fear assessments, family members) are kept
--    for the responsible professional (legal retention) but no longer identify the person.
CREATE OR REPLACE FUNCTION public.anonymize_account(_uid uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _n jsonb := '{}'::jsonb; _c int;
BEGIN
  PERFORM set_config('app.trusted_write', 'on', true);
  DELETE FROM points_ledger WHERE profile_id = _uid; GET DIAGNOSTICS _c = ROW_COUNT; _n := _n || jsonb_build_object('points', _c);
  DELETE FROM achievements WHERE profile_id = _uid;
  DELETE FROM redemptions WHERE profile_id = _uid;
  DELETE FROM daily_checkins WHERE profile_id = _uid;
  DELETE FROM ad_state WHERE profile_id = _uid;
  DELETE FROM ad_rewards_daily WHERE profile_id = _uid;
  DELETE FROM referrals WHERE inviter_id = _uid OR invitee_id = _uid; GET DIAGNOSTICS _c = ROW_COUNT; _n := _n || jsonb_build_object('referrals', _c);
  DELETE FROM consent_preferences WHERE profile_id = _uid;
  DELETE FROM notification_preferences WHERE profile_id = _uid;
  DELETE FROM notifications WHERE profile_id = _uid;
  DELETE FROM triage_ai_usage WHERE profile_id = _uid;
  DELETE FROM feedback WHERE from_profile_id = _uid; GET DIAGNOSTICS _c = ROW_COUNT; _n := _n || jsonb_build_object('reviews', _c);
  DELETE FROM waiting_list WHERE patient_id = _uid;
  UPDATE user_levels SET current_xp = 0, current_reward_points = 0, level = 'Lata', streak_days = 0, best_streak = 0, last_activity_date = NULL WHERE id = _uid;
  UPDATE profiles SET full_name = NULL, email = NULL, phone = NULL, avatar_url = NULL, date_of_birth = NULL,
         phone_verified_at = NULL, showcased_achievements = '{}', referral_code = NULL, plan = 'free'
   WHERE id = _uid;
  PERFORM set_config('app.trusted_write', 'off', true);
  RETURN _n;
EXCEPTION WHEN OTHERS THEN
  PERFORM set_config('app.trusted_write', 'off', true);
  RAISE;
END $function$;
REVOKE ALL ON FUNCTION public.anonymize_account(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_account(uuid) TO service_role;

-- 6. Download my data (own rows only; professionals' fear assessments are never included)
CREATE OR REPLACE FUNCTION public.export_my_data()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  RETURN jsonb_build_object(
    'exported_at', now(),
    'profile', (SELECT to_jsonb(p) FROM profiles p WHERE p.id = _uid),
    'patient', (SELECT jsonb_build_object('allergies', allergies, 'fear_level', fear_level, 'medical_notes', medical_notes) FROM patients WHERE id = _uid),
    'family_members', COALESCE((SELECT jsonb_agg(to_jsonb(f)) FROM family_members f WHERE f.primary_patient_id = _uid), '[]'),
    'appointments', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', a.id, 'scheduled_at', a.scheduled_at, 'status', a.status, 'type', a.consultation_type, 'clinic_id', a.clinic_id, 'dentist_id', a.dentist_id, 'notes', a.notes)) FROM appointments a WHERE a.patient_id = _uid OR a.dentist_id = _uid), '[]'),
    'levels', (SELECT to_jsonb(l) FROM user_levels l WHERE l.id = _uid),
    'points', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM points_ledger x WHERE x.profile_id = _uid), '[]'),
    'achievements', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM achievements x WHERE x.profile_id = _uid), '[]'),
    'redemptions', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM redemptions x WHERE x.profile_id = _uid), '[]'),
    'reviews_written', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM feedback x WHERE x.from_profile_id = _uid), '[]'),
    'referrals', COALESCE((SELECT jsonb_agg(jsonb_build_object('created_at', x.created_at, 'validated_at', x.validated_at)) FROM referrals x WHERE x.inviter_id = _uid), '[]'),
    'notifications', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM notifications x WHERE x.profile_id = _uid), '[]'),
    'consent', (SELECT to_jsonb(x) FROM consent_preferences x WHERE x.profile_id = _uid),
    'notification_preferences', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM notification_preferences x WHERE x.profile_id = _uid), '[]'),
    'subscriptions', COALESCE((SELECT jsonb_agg(jsonb_build_object('price_id', x.price_id, 'status', x.status, 'current_period_end', x.current_period_end, 'environment', x.environment, 'withdrawal_waiver_at', x.withdrawal_waiver_at)) FROM subscriptions x WHERE x.user_id = _uid), '[]'),
    'waiting_list', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM waiting_list x WHERE x.patient_id = _uid), '[]')
  );
END $function$;
REVOKE ALL ON FUNCTION public.export_my_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

-- 7. Annual renewal reminder (in-app), 30 days before; run daily by pg_cron
CREATE OR REPLACE FUNCTION public.notification_default_target(_type text)
 RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _type IN ('appointment','appointment_created','appointment_confirmed','appointment_cancelled',
                   'appointment_changed','appointment_reminder_24h','appointment_reminder_1h',
                   'waiting_list','waiting_room') THEN '/app?tab=agenda'
    WHEN _type IN ('points','level_up','streak','feedback_pending') THEN '/app?tab=pontuacoes'
    WHEN _type = 'feedback_received' THEN '/app?tab=pontuacoes&section=avaliacoes'
    WHEN _type IN ('achievement','achievement_unlocked') THEN '/app?tab=conquistas'
    WHEN _type = 'message' THEN '/app?tab=conversas'
    WHEN _type IN ('referral','referral_used') THEN '/app?tab=convidar&section=convites'
    WHEN _type = 'prescription' THEN '/app?tab=saude&section=receitas'
    WHEN _type = 'referral_letter' THEN '/app?tab=saude&section=referencias'
    WHEN _type = 'daily_summary' THEN '/app?tab=estatisticas'
    WHEN _type = 'new_dentist' THEN '/app?tab=equipa'
    WHEN _type = 'plan_renewal' THEN '/app?tab=plano'
    ELSE '/app?tab=home'
  END
$function$;

CREATE OR REPLACE FUNCTION public.send_annual_renewal_reminders()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _r record; _n int := 0; _lang text;
BEGIN
  FOR _r IN
    SELECT s.id, s.user_id, s.current_period_end FROM subscriptions s
     JOIN payment_settings ps ON ps.id AND ps.active_env = s.environment
     WHERE s.price_id LIKE '%\_yearly' AND s.status IN ('active','trialing') AND NOT s.cancel_at_period_end
       AND s.current_period_end BETWEEN now() AND now() + interval '30 days'
       AND s.renewal_notified_for IS DISTINCT FROM s.current_period_end
  LOOP
    SELECT language::text INTO _lang FROM profiles WHERE id = _r.user_id;
    INSERT INTO notifications (profile_id, type, title, message, action_url)
    VALUES (_r.user_id, 'plan_renewal',
      CASE _lang WHEN 'fr' THEN 'Renouvellement de votre abonnement annuel' WHEN 'en' THEN 'Your annual plan renews soon' ELSE 'Renovação do seu plano anual' END,
      CASE _lang WHEN 'fr' THEN 'Votre abonnement annuel sera renouvelé le ' || to_char(_r.current_period_end, 'DD/MM/YYYY') || '. Vous pouvez le résilier avant cette date.'
                 WHEN 'en' THEN 'Your annual plan renews on ' || to_char(_r.current_period_end, 'DD/MM/YYYY') || '. You can cancel before that date.'
                 ELSE 'O seu plano anual renova a ' || to_char(_r.current_period_end, 'DD/MM/YYYY') || '. Pode cancelar antes dessa data.' END,
      '/app?tab=plano');
    UPDATE subscriptions SET renewal_notified_for = _r.current_period_end WHERE id = _r.id;
    _n := _n + 1;
  END LOOP;
  RETURN _n;
END $function$;
REVOKE ALL ON FUNCTION public.send_annual_renewal_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_annual_renewal_reminders() TO service_role;