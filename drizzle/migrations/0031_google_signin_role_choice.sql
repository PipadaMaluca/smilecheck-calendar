ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_pending boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role; _lang public.app_language; _name text; _terms boolean; _pending boolean;
BEGIN
  IF lower(COALESCE(NEW.email, '')) LIKE '%@seed.smilecheck.app' THEN
    RAISE EXCEPTION 'reserved_email_domain';
  END IF;
  -- Social sign-ups carry no app metadata: the user picks the role afterwards via choose_initial_role.
  _pending := NULLIF(NEW.raw_user_meta_data->>'role','') IS NULL
              AND COALESCE(NEW.raw_app_meta_data->>'provider','email') <> 'email';
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'patient');
  _lang := COALESCE(NULLIF(NEW.raw_user_meta_data->>'language','')::public.app_language, 'pt');
  _name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NULLIF(NEW.raw_user_meta_data->>'name',''), NEW.email);
  _terms := COALESCE(NEW.raw_user_meta_data->>'terms_accepted', '') = 'true';

  INSERT INTO public.profiles (id, role, full_name, email, phone, language, terms_accepted_at, terms_version, role_pending)
  VALUES (NEW.id, _role, _name, NEW.email, NULLIF(NEW.raw_user_meta_data->>'phone',''), _lang,
          CASE WHEN _terms THEN now() END,
          CASE WHEN _terms THEN left(NULLIF(NEW.raw_user_meta_data->>'terms_version',''), 40) END, _pending)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_levels (id, current_xp, current_reward_points, level, streak_days, best_streak)
  VALUES (NEW.id, 0, 0, 'Lata', 0, 0) ON CONFLICT (id) DO NOTHING;
  IF _pending THEN RETURN NEW; END IF;
  IF _role = 'patient' THEN
    INSERT INTO public.patients (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'dentist' THEN
    INSERT INTO public.dentists (id, rpps_number) VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'rpps_number',''))
    ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'clinic' THEN
    INSERT INTO public.clinics (owner_profile_id, name, address, phone, email)
    VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'clinic_name',''), _name),
            NULLIF(NEW.raw_user_meta_data->>'address',''), NULLIF(NEW.raw_user_meta_data->>'phone',''), NEW.email);
  END IF;
  RETURN NEW;
END $function$;

-- One-time role choice for social sign-ups. Professionals start 'pendente' like every new professional.
CREATE OR REPLACE FUNCTION public.choose_initial_role(_role public.app_role, _clinic_name text DEFAULT NULL, _order_number text DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _p public.profiles%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO _p FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF NOT FOUND OR NOT _p.role_pending THEN RAISE EXCEPTION 'role_already_chosen'; END IF;
  IF _role = 'clinic' AND NULLIF(btrim(COALESCE(_clinic_name,'')),'') IS NULL THEN RAISE EXCEPTION 'clinic_name_required'; END IF;
  PERFORM set_config('app.trusted_write','on',true);
  UPDATE public.profiles SET role = _role, role_pending = false WHERE id = _uid;
  IF _role = 'patient' THEN
    INSERT INTO public.patients (id) VALUES (_uid) ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'dentist' THEN
    INSERT INTO public.dentists (id, rpps_number) VALUES (_uid, NULLIF(left(btrim(COALESCE(_order_number,'')),40),''))
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.clinics (owner_profile_id, name, email) VALUES (_uid, left(btrim(_clinic_name),200), _p.email);
  END IF;
  PERFORM set_config('app.trusted_write','off',true);
END $function$;
REVOKE ALL ON FUNCTION public.choose_initial_role(public.app_role, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.choose_initial_role(public.app_role, text, text) TO authenticated;