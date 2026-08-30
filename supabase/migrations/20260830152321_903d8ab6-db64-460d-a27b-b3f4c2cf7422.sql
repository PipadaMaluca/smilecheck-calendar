REVOKE EXECUTE ON FUNCTION public.current_role_is(public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_clinic(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_role_is(public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_clinic(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated, service_role;
