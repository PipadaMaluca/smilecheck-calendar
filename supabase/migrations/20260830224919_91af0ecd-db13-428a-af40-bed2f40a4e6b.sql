REVOKE ALL ON FUNCTION public.recompute_profile_rating(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.feedback_sync_rating() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.can_rate_appointment(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_rate_appointment(uuid, uuid) TO authenticated;
