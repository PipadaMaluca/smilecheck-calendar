REVOKE ALL ON public.conversations, public.messages FROM anon, PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.conversations, public.messages FROM authenticated;
GRANT SELECT ON public.conversations, public.messages TO authenticated;
REVOKE ALL ON public.dentist_availability FROM anon, PUBLIC;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.dentist_availability FROM authenticated;