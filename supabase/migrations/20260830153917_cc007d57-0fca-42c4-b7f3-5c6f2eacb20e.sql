CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _lang public.app_language;
  _name text;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'patient');
  _lang := COALESCE(NULLIF(NEW.raw_user_meta_data->>'language','')::public.app_language, 'pt');
  _name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email);

  INSERT INTO public.profiles (id, role, full_name, email, phone, language)
  VALUES (NEW.id, _role, _name, NEW.email, NULLIF(NEW.raw_user_meta_data->>'phone',''), _lang)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_levels (id, current_xp, current_reward_points, level, streak_days, best_streak)
  VALUES (NEW.id, 0, 0, 'Lata', 0, 0)
  ON CONFLICT (id) DO NOTHING;

  IF _role = 'patient' THEN
    INSERT INTO public.patients (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'dentist' THEN
    INSERT INTO public.dentists (id, rpps_number)
    VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'rpps_number',''))
    ON CONFLICT (id) DO NOTHING;
  ELSIF _role = 'clinic' THEN
    INSERT INTO public.clinics (owner_profile_id, name, address, phone, email)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'clinic_name',''), _name),
      NULLIF(NEW.raw_user_meta_data->>'address',''),
      NULLIF(NEW.raw_user_meta_data->>'phone',''),
      NEW.email
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();