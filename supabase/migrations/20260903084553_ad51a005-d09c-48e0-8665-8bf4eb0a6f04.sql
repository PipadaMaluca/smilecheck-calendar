-- Shared, backend-only notification writer.
CREATE OR REPLACE FUNCTION public.create_notification(
  _profile_id uuid,
  _type text,
  _title text,
  _message text DEFAULT NULL,
  _action_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _id uuid;
BEGIN
  IF _profile_id IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.notifications (profile_id, type, title, message, action_url, read)
  VALUES (_profile_id, _type, _title, _message, _action_url, false)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO service_role;

-- Points + level-up notifications.
CREATE OR REPLACE FUNCTION public.apply_points(_profile_id uuid, _xp integer, _points integer, _reason text, _related_appointment_id uuid DEFAULT NULL::uuid, _multiplier numeric DEFAULT NULL::numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _lvl public.user_levels;
  _mult numeric;
  _xp_gain integer;
  _pts_delta integer;
  _new_xp integer;
  _new_pts integer;
  _new_level public.level_tier;
BEGIN
  INSERT INTO public.user_levels (id) VALUES (_profile_id) ON CONFLICT (id) DO NOTHING;
  SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id FOR UPDATE;

  _mult := COALESCE(_multiplier, public.level_multiplier(_lvl.level));

  _xp_gain := GREATEST(COALESCE(_xp, 0), 0);
  IF COALESCE(_points, 0) > 0 THEN
    _pts_delta := ROUND(_points * _mult);
  ELSE
    _pts_delta := COALESCE(_points, 0);
    _mult := 1.0;
  END IF;

  _new_xp := LEAST(_lvl.current_xp + _xp_gain, 10000);
  _new_pts := GREATEST(_lvl.current_reward_points + _pts_delta, 0);
  _new_level := public.level_for_xp(_new_xp);

  IF _xp_gain <> 0 THEN
    INSERT INTO public.points_ledger (profile_id, type, amount, reason, multiplier_applied, related_appointment_id)
    VALUES (_profile_id, 'xp', _xp_gain, _reason, 1.0, _related_appointment_id);
  END IF;
  IF _pts_delta <> 0 THEN
    INSERT INTO public.points_ledger (profile_id, type, amount, reason, multiplier_applied, related_appointment_id)
    VALUES (_profile_id, 'reward_points', _pts_delta, _reason, _mult, _related_appointment_id);
  END IF;

  UPDATE public.user_levels
     SET current_xp = _new_xp,
         current_reward_points = _new_pts,
         level = _new_level
   WHERE id = _profile_id;

  -- Notify on meaningful gains only, so routine +1/+2 actions stay quiet.
  IF _pts_delta >= 20 AND COALESCE(_reason, '') NOT LIKE 'Conquista:%' THEN
    PERFORM public.create_notification(
      _profile_id, 'points',
      'Ganhou ' || _pts_delta || ' pontos',
      COALESCE(_reason, 'Atividade registada'),
      '/app?tab=pontuacoes'
    );
  END IF;

  IF _new_level <> _lvl.level THEN
    PERFORM public.create_notification(
      _profile_id, 'level_up',
      'Subiu de nível!',
      'Agora é ' || _new_level::text,
      '/app?tab=pontuacoes'
    );
  END IF;

  RETURN jsonb_build_object(
    'xp_awarded', _xp_gain,
    'points_awarded', _pts_delta,
    'multiplier', _mult,
    'current_xp', _new_xp,
    'current_reward_points', _new_pts,
    'level', _new_level,
    'level_up', _new_level <> _lvl.level
  );
END;
$function$;

-- Streak milestone notification (inside the existing bonus branch).
CREATE OR REPLACE FUNCTION public.award_points(_profile_id uuid, _action_key text, _related_appointment_id uuid DEFAULT NULL::uuid, _rating integer DEFAULT NULL::integer, _context jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  IF _phone IS NULL OR length(regexp_replace(_phone, '\D', '', 'g')) < 9 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'phone_not_verified');
  END IF;

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

  IF _key = 'feedback_rating' THEN
    IF _rating IS NULL OR _rating < 1 OR _rating > 5 THEN
      RAISE EXCEPTION 'invalid_rating';
    END IF;
    _key := 'avaliacao_' || _rating::text;
  END IF;

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

  IF _key = 'checkin_diario' THEN
    SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id;
    _bonus_key := CASE WHEN _lvl.streak_days = 30 THEN 'streak_30'
                       WHEN _lvl.streak_days = 7 THEN 'streak_7' END;
    IF _bonus_key IS NOT NULL THEN
      SELECT * INTO _rule FROM public.points_rules WHERE role = _role AND action_key = _bonus_key;
      _result := public.apply_points(_profile_id, _rule.xp, _rule.points, _rule.label);
      _result := _result || jsonb_build_object('streak_bonus', _bonus_key);
      PERFORM public.create_notification(
        _profile_id, 'streak',
        'Streak de ' || _lvl.streak_days || ' dias!',
        '+' || _rule.points || ' pontos de bónus',
        '/app?tab=pontuacoes'
      );
    END IF;
    _result := _result || jsonb_build_object('streak_days', _lvl.streak_days);
  END IF;

  RETURN _result || jsonb_build_object('awarded', true, 'action_key', _key);
END;
$function$;

-- Feedback received notification.
CREATE OR REPLACE FUNCTION public.feedback_sync_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM public.recompute_profile_rating(OLD.to_profile_id);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    PERFORM public.recompute_profile_rating(NEW.to_profile_id);
  END IF;
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.to_profile_id, 'feedback_received',
      'Recebeu uma avaliação',
      NEW.rating || ' estrela' || CASE WHEN NEW.rating = 1 THEN '' ELSE 's' END
        || COALESCE(' — ' || NULLIF(NEW.comment, ''), ''),
      '/app?tab=pontuacoes'
    );
  END IF;
  RETURN NULL;
END;
$function$;
