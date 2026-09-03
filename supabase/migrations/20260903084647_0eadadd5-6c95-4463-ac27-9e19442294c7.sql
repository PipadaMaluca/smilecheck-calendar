CREATE OR REPLACE FUNCTION public.check_achievements(_profile_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _caller uuid := auth.uid();
  _role public.app_role;
  _created timestamptz;
  _m jsonb := '{}'::jsonb;
  _def record;
  _row public.achievements;
  _computed integer;
  _unlocked jsonb := '[]'::jsonb;
  _bonus_total integer := 0;
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT role, created_at INTO _role, _created FROM public.profiles WHERE id = _profile_id;
  IF _role IS NULL THEN
    RAISE EXCEPTION 'unknown_profile';
  END IF;

  IF _caller <> _profile_id
     AND NOT public.treats_patient(_profile_id)
     AND NOT EXISTS (
       SELECT 1 FROM public.appointments a
        WHERE (a.patient_id = _caller OR a.dentist_id = _caller OR public.owns_clinic(a.clinic_id) OR public.is_clinic_member(a.clinic_id))
          AND (a.patient_id = _profile_id OR a.dentist_id = _profile_id
               OR EXISTS (SELECT 1 FROM public.clinics c WHERE c.id = a.clinic_id AND c.owner_profile_id = _profile_id))
     ) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  _m := _m || jsonb_build_object(
    'months_active', GREATEST(0, floor(EXTRACT(EPOCH FROM (now() - COALESCE(_created, now()))) / 2629800))::int,
    'best_streak', COALESCE((SELECT GREATEST(best_streak, streak_days) FROM public.user_levels WHERE id = _profile_id), 0),
    'checkins', (SELECT count(*) FROM public.daily_checkins WHERE profile_id = _profile_id),
    'feedback_given', (SELECT count(*) FROM public.feedback WHERE from_profile_id = _profile_id),
    'feedback_received', (SELECT count(*) FROM public.feedback WHERE to_profile_id = _profile_id)
  );

  IF _role = 'patient' THEN
    _m := _m || jsonb_build_object(
      'completed', (SELECT count(*) FROM public.appointments WHERE patient_id = _profile_id AND status = 'concluida'),
      'completed_12m', (SELECT count(*) FROM public.appointments
                         WHERE patient_id = _profile_id AND status = 'concluida'
                           AND scheduled_at > now() - interval '12 months'),
      'teleconsults', (SELECT count(*) FROM public.appointments
                        WHERE patient_id = _profile_id AND status = 'concluida' AND is_teleconsultation),
      'clinics_visited', (SELECT count(DISTINCT clinic_id) FROM public.appointments
                           WHERE patient_id = _profile_id AND status = 'concluida' AND clinic_id IS NOT NULL),
      'same_dentist_max', COALESCE((SELECT max(c) FROM (
                             SELECT count(*) AS c FROM public.appointments
                              WHERE patient_id = _profile_id AND status = 'concluida' AND dentist_id IS NOT NULL
                              GROUP BY dentist_id) s), 0),
      'scalings', (SELECT count(*) FROM public.appointments
                    WHERE patient_id = _profile_id AND status = 'concluida'
                      AND consultation_type = 'destartarizacao'),
      'early_appointments', (SELECT count(*) FROM public.appointments
                              WHERE patient_id = _profile_id AND status = 'concluida'
                                AND EXTRACT(HOUR FROM scheduled_at) < 9),
      'punctual', (SELECT count(*) FROM public.points_ledger l
                    WHERE l.profile_id = _profile_id AND l.type = 'xp'
                      AND l.reason IN (SELECT label FROM public.points_rules WHERE action_key = 'chegou_a_horas')),
      'collaborated', (SELECT count(*) FROM public.points_ledger l
                        WHERE l.profile_id = _profile_id AND l.type = 'xp'
                          AND l.reason IN (SELECT label FROM public.points_rules WHERE action_key = 'colaborou')),
      'referrals', (SELECT count(*) FROM public.points_ledger l
                     WHERE l.profile_id = _profile_id AND l.type = 'xp'
                       AND l.reason IN (SELECT label FROM public.points_rules WHERE action_key = 'convidar_amigo'))
    );
  ELSIF _role = 'dentist' THEN
    _m := _m || jsonb_build_object(
      'completed', (SELECT count(*) FROM public.appointments WHERE dentist_id = _profile_id AND status = 'concluida'),
      'completed_in_person', (SELECT count(*) FROM public.appointments
                               WHERE dentist_id = _profile_id AND status = 'concluida' AND NOT is_teleconsultation),
      'teleconsults', (SELECT count(*) FROM public.appointments
                        WHERE dentist_id = _profile_id AND status = 'concluida' AND is_teleconsultation),
      'late_appointments', (SELECT count(*) FROM public.appointments
                             WHERE dentist_id = _profile_id AND status = 'concluida'
                               AND EXTRACT(HOUR FROM scheduled_at) >= 20),
      'max_day_appointments', COALESCE((SELECT max(c) FROM (
                                 SELECT count(*) AS c FROM public.appointments
                                  WHERE dentist_id = _profile_id AND status = 'concluida'
                                  GROUP BY (scheduled_at AT TIME ZONE 'utc')::date) s), 0)
    );
  ELSE
    _m := _m || jsonb_build_object(
      'completed', (SELECT count(*) FROM public.appointments a JOIN public.clinics c ON c.id = a.clinic_id
                     WHERE c.owner_profile_id = _profile_id AND a.status = 'concluida'),
      'teleconsults', (SELECT count(*) FROM public.appointments a JOIN public.clinics c ON c.id = a.clinic_id
                        WHERE c.owner_profile_id = _profile_id AND a.status = 'concluida' AND a.is_teleconsultation),
      'team_size', (SELECT count(DISTINCT m.dentist_id) FROM public.clinic_members m
                     JOIN public.clinics c ON c.id = m.clinic_id
                     WHERE c.owner_profile_id = _profile_id)
    );
  END IF;

  FOR _def IN SELECT * FROM public.achievement_defs WHERE role = _role ORDER BY sort_order LOOP
    INSERT INTO public.achievements (profile_id, achievement_key, unlocked, progress, target)
    VALUES (_profile_id, _def.achievement_key, false, 0, _def.target)
    ON CONFLICT (profile_id, achievement_key) DO NOTHING;

    SELECT * INTO _row FROM public.achievements
     WHERE profile_id = _profile_id AND achievement_key = _def.achievement_key
     FOR UPDATE;

    IF _def.metric IS NULL OR NOT (_m ? _def.metric) THEN
      _computed := _row.progress;
    ELSE
      _computed := (_m ->> _def.metric)::int;
    END IF;

    IF _computed <> _row.progress OR _row.target <> _def.target THEN
      UPDATE public.achievements
         SET progress = _computed, target = _def.target
       WHERE id = _row.id;
    END IF;

    IF NOT _row.unlocked AND _computed >= _def.target THEN
      UPDATE public.achievements
         SET unlocked = true, unlocked_at = now()
       WHERE id = _row.id;

      IF _def.bonus_points > 0 THEN
        PERFORM public.apply_points(
          _profile_id, _def.bonus_points, _def.bonus_points,
          'Conquista: ' || _def.achievement_key, NULL
        );
        _bonus_total := _bonus_total + _def.bonus_points;
      END IF;

      PERFORM public.create_notification(
        _profile_id, 'achievement',
        'Conquista desbloqueada!',
        CASE WHEN _def.bonus_points > 0
             THEN '+' || _def.bonus_points || ' pontos'
             ELSE 'Nova conquista adicionada ao seu perfil' END,
        '/app?tab=conquistas'
      );

      _unlocked := _unlocked || jsonb_build_object(
        'achievement_key', _def.achievement_key,
        'bonus_points', _def.bonus_points,
        'secret', _def.secret
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'profile_id', _profile_id,
    'unlocked', _unlocked,
    'unlocked_count', jsonb_array_length(_unlocked),
    'bonus_points_awarded', _bonus_total
  );
END;
$function$;
