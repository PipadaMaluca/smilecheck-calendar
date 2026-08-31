REVOKE EXECUTE ON FUNCTION public.can_notify_profile(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_notify_profile(uuid) TO authenticated, service_role;