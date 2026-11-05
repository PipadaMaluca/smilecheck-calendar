CREATE OR REPLACE FUNCTION public.guard_avatar_url()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
     AND position(('/storage/v1/object/public/avatars/' || NEW.id::text || '/') IN NEW.avatar_url) = 0
     AND position(('/storage/v1/object/sign/avatars/' || NEW.id::text || '/') IN NEW.avatar_url) = 0 THEN
    RAISE EXCEPTION 'invalid_avatar_url';
  END IF;
  RETURN NEW;
END $$;