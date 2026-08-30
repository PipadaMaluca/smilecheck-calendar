CREATE OR REPLACE FUNCTION public.award_points(
  _profile_id uuid,
  _action_key text,
  _related_appointment_id uuid DEFAULT NULL,
  _rating integer DEFAULT NULL,
  _context jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _caller uuid := auth.uid();
  _role public.app_role;
  _phone text;
  _key text := _action_key;
  _rule public.points_rules;
  _xp integer;
  _pts integer;
  _reason text;
  _authorized boolean := false;
  _evals integer;
  _confirms integer := 0;
  _result jsonb;
  _lvl public.user_levels;
  _today date := (now() AT TIME ZONE 'utc')::date;
  _bonus_key text;
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT role, phone INTO _role, _phone FROM public.profiles WHERE id = _profile_id;
  IF _role IS NULL THEN
    RAISE EXCEPTION 'unknown_profile';
  END IF;

  -- Anti-fraud: phone-verified accounts only.
  IF _phone IS NULL OR length(regexp_replace(_phone, '\D', '', 'g')) < 9 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'phone_not_verified');
  END IF;

  -- Authorization: self, or both parties share the referenced appointment.
  IF _caller = _profile_id THEN
    _authorized := true;
  ELSIF _related_appointment_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.appointments a
       WHERE a.id = _related_appointment_id
         AND (a.patient_id = _caller OR a.dentist_id = _caller OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
         AND (a.patient_id = _profile_id OR a.dentist_id = _profile_id
              OR EXISTS (SELECT 1 FROM public.clinics c WHERE c.id = a.clinic_id AND c.owner_profile_id = _profile_id))
    ) INTO _authorized;
  ELSIF _role = 'patient' THEN
    _authorized := public.treats_patient(_profile_id);
  END IF;

  IF NOT _authorized THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  -- Rating actions resolve to the role-specific avaliacao_N rule.
  IF _key = 'feedback_rating' THEN
    IF _rating IS NULL OR _rating < 1 OR _rating > 5 THEN
      RAISE EXCEPTION 'invalid_rating';
    END IF;
    _key := 'avaliacao_' || _rating::text;
  END IF;

  -- Daily check-in: one per UTC day, drives the streak.
  IF _key = 'checkin_diario' THEN
    IF _caller <> _profile_id THEN
      RAISE EXCEPTION 'not_allowed';
    END IF;
    INSERT INTO public.daily_checkins (profile_id, checkin_date)
    VALUES (_profile_id, _today)
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
  IF _rule.id IS NULL THEN
    RAISE EXCEPTION 'unknown_action: %', _key;
  END IF;

  -- Anti-fraud: max 40 evaluation awards per profile per day.
  IF _rule.is_evaluation THEN
    SELECT count(*) INTO _evals
      FROM public.points_ledger l
      JOIN public.points_rules r ON r.role = _role AND r.label = l.reason AND r.is_evaluation
     WHERE l.profile_id = _profile_id
       AND l.type = 'xp'
       AND (l.created_at AT TIME ZONE 'utc')::date = _today;
    IF _evals >= 40 THEN
      RETURN jsonb_build_object('awarded', false, 'reason', 'daily_evaluation_limit');
    END IF;
  END IF;

  _xp := _rule.xp;
  _pts := _rule.points;
  _reason := _rule.label;

  -- Composite attendance / no-show formula. The number of confirmations is
  -- derived from the recorded ledger (never trusted from the client).
  IF _key IN ('compareceu', 'falta') AND _role = 'patient' THEN
    SELECT LEAST(count(*), 2) INTO _confirms
      FROM public.points_ledger l
     WHERE l.profile_id = _profile_id
       AND l.related_appointment_id IS NOT DISTINCT FROM _related_appointment_id
       AND l.type = 'xp'
       AND l.reason IN ('Confirmação 24h', 'Confirmação 1h');

    IF _key = 'compareceu' THEN
      _xp := 13 + _confirms;
      _pts := 13 + _confirms;
    ELSE
      _xp := 0;
      _pts := -16 - (2 * _confirms);
    END IF;
  END IF;

  _result := public.apply_points(_profile_id, _xp, _pts, _reason, _related_appointment_id);

  -- Streak milestone bonuses fire right after the check-in that reaches them.
  IF _key = 'checkin_diario' THEN
    SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id;
    _bonus_key := CASE WHEN _lvl.streak_days = 30 THEN 'streak_30'
                       WHEN _lvl.streak_days = 7 THEN 'streak_7' END;
    IF _bonus_key IS NOT NULL THEN
      SELECT * INTO _rule FROM public.points_rules WHERE role = _role AND action_key = _bonus_key;
      _result := public.apply_points(_profile_id, _rule.xp, _rule.points, _rule.label);
      _result := _result || jsonb_build_object('streak_bonus', _bonus_key);
    END IF;
    _result := _result || jsonb_build_object('streak_days', _lvl.streak_days);
  END IF;

  RETURN _result || jsonb_build_object('awarded', true, 'action_key', _key);
END;
$$;
REVOKE ALL ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) TO authenticated;