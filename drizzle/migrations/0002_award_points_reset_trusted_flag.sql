DO $do$
DECLARE _def text;
BEGIN
  SELECT pg_get_functiondef('public.award_points(uuid,text,uuid,integer,jsonb)'::regprocedure) INTO _def;
  IF position('trusted_write'', ''off'', true); RETURN jsonb_build_object(''awarded'', false' in _def) = 0 THEN
    _def := replace(_def, 'RETURN jsonb_build_object(''awarded'', false',
      'PERFORM set_config(''app.trusted_write'', ''off'', true); RETURN jsonb_build_object(''awarded'', false');
    EXECUTE _def;
  END IF;
END $do$;