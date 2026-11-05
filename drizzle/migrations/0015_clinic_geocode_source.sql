ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS geocode_source text CHECK (geocode_source IN ('ban','photon'));

CREATE OR REPLACE FUNCTION public.guard_clinic_location()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.latitude := NULL; NEW.longitude := NULL;
    NEW.geocoded_address := NULL; NEW.geocode_status := NULL; NEW.geocoded_at := NULL; NEW.geocode_source := NULL;
    RETURN NEW;
  END IF;
  IF NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude
     OR NEW.geocoded_address IS DISTINCT FROM OLD.geocoded_address
     OR NEW.geocode_status IS DISTINCT FROM OLD.geocode_status
     OR NEW.geocoded_at IS DISTINCT FROM OLD.geocoded_at
     OR NEW.geocode_source IS DISTINCT FROM OLD.geocode_source
     OR NEW.address IS DISTINCT FROM OLD.address
     OR NEW.postal_code IS DISTINCT FROM OLD.postal_code
     OR NEW.city IS DISTINCT FROM OLD.city THEN
    RAISE EXCEPTION 'location_server_only';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_clinic_location() FROM PUBLIC, anon;