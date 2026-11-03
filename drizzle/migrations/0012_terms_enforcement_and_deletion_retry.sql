-- 1. Terms acceptance enforced server-side.
-- Bump this value (in a new migration) together with TERMS_VERSION in src/lib/support.ts.
CREATE OR REPLACE FUNCTION public.current_terms_version()
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$ SELECT '2026-11-03-draft'::text $$;

CREATE OR REPLACE FUNCTION public.has_accepted_terms(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p
    WHERE p.id = _uid AND p.terms_accepted_at IS NOT NULL AND p.terms_version = public.current_terms_version())
$$;

CREATE OR REPLACE FUNCTION public.accept_terms(_version text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _version IS DISTINCT FROM public.current_terms_version() THEN RAISE EXCEPTION 'terms_version_outdated'; END IF;
  PERFORM set_config('app.trusted_write', 'on', true);
  UPDATE public.profiles SET terms_accepted_at = now(), terms_version = _version WHERE id = _uid;
  PERFORM set_config('app.trusted_write', 'off', true);
EXCEPTION WHEN OTHERS THEN
  PERFORM set_config('app.trusted_write', 'off', true);
  RAISE;
END $$;

-- Rejects writes by signed-in clients that have not accepted the current terms.
CREATE OR REPLACE FUNCTION public.require_terms_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'authenticated' AND auth.uid() IS NOT NULL AND NOT public.has_accepted_terms(auth.uid()) THEN
    RAISE EXCEPTION 'terms_not_accepted' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_terms_appointments ON public.appointments;
CREATE TRIGGER trg_terms_appointments BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.require_terms_accepted();
DROP TRIGGER IF EXISTS trg_terms_feedback ON public.feedback;
CREATE TRIGGER trg_terms_feedback BEFORE INSERT ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.require_terms_accepted();
DROP TRIGGER IF EXISTS trg_terms_waiting_list ON public.waiting_list;
CREATE TRIGGER trg_terms_waiting_list BEFORE INSERT ON public.waiting_list FOR EACH ROW EXECUTE FUNCTION public.require_terms_accepted();
DROP TRIGGER IF EXISTS trg_terms_referrals ON public.referrals;
CREATE TRIGGER trg_terms_referrals BEFORE INSERT ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.require_terms_accepted();
DROP TRIGGER IF EXISTS trg_terms_redemptions ON public.redemptions;
CREATE TRIGGER trg_terms_redemptions BEFORE INSERT ON public.redemptions FOR EACH ROW EXECUTE FUNCTION public.require_terms_accepted();

REVOKE ALL ON FUNCTION public.current_terms_version() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_accepted_terms(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_terms(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.require_terms_accepted() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_terms_version() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_accepted_terms(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_terms(text) TO authenticated;

-- 2. Account deletion retries: pending requests keep attempts and the last error for support.
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE public.account_deletion_requests ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_pending ON public.account_deletion_requests(status) WHERE status = 'pending';