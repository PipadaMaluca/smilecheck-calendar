ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS geocoded_address text,
  ADD COLUMN IF NOT EXISTS geocode_status text CHECK (geocode_status IN ('ok','not_found','error')),
  ADD COLUMN IF NOT EXISTS geocoded_at timestamptz;

-- Address, coordinates and geocoding fields are written only by the clinic-address server function.
CREATE OR REPLACE FUNCTION public.guard_clinic_location()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.latitude := NULL; NEW.longitude := NULL;
    NEW.geocoded_address := NULL; NEW.geocode_status := NULL; NEW.geocoded_at := NULL;
    RETURN NEW;
  END IF;
  IF NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude
     OR NEW.geocoded_address IS DISTINCT FROM OLD.geocoded_address
     OR NEW.geocode_status IS DISTINCT FROM OLD.geocode_status
     OR NEW.geocoded_at IS DISTINCT FROM OLD.geocoded_at
     OR NEW.address IS DISTINCT FROM OLD.address
     OR NEW.postal_code IS DISTINCT FROM OLD.postal_code
     OR NEW.city IS DISTINCT FROM OLD.city THEN
    RAISE EXCEPTION 'location_server_only';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_clinic_location() FROM PUBLIC, anon;
DROP TRIGGER IF EXISTS trg_guard_clinic_location ON public.clinics;
CREATE TRIGGER trg_guard_clinic_location BEFORE INSERT OR UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.guard_clinic_location();

-- Global 1 request/second throttle for the geocoding service (shared by every function instance).
CREATE TABLE IF NOT EXISTS public.geocode_throttle (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  last_request_at timestamptz NOT NULL DEFAULT 'epoch'
);
GRANT ALL ON public.geocode_throttle TO service_role;
ALTER TABLE public.geocode_throttle ENABLE ROW LEVEL SECURITY;
INSERT INTO public.geocode_throttle (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.claim_geocode_slot()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _last timestamptz; _wait double precision;
BEGIN
  SELECT last_request_at INTO _last FROM geocode_throttle WHERE id FOR UPDATE;
  _wait := 1.1 - extract(epoch FROM (clock_timestamp() - _last));
  IF _wait > 0 THEN PERFORM pg_sleep(least(_wait, 1.1)); END IF;
  UPDATE geocode_throttle SET last_request_at = clock_timestamp() WHERE id;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_geocode_slot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_geocode_slot() TO service_role;

-- Spoken languages: closed ISO list.
CREATE OR REPLACE FUNCTION public.validate_search_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'clinics' THEN
    IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN RAISE EXCEPTION 'invalid_latitude'; END IF;
    IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN RAISE EXCEPTION 'invalid_longitude'; END IF;
    IF (NEW.latitude IS NULL) <> (NEW.longitude IS NULL) THEN RAISE EXCEPTION 'coordinates_incomplete'; END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM unnest(NEW.spoken_languages) l
               WHERE l IS NULL OR l NOT IN ('pt','fr','en','es','it','de','ar','nl','ro','pl','ru','uk','zh','tr')) THEN
      RAISE EXCEPTION 'invalid_language';
    END IF;
    NEW.spoken_languages := ARRAY(SELECT DISTINCT l FROM unnest(NEW.spoken_languages) l ORDER BY l);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_search_fields() FROM PUBLIC, anon;