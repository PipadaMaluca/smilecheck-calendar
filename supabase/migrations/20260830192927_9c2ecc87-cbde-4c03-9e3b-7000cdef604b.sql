REVOKE EXECUTE ON FUNCTION public.treats_patient(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.owns_clinic(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.current_role_is(public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.treats_patient(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_clinic(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_role_is(public.app_role) TO authenticated;