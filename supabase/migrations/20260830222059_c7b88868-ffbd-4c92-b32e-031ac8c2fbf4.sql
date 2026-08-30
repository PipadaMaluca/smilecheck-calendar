CREATE TYPE public.redemption_status AS ENUM ('pendente', 'usado', 'expirado');

CREATE TABLE public.rewards_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_key text NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  category text NOT NULL,
  subcategory text,
  brand text,
  discount text,
  emoji text,
  sponsored boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rewards_catalog TO authenticated;
GRANT SELECT ON public.rewards_catalog TO anon;
GRANT ALL ON public.rewards_catalog TO service_role;

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog is readable" ON public.rewards_catalog
  FOR SELECT USING (true);

CREATE TRIGGER rewards_catalog_updated_at BEFORE UPDATE ON public.rewards_catalog
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX rewards_catalog_role_idx ON public.rewards_catalog (role, points_cost);

CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_key text NOT NULL,
  reward_name text NOT NULL,
  points_cost integer NOT NULL,
  redemption_code text NOT NULL UNIQUE,
  status public.redemption_status NOT NULL DEFAULT 'pendente',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.redemptions TO authenticated;
GRANT ALL ON public.redemptions TO service_role;

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own redemptions readable" ON public.redemptions
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE TRIGGER redemptions_updated_at BEFORE UPDATE ON public.redemptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX redemptions_profile_idx ON public.redemptions (profile_id, created_at DESC);

-- Unique, human-readable redemption code: SC-XXX-YYYYYY
CREATE OR REPLACE FUNCTION public.generate_redemption_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  _chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  _letters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  _code text;
  _i integer;
BEGIN
  LOOP
    _code := 'SC-';
    FOR _i IN 1..3 LOOP
      _code := _code || substr(_letters, 1 + floor(random() * 26)::int, 1);
    END LOOP;
    _code := _code || '-';
    FOR _i IN 1..6 LOOP
      _code := _code || substr(_chars, 1 + floor(random() * 36)::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.redemptions WHERE redemption_code = _code);
  END LOOP;
  RETURN _code;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_redemption_code() FROM PUBLIC, anon, authenticated;

-- Single, atomic writer for reward-point spending.
CREATE OR REPLACE FUNCTION public.redeem_reward(_profile_id uuid, _reward_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _reward public.rewards_catalog;
  _role public.app_role;
  _lvl public.user_levels;
  _code text;
  _expires timestamptz := now() + interval '30 days';
  _redemption public.redemptions;
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  -- Users may only spend their OWN reward points.
  IF _caller <> _profile_id THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  SELECT role INTO _role FROM public.profiles WHERE id = _profile_id;
  IF _role IS NULL THEN
    RAISE EXCEPTION 'unknown_profile';
  END IF;

  SELECT * INTO _reward
    FROM public.rewards_catalog
   WHERE reward_key = _reward_key AND active;
  IF _reward.id IS NULL THEN
    RAISE EXCEPTION 'unknown_reward';
  END IF;
  IF _reward.role <> _role THEN
    RAISE EXCEPTION 'reward_not_available_for_role';
  END IF;

  -- Row lock serialises concurrent redemptions: no double-spend.
  INSERT INTO public.user_levels (id) VALUES (_profile_id) ON CONFLICT (id) DO NOTHING;
  SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id FOR UPDATE;

  IF _lvl.current_reward_points < _reward.points_cost THEN
    RETURN jsonb_build_object(
      'redeemed', false,
      'reason', 'insufficient_points',
      'points_cost', _reward.points_cost,
      'current_reward_points', _lvl.current_reward_points
    );
  END IF;

  _code := public.generate_redemption_code();

  -- Everything below runs in the caller's transaction: any failure rolls back
  -- the deduction, the ledger row and the redemption together.
  UPDATE public.user_levels
     SET current_reward_points = current_reward_points - _reward.points_cost
   WHERE id = _profile_id;

  -- XP is lifetime and must never be touched by spending.
  INSERT INTO public.points_ledger (profile_id, type, amount, reason, multiplier_applied)
  VALUES (_profile_id, 'reward_points', -_reward.points_cost, 'Resgate: ' || _reward.name, 1.0);

  INSERT INTO public.redemptions (profile_id, reward_key, reward_name, points_cost, redemption_code, status, expires_at)
  VALUES (_profile_id, _reward.reward_key, _reward.name, _reward.points_cost, _code, 'pendente', _expires)
  RETURNING * INTO _redemption;

  SELECT * INTO _lvl FROM public.user_levels WHERE id = _profile_id;

  RETURN jsonb_build_object(
    'redeemed', true,
    'redemption_id', _redemption.id,
    'reward_key', _redemption.reward_key,
    'reward_name', _redemption.reward_name,
    'points_cost', _redemption.points_cost,
    'redemption_code', _redemption.redemption_code,
    'status', _redemption.status,
    'expires_at', _redemption.expires_at,
    'current_reward_points', _lvl.current_reward_points,
    'current_xp', _lvl.current_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_reward(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, text) TO authenticated;