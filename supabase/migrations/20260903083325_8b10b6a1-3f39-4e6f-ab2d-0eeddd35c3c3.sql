REVOKE EXECUTE ON FUNCTION public.check_achievements(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_achievements(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_achievements(uuid) TO service_role;