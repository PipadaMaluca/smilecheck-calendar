REVOKE EXECUTE ON FUNCTION public.award_points(uuid, text, uuid, integer, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.level_for_xp(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.level_multiplier(public.level_tier) FROM anon, PUBLIC;