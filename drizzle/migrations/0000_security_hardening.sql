-- ===== Helper =====
CREATE OR REPLACE FUNCTION public.is_untrusted_caller() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT coalesce(auth.role(), 'anon') IN ('authenticated','anon')
     AND coalesce(current_setting('app.trusted_write', true), '') <> 'on'
$$;

-- ===== New columns =====
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;
UPDATE public.profiles SET phone_verified_at = now()
 WHERE phone IS NOT NULL AND length(regexp_replace(phone, '\D', '', 'g')) >= 9;

CREATE TYPE public.verification_status AS ENUM ('pendente','aprovado','rejeitado');
ALTER TABLE public.dentists ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'pendente';
ALTER TABLE public.clinics  ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'pendente';
UPDATE public.dentists SET verification_status = 'aprovado';
UPDATE public.clinics  SET verification_status = 'aprovado';

-- ===== Edit window (reads stay on treats_patient) =====
CREATE OR REPLACE FUNCTION public.can_edit_patient(_patient_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.appointments a
     WHERE a.patient_id = _patient_id
       AND a.scheduled_at >= now() - interval '12 months'
       AND (a.dentist_id = auth.uid() OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
  );
$$;

-- ===== profiles guard =====
CREATE OR REPLACE FUNCTION public.guard_profile_write() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.phone_verified_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN RAISE EXCEPTION 'role_change_not_allowed'; END IF;
  IF NEW.phone_verified_at IS DISTINCT FROM OLD.phone_verified_at THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN NEW.phone_verified_at := NULL; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_profile_write BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_write();

-- ===== patients guard (single trigger) =====
CREATE OR REPLACE FUNCTION public.guard_patient_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.blocked IS DISTINCT FROM OLD.blocked OR NEW.rating IS DISTINCT FROM OLD.rating THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF auth.uid() IS DISTINCT FROM OLD.id AND NOT public.can_edit_patient(OLD.id) THEN
    RAISE EXCEPTION 'not_treating_professional';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_patient_update BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.guard_patient_update();

DROP POLICY IF EXISTS "Patient or treating professional updates record" ON public.patients;
CREATE POLICY "Patient or editing professional updates record" ON public.patients
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.can_edit_patient(id))
  WITH CHECK (id = auth.uid() OR public.can_edit_patient(id));

-- ===== dentists / clinics guard =====
CREATE OR REPLACE FUNCTION public.guard_professional_admin_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.verification_status := 'pendente';
    NEW.rating := NULL;
    RETURN NEW;
  END IF;
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.rating IS DISTINCT FROM OLD.rating THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_dentist_admin BEFORE INSERT OR UPDATE ON public.dentists
  FOR EACH ROW EXECUTE FUNCTION public.guard_professional_admin_fields();
CREATE TRIGGER trg_guard_clinic_admin BEFORE INSERT OR UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.guard_professional_admin_fields();

DROP POLICY IF EXISTS "Dentist profiles readable" ON public.dentists;
CREATE POLICY "Approved dentists readable" ON public.dentists FOR SELECT TO authenticated
  USING (verification_status = 'aprovado' OR id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.clinic_members m WHERE m.dentist_id = dentists.id AND public.owns_clinic(m.clinic_id)));

DROP POLICY IF EXISTS "Clinics readable" ON public.clinics;
CREATE POLICY "Approved clinics readable" ON public.clinics FOR SELECT TO authenticated
  USING (verification_status = 'aprovado' OR owner_profile_id = auth.uid() OR public.is_clinic_member(id));

DROP POLICY IF EXISTS "Professional profiles readable" ON public.profiles;
CREATE POLICY "Approved professional profiles readable" ON public.profiles FOR SELECT TO authenticated
  USING (
    (role = 'dentist' AND EXISTS (SELECT 1 FROM public.dentists d WHERE d.id = profiles.id
        AND (d.verification_status = 'aprovado'
             OR EXISTS (SELECT 1 FROM public.clinic_members m WHERE m.dentist_id = d.id AND public.owns_clinic(m.clinic_id)))))
    OR (role = 'clinic' AND EXISTS (SELECT 1 FROM public.clinics c WHERE c.owner_profile_id = profiles.id
        AND (c.verification_status = 'aprovado' OR public.is_clinic_member(c.id))))
  );

-- ===== appointments guard =====
CREATE OR REPLACE FUNCTION public.guard_appointment_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _resched boolean := coalesce(current_setting('app.reschedule_rpc', true), '') = 'on';
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.price IS DISTINCT FROM OLD.price
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF auth.uid() = OLD.patient_id
     AND auth.uid() IS DISTINCT FROM OLD.dentist_id
     AND NOT public.is_clinic_member(OLD.clinic_id)
     AND NOT public.owns_clinic(OLD.clinic_id) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NOT (NEW.status IN ('confirmada','cancelada') OR (_resched AND NEW.status = 'agendada')) THEN
      RAISE EXCEPTION 'patient_status_not_allowed';
    END IF;
    IF NEW.dentist_id IS DISTINCT FROM OLD.dentist_id
       OR NEW.clinic_id IS DISTINCT FROM OLD.clinic_id
       OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
       OR NEW.observation IS DISTINCT FROM OLD.observation THEN
      RAISE EXCEPTION 'patient_field_not_allowed';
    END IF;
    IF NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at AND NOT _resched THEN
      RAISE EXCEPTION 'reschedule_via_rpc_only';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_appointment_update BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_update();

-- ===== request_reschedule =====
CREATE OR REPLACE FUNCTION public.request_reschedule(_appointment_id uuid, _new_time timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.appointments;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO a FROM public.appointments WHERE id = _appointment_id FOR UPDATE;
  IF NOT FOUND OR a.patient_id <> auth.uid() THEN RAISE EXCEPTION 'not_allowed'; END IF;
  IF a.status NOT IN ('agendada','confirmada') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  IF _new_time IS NULL OR _new_time <= now() THEN RAISE EXCEPTION 'time_in_past'; END IF;
  IF a.dentist_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(a.dentist_id::text));
    IF EXISTS (
      SELECT 1 FROM public.appointments o
       WHERE o.dentist_id = a.dentist_id AND o.id <> a.id
         AND o.status NOT IN ('cancelada','falta')
         AND tstzrange(o.scheduled_at, o.scheduled_at + make_interval(mins => o.duration_minutes))
          && tstzrange(_new_time, _new_time + make_interval(mins => a.duration_minutes))
    ) THEN RAISE EXCEPTION 'slot_taken'; END IF;
  END IF;
  PERFORM set_config('app.reschedule_rpc', 'on', true);
  UPDATE public.appointments SET scheduled_at = _new_time, status = 'agendada' WHERE id = a.id;
  PERFORM set_config('app.reschedule_rpc', 'off', true);
END $$;
REVOKE ALL ON FUNCTION public.request_reschedule(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_reschedule(uuid, timestamptz) TO authenticated;

-- ===== trusted writers =====
CREATE OR REPLACE FUNCTION public.recompute_profile_rating(_profile_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _avg numeric; _role public.app_role;
BEGIN
  IF _profile_id IS NULL THEN RETURN; END IF;
  PERFORM set_config('app.trusted_write', 'on', true);
  SELECT role INTO _role FROM public.profiles WHERE id = _profile_id;
  SELECT round(avg(rating)::numeric, 2) INTO _avg FROM public.feedback WHERE to_profile_id = _profile_id;
  IF _role = 'dentist' THEN
    UPDATE public.dentists SET rating = _avg WHERE id = _profile_id;
  ELSIF _role = 'patient' THEN
    UPDATE public.patients SET rating = _avg WHERE id = _profile_id;
  ELSIF _role = 'clinic' THEN
    UPDATE public.clinics SET rating = _avg WHERE owner_profile_id = _profile_id;
  END IF;
  PERFORM set_config('app.trusted_write', 'off', true);
END; $function$;

CREATE OR REPLACE FUNCTION public.confirm_phone_verification(_profile_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN RAISE EXCEPTION 'not_allowed'; END IF;
  PERFORM set_config('app.trusted_write', 'on', true);
  UPDATE public.profiles SET phone_verified_at = now() WHERE id = _profile_id;
  PERFORM set_config('app.trusted_write', 'off', true);
END $$;
REVOKE ALL ON FUNCTION public.confirm_phone_verification(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_phone_verification(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.apply_points(uuid, integer, integer, text, uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_points(uuid, integer, integer, text, uuid, numeric) TO service_role;

-- ===== points uniqueness =====
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_once_per_appt
  ON public.points_ledger (profile_id, related_appointment_id, reason, type)
  WHERE related_appointment_id IS NOT NULL;

-- ===== award_points: deny by default =====
CREATE OR REPLACE FUNCTION public.award_points(_profile_id uuid, _action_key text, _related_appointment_id uuid DEFAULT NULL::uuid, _rating integer DEFAULT NULL::integer, _context jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _caller uuid := auth.uid();
  _role public.app_role;
  _verified timestamptz;
  _key text := _action_key;
  _rule public.points_rules;
  _xp integer; _pts integer; _reason text;
  _evals integer; _confirms integer := 0;
  _result jsonb;
  _lvl public.user_levels;
  _today date := (now() AT TIME ZONE 'utc')::date;
  _bonus_key text;
  _a public.appointments;
  _owner uuid;
  _is_pro boolean := false;
BEGIN
  IF _caller IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT role, phone_verified_at INTO _role, _verified FROM public.profiles WHERE id = _profile_id;
  IF _role IS NULL THEN RAISE EXCEPTION 'unknown_profile'; END IF;

  IF _related_appointment_id IS NOT NULL THEN
    SELECT * INTO _a FROM public.appointments WHERE id = _related_appointment_id;
    IF FOUND THEN
      SELECT owner_profile_id INTO _owner FROM public.clinics WHERE id = _a.clinic_id;
      _is_pro := _caller = _a.dentist_id OR public.owns_clinic(_a.clinic_id) OR public.is_clinic_member(_a.clinic_id);
    END IF;
  END IF;

  -- Explicit allow-list. New actions (emitir_receita, carta_referencia, mensagens, ...)
  -- are added ONLY when their module stops using demo data.
  CASE _action_key
    WHEN 'checkin_diario' THEN
      IF _caller <> _profile_id THEN RAISE EXCEPTION 'not_allowed'; END IF;
    WHEN 'confirmacao_24h', 'confirmacao_1h' THEN
      IF _a.id IS NULL OR _caller <> _a.patient_id OR _profile_id <> _caller
         OR _a.status <> 'confirmada' OR _a.scheduled_at <= now() THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
    WHEN 'compareceu', 'chegou_a_horas', 'colaborou', 'higiene_oral', 'seguiu_recomendacoes' THEN
      IF _a.id IS NULL OR NOT _is_pro OR _profile_id <> _a.patient_id
         OR _a.status NOT IN ('concluida','visto') THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
    WHEN 'falta' THEN
      IF _a.id IS NULL OR NOT _is_pro OR _profile_id <> _a.patient_id OR _a.status <> 'falta' THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
    WHEN 'cancelamento_tardio' THEN
      IF _a.id IS NULL OR NOT _is_pro OR _profile_id <> _a.patient_id OR _a.status <> 'cancelada' THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
    WHEN 'consulta_concluida', 'teleconsulta', 'consulta_clinica' THEN
      IF _a.id IS NULL OR NOT _is_pro OR _a.status NOT IN ('concluida','visto')
         OR NOT (_profile_id = _a.dentist_id OR _profile_id = _owner) THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
    WHEN 'feedback_rating' THEN
      IF _related_appointment_id IS NULL OR _a.id IS NULL
         OR NOT public.can_rate_appointment(_related_appointment_id, _profile_id)
         OR NOT EXISTS (SELECT 1 FROM public.feedback f
                         WHERE f.appointment_id = _related_appointment_id
                           AND f.from_profile_id = _caller AND f.to_profile_id = _profile_id) THEN
        RAISE EXCEPTION 'not_allowed';
      END IF;
      IF _rating IS NULL OR _rating < 1 OR _rating > 5 THEN RAISE EXCEPTION 'invalid_rating'; END IF;
      _key := 'avaliacao_' || _rating::text;
    WHEN 'convidar_amigo' THEN
      RAISE EXCEPTION 'action_suspended';
    ELSE
      RAISE EXCEPTION 'action_not_allowed';
  END CASE;

  IF _verified IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'phone_not_verified');
  END IF;

  PERFORM set_config('app.trusted_write', 'on', true);

  IF _key = 'checkin_diario' THEN
    INSERT INTO public.daily_checkins (profile_id, checkin_date) VALUES (_profile_id, _today)
    ON CONFLICT (profile_id, checkin_date) DO NOTHING;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('awarded', false, 'reason', 'already_checked_in');
    END IF;
    INSERT INTO public.user_levels (id) VALUES (_profile_id) ON CONFLICT (id) DO NOTHING;
    SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id FOR UPDATE;
    UPDATE public.user_levels
       SET streak_days = CASE WHEN _lvl.last_activity_date = _today - 1 THEN _lvl.streak_days + 1 ELSE 1 END,
           best_streak = GREATEST(_lvl.best_streak,
             CASE WHEN _lvl.last_activity_date = _today - 1 THEN _lvl.streak_days + 1 ELSE 1 END),
           last_activity_date = _today
     WHERE id = _profile_id;
  END IF;

  SELECT * INTO _rule FROM public.points_rules WHERE role = _role AND action_key = _key;
  IF _rule.id IS NULL THEN RAISE EXCEPTION 'action_not_allowed'; END IF;

  IF _rule.is_evaluation THEN
    SELECT count(*) INTO _evals
      FROM public.points_ledger l
      JOIN public.points_rules r ON r.role = _role AND r.label = l.reason AND r.is_evaluation
     WHERE l.profile_id = _profile_id AND l.type = 'xp'
       AND (l.created_at AT TIME ZONE 'utc')::date = _today;
    IF _evals >= 40 THEN
      RETURN jsonb_build_object('awarded', false, 'reason', 'daily_evaluation_limit');
    END IF;
  END IF;

  _xp := _rule.xp; _pts := _rule.points; _reason := _rule.label;

  IF _key IN ('compareceu', 'falta') AND _role = 'patient' THEN
    SELECT LEAST(count(*), 2) INTO _confirms
      FROM public.points_ledger l
     WHERE l.profile_id = _profile_id
       AND l.related_appointment_id IS NOT DISTINCT FROM _related_appointment_id
       AND l.type = 'xp' AND l.reason IN ('Confirmação 24h', 'Confirmação 1h');
    IF _key = 'compareceu' THEN
      _xp := 13 + _confirms; _pts := 13 + _confirms;
    ELSE
      _xp := 0; _pts := -16 - (2 * _confirms);
    END IF;
  END IF;

  BEGIN
    _result := public.apply_points(_profile_id, _xp, _pts, _reason, _related_appointment_id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'already_awarded');
  END;

  IF _key = 'checkin_diario' THEN
    SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id;
    _bonus_key := CASE WHEN _lvl.streak_days = 30 THEN 'streak_30'
                       WHEN _lvl.streak_days = 7 THEN 'streak_7' END;
    IF _bonus_key IS NOT NULL THEN
      SELECT * INTO _rule FROM public.points_rules WHERE role = _role AND action_key = _bonus_key;
      _result := public.apply_points(_profile_id, _rule.xp, _rule.points, _rule.label);
      _result := _result || jsonb_build_object('streak_bonus', _bonus_key);
      PERFORM public.create_notification(_profile_id, 'streak',
        'Streak de ' || _lvl.streak_days || ' dias!', '+' || _rule.points || ' pontos de bónus',
        '/app?tab=pontuacoes');
    END IF;
    _result := _result || jsonb_build_object('streak_days', _lvl.streak_days);
  END IF;

  PERFORM set_config('app.trusted_write', 'off', true);
  RETURN _result || jsonb_build_object('awarded', true, 'action_key', _key);
END;
$function$;

-- ===== triage AI usage =====
CREATE TABLE public.triage_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX triage_ai_usage_profile_created ON public.triage_ai_usage (profile_id, created_at);
GRANT SELECT ON public.triage_ai_usage TO authenticated;
GRANT ALL ON public.triage_ai_usage TO service_role;
ALTER TABLE public.triage_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own triage usage read" ON public.triage_ai_usage
  FOR SELECT TO authenticated USING (profile_id = auth.uid());