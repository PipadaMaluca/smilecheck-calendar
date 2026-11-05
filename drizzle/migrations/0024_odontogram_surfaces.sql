ALTER TABLE public.odontogram_entries ADD COLUMN surfaces jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.odontogram_entries DROP CONSTRAINT IF EXISTS odontogram_entries_status_check;
ALTER TABLE public.odontogram_entries ADD CONSTRAINT odontogram_entries_status_check
  CHECK (status IN ('saudavel','carie','restauracao','endodontia','coroa','implante','extracao','ausente','fratura','selante','protese','a_tratar','outro'));
DROP FUNCTION IF EXISTS public.add_odontogram_entry(uuid, uuid, integer, text[], text, text, uuid, uuid);
CREATE OR REPLACE FUNCTION public.add_odontogram_entry(_patient_id uuid, _clinic_id uuid, _tooth integer, _faces text[],
  _status text, _surfaces jsonb DEFAULT '{}'::jsonb, _notes text DEFAULT NULL, _family_member_id uuid DEFAULT NULL, _appointment_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  PERFORM public.assert_dossier_writer(_patient_id, _clinic_id);
  IF _family_member_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_family_member'; END IF;
  IF _appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = _appointment_id AND patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_appointment'; END IF;
  IF jsonb_typeof(coalesce(_surfaces,'{}'::jsonb)) <> 'object' OR length(_surfaces::text) > 2000 THEN RAISE EXCEPTION 'invalid_surfaces'; END IF;
  INSERT INTO odontogram_entries (patient_id, family_member_id, tooth, faces, status, surfaces, notes, author_id, clinic_id, appointment_id)
  VALUES (_patient_id, _family_member_id, _tooth, coalesce(_faces,'{}'), _status, coalesce(_surfaces,'{}'::jsonb), left(_notes, 1000), auth.uid(), _clinic_id, _appointment_id)
  RETURNING id INTO _id;
  RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.add_odontogram_entry(uuid, uuid, integer, text[], text, jsonb, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_odontogram_entry(uuid, uuid, integer, text[], text, jsonb, text, uuid, uuid) TO authenticated;