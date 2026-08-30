-- ============ POINTS RULES ============
CREATE TABLE public.points_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  action_key text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  is_evaluation boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, action_key)
);
GRANT SELECT ON public.points_rules TO authenticated;
GRANT SELECT ON public.points_rules TO anon;
GRANT ALL ON public.points_rules TO service_role;
ALTER TABLE public.points_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rules are public" ON public.points_rules FOR SELECT USING (true);
CREATE TRIGGER points_rules_updated_at BEFORE UPDATE ON public.points_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.points_rules (role, action_key, xp, points, label, is_evaluation) VALUES
-- PATIENT (2x values)
('patient','confirmacao_24h',2,2,'Confirmação 24h',false),
('patient','confirmacao_1h',2,2,'Confirmação 1h',false),
('patient','compareceu',10,10,'Compareceu',true),
('patient','chegou_a_horas',4,4,'Chegou a horas',false),
('patient','colaborou',4,4,'Colaborou durante consulta',false),
('patient','higiene_oral',4,4,'Higiene oral adequada',false),
('patient','seguiu_recomendacoes',4,4,'Seguiu recomendações',false),
('patient','convidar_amigo',10,10,'Convidar amigo',false),
('patient','checkin_diario',2,2,'Check-in diário',false),
('patient','streak_7',10,10,'Streak 7 dias',false),
('patient','streak_30',30,30,'Streak 30 dias',false),
('patient','falta',0,-16,'Falta não justificada',true),
('patient','penalizacao_confirmacao',0,-2,'Penalização por confirmação',false),
('patient','cancelamento_tardio',0,-2,'Cancelamento tardio',false),
('patient','avaliacao_1',0,-5,'Avaliação 1★',true),
('patient','avaliacao_2',0,-2,'Avaliação 2★',true),
('patient','avaliacao_3',5,5,'Avaliação 3★',true),
('patient','avaliacao_4',6,6,'Avaliação 4★',true),
('patient','avaliacao_5',10,10,'Avaliação 5★',true),
-- DENTIST (1x)
('dentist','consulta_concluida',8,8,'Consulta concluída',true),
('dentist','teleconsulta',10,10,'Teleconsulta',true),
('dentist','mensagem_24h',2,2,'Responder mensagem em 24h',false),
('dentist','emitir_receita',1,1,'Emitir receita',false),
('dentist','carta_referencia',2,2,'Carta de referência',false),
('dentist','checkin_diario',1,1,'Check-in diário',false),
('dentist','streak_7',5,5,'Streak 7 dias',false),
('dentist','streak_30',15,15,'Streak 30 dias',false),
('dentist','cancelamento_tardio',0,-5,'Cancelamento de consulta tardio',false),
('dentist','mensagem_48h_sem_resposta',0,-2,'Não responder mensagem 48h',false),
('dentist','avaliacao_1',0,-5,'Avaliação 1★',true),
('dentist','avaliacao_2',0,-2,'Avaliação 2★',true),
('dentist','avaliacao_3',5,5,'Avaliação 3★',true),
('dentist','avaliacao_4',10,10,'Avaliação 4★',true),
('dentist','avaliacao_5',15,15,'Avaliação 5★',true),
-- CLINIC (1x)
('clinic','consulta_clinica',3,3,'Consulta na clínica',true),
('clinic','teleconsulta',5,5,'Teleconsulta',true),
('clinic','novo_dentista_ativo',15,15,'Novo dentista ativo',false),
('clinic','taxa_confirmacao_90',10,10,'Taxa confirmação >90% (semanal)',false),
('clinic','checkin_diario',1,1,'Check-in diário',false),
('clinic','streak_7',5,5,'Streak 7 dias',false),
('clinic','streak_30',15,15,'Streak 30 dias',false),
('clinic','reclamacao_nao_resolvida',0,-10,'Reclamação não resolvida',false),
('clinic','avaliacao_1',0,-5,'Avaliação 1★',true),
('clinic','avaliacao_2',0,-2,'Avaliação 2★',true),
('clinic','avaliacao_3',5,5,'Avaliação 3★',true),
('clinic','avaliacao_4',10,10,'Avaliação 4★',true),
('clinic','avaliacao_5',15,15,'Avaliação 5★',true);

-- ============ DAILY CHECK-INS (one per day per profile) ============
CREATE TABLE public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, checkin_date)
);
GRANT SELECT ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own checkins readable" ON public.daily_checkins FOR SELECT TO authenticated USING (profile_id = auth.uid());

-- ============ LEVEL HELPERS ============
CREATE OR REPLACE FUNCTION public.level_for_xp(_xp integer)
RETURNS public.level_tier
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _xp >= 7000 THEN 'Adamantino'
    WHEN _xp >= 3500 THEN 'Diamante'
    WHEN _xp >= 1500 THEN 'Platina'
    WHEN _xp >= 700  THEN 'Ouro'
    WHEN _xp >= 300  THEN 'Prata'
    WHEN _xp >= 100  THEN 'Bronze'
    ELSE 'Lata'
  END::public.level_tier;
$$;

CREATE OR REPLACE FUNCTION public.level_multiplier(_level public.level_tier)
RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _level
    WHEN 'Lata' THEN 1.0
    WHEN 'Bronze' THEN 1.1
    WHEN 'Prata' THEN 1.3
    WHEN 'Ouro' THEN 1.5
    WHEN 'Platina' THEN 2.0
    WHEN 'Diamante' THEN 2.5
    WHEN 'Adamantino' THEN 3.0
    ELSE 1.0
  END::numeric;
$$;

-- ============ CORE WRITER (internal, no auth checks) ============
CREATE OR REPLACE FUNCTION public.apply_points(
  _profile_id uuid,
  _xp integer,
  _points integer,
  _reason text,
  _related_appointment_id uuid DEFAULT NULL,
  _multiplier numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  -- XP is raw (never multiplied) and never decreases.
  _xp_gain := GREATEST(COALESCE(_xp, 0), 0);
  -- Reward points: multiplier on gains only, penalties applied at face value.
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
$$;
REVOKE ALL ON FUNCTION public.apply_points(uuid, integer, integer, text, uuid, numeric) FROM PUBLIC, anon, authenticated;

-- ============ PUBLIC ENTRY POINT ============
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

  -- Composite attendance / no-show formula (patient values already doubled).
  _confirms := LEAST(GREATEST(COALESCE((_context->>'confirmations')::int, 0), 0), 2);
  IF _key = 'compareceu' AND _role = 'patient' THEN
    _xp := 13 + _confirms;
    _pts := 13 + _confirms;
  ELSIF _key = 'falta' AND _role = 'patient' THEN
    _xp := 0;
    _pts := -16 - (2 * _confirms);
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
REVOKE ALL ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) TO authenticated;

-- ============ LOCK DOWN CLIENT WRITES TO LEVELS ============
DROP POLICY IF EXISTS "Own level insert" ON public.user_levels;
DROP POLICY IF EXISTS "Own level update" ON public.user_levels;
REVOKE INSERT, UPDATE, DELETE ON public.user_levels FROM authenticated;
