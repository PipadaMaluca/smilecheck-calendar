DO $do$
DECLARE _def text;
BEGIN
  SELECT pg_get_functiondef('public.check_achievements(uuid)'::regprocedure) INTO _def;
  IF position('app.trusted_write' in _def) = 0 THEN
    _def := replace(_def, E'RAISE EXCEPTION ''unknown_profile'';\n  END IF;',
                    E'RAISE EXCEPTION ''unknown_profile'';\n  END IF;\n  PERFORM set_config(''app.trusted_write'', ''on'', true);');
    IF position('app.trusted_write' in _def) = 0 THEN
      RAISE EXCEPTION 'patch_anchor_not_found';
    END IF;
    EXECUTE _def;
  END IF;
END $do$;