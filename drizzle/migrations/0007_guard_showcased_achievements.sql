CREATE OR REPLACE FUNCTION public.guard_showcased_achievements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE _bad text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.showcased_achievements IS NOT DISTINCT FROM OLD.showcased_achievements THEN RETURN NEW; END IF;
  -- Remove duplicates, keeping the user's order.
  NEW.showcased_achievements := ARRAY(
    SELECT k FROM (SELECT k, min(o) o FROM unnest(NEW.showcased_achievements) WITH ORDINALITY u(k, o) GROUP BY k) s ORDER BY o);
  IF NOT public.is_untrusted_caller() OR NEW.is_seed THEN RETURN NEW; END IF;
  SELECT k INTO _bad FROM unnest(NEW.showcased_achievements) k
   WHERE NOT EXISTS (SELECT 1 FROM achievements a WHERE a.profile_id = NEW.id AND a.achievement_key = k AND a.unlocked)
   LIMIT 1;
  IF _bad IS NOT NULL THEN RAISE EXCEPTION 'showcase_not_unlocked'; END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_showcased_achievements() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_guard_showcased_achievements
  BEFORE INSERT OR UPDATE OF showcased_achievements ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_showcased_achievements();