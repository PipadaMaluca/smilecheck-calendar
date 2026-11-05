CREATE OR REPLACE FUNCTION public.guard_role_pending()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN
  IF NEW.role_pending IS DISTINCT FROM OLD.role_pending AND public.is_untrusted_caller() THEN
    RAISE EXCEPTION 'role_pending_protected';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_role_pending() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_guard_role_pending ON public.profiles;
CREATE TRIGGER trg_guard_role_pending BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_role_pending();