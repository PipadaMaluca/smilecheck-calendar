CREATE TABLE public.payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  active_env text NOT NULL DEFAULT 'sandbox' CHECK (active_env IN ('sandbox','live')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.payment_settings (id, active_env) VALUES (true, 'sandbox');

CREATE OR REPLACE FUNCTION public.sync_profile_plan(_user_id uuid, _env text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _plan text := 'free'; _active text;
BEGIN
  SELECT active_env INTO _active FROM public.payment_settings WHERE id;
  IF _active IS NULL OR _env IS DISTINCT FROM _active THEN
    RETURN NULL; -- events from a non-active environment never change the plan
  END IF;
  SELECT CASE WHEN s.price_id LIKE '%\_premium\_%' THEN 'premium' WHEN s.price_id LIKE '%\_pro\_%' THEN 'pro' ELSE 'free' END
    INTO _plan
    FROM public.subscriptions s
   WHERE s.user_id = _user_id AND s.environment = _env
     AND (s.status IN ('active','trialing','past_due') OR (s.status = 'canceled' AND s.current_period_end > now()))
     AND (s.current_period_end IS NULL OR s.current_period_end > now())
   ORDER BY s.created_at DESC LIMIT 1;
  _plan := coalesce(_plan, 'free');
  PERFORM set_config('app.trusted_write', 'on', true);
  UPDATE public.profiles SET plan = _plan WHERE id = _user_id;
  PERFORM set_config('app.trusted_write', 'off', true);
  RETURN _plan;
END $$;
REVOKE ALL ON FUNCTION public.sync_profile_plan(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profile_plan(uuid, text) TO service_role;