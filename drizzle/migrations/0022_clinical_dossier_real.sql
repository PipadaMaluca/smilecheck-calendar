-- Clinical dossier: notes (+immutable versions), odontogram, treatment plans, documents, triage answers.
CREATE OR REPLACE FUNCTION public.is_professional_of_clinic(_clinic_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND (public.owns_clinic(_clinic_id) OR public.is_clinic_member(_clinic_id));
$$;

-- Writer check: professional of the clinic, active relationship and inside the 12-month edit window.
CREATE OR REPLACE FUNCTION public.assert_dossier_writer(_patient uuid, _clinic uuid)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT (public.current_role_is('dentist') OR public.current_role_is('clinic')) THEN RAISE EXCEPTION 'not_professional'; END IF;
  IF _clinic IS NULL OR NOT public.is_professional_of_clinic(_clinic) THEN RAISE EXCEPTION 'not_clinic_professional'; END IF;
  IF NOT public.can_read_dossier(_patient) THEN RAISE EXCEPTION 'no_active_relationship'; END IF;
  IF NOT public.can_edit_patient(_patient) THEN RAISE EXCEPTION 'edit_window_closed'; END IF;
END $$;

CREATE TABLE public.clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id),
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  motivo text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  diagnostico text NOT NULL DEFAULT '',
  tratamento text NOT NULL DEFAULT '',
  proximos_passos text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, author_id)
);
CREATE INDEX ON public.clinical_notes(patient_id);
CREATE INDEX ON public.clinical_notes(author_id);
CREATE INDEX ON public.clinical_notes(clinic_id);
CREATE INDEX ON public.clinical_notes(family_member_id);
GRANT SELECT ON public.clinical_notes TO authenticated;
GRANT ALL ON public.clinical_notes TO service_role;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes: author or active relationship" ON public.clinical_notes FOR SELECT TO authenticated
  USING (author_id = (select auth.uid()) OR public.can_read_dossier(patient_id));

CREATE TABLE public.clinical_note_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.clinical_notes(id),
  version integer NOT NULL,
  motivo text NOT NULL, observacoes text NOT NULL, diagnostico text NOT NULL,
  tratamento text NOT NULL, proximos_passos text NOT NULL,
  edited_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (note_id, version)
);
CREATE INDEX ON public.clinical_note_versions(edited_by);
GRANT SELECT ON public.clinical_note_versions TO authenticated;
GRANT ALL ON public.clinical_note_versions TO service_role;
ALTER TABLE public.clinical_note_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Versions follow note" ON public.clinical_note_versions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clinical_notes n WHERE n.id = note_id
         AND (n.author_id = (select auth.uid()) OR public.can_read_dossier(n.patient_id))));

CREATE OR REPLACE FUNCTION public.save_clinical_note(_appointment_id uuid, _motivo text, _observacoes text,
  _diagnostico text, _tratamento text, _proximos_passos text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _a appointments%ROWTYPE; _n clinical_notes%ROWTYPE; _id uuid;
BEGIN
  SELECT * INTO _a FROM appointments WHERE id = _appointment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'appointment_not_found'; END IF;
  PERFORM public.assert_dossier_writer(_a.patient_id, _a.clinic_id);
  SELECT * INTO _n FROM clinical_notes WHERE appointment_id = _appointment_id AND author_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO clinical_notes (appointment_id, patient_id, family_member_id, author_id, clinic_id,
      motivo, observacoes, diagnostico, tratamento, proximos_passos)
    VALUES (_appointment_id, _a.patient_id, _a.family_member_id, auth.uid(), _a.clinic_id,
      left(coalesce(_motivo,''),2000), left(coalesce(_observacoes,''),8000), left(coalesce(_diagnostico,''),4000),
      left(coalesce(_tratamento,''),4000), left(coalesce(_proximos_passos,''),4000))
    RETURNING * INTO _n;
  ELSE
    UPDATE clinical_notes SET motivo = left(coalesce(_motivo,''),2000), observacoes = left(coalesce(_observacoes,''),8000),
      diagnostico = left(coalesce(_diagnostico,''),4000), tratamento = left(coalesce(_tratamento,''),4000),
      proximos_passos = left(coalesce(_proximos_passos,''),4000), version = version + 1, updated_at = now()
    WHERE id = _n.id RETURNING * INTO _n;
  END IF;
  INSERT INTO clinical_note_versions (note_id, version, motivo, observacoes, diagnostico, tratamento, proximos_passos, edited_by)
  VALUES (_n.id, _n.version, _n.motivo, _n.observacoes, _n.diagnostico, _n.tratamento, _n.proximos_passos, auth.uid());
  RETURN _n.id;
END $$;

CREATE TABLE public.odontogram_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id),
  tooth smallint NOT NULL CHECK ((tooth BETWEEN 11 AND 18) OR (tooth BETWEEN 21 AND 28) OR (tooth BETWEEN 31 AND 38) OR (tooth BETWEEN 41 AND 48)
                                 OR (tooth BETWEEN 51 AND 55) OR (tooth BETWEEN 61 AND 65) OR (tooth BETWEEN 71 AND 75) OR (tooth BETWEEN 81 AND 85)),
  faces text[] NOT NULL DEFAULT '{}' CHECK (faces <@ ARRAY['M','D','O','V','L','I','P','B']::text[]),
  status text NOT NULL CHECK (status IN ('saudavel','carie','restauracao','endodontia','coroa','implante','extracao','ausente','fratura','selante','outro')),
  notes text,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  appointment_id uuid REFERENCES public.appointments(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.odontogram_entries(patient_id, tooth, created_at DESC);
CREATE INDEX ON public.odontogram_entries(author_id);
CREATE INDEX ON public.odontogram_entries(clinic_id);
CREATE INDEX ON public.odontogram_entries(appointment_id);
CREATE INDEX ON public.odontogram_entries(family_member_id);
GRANT SELECT ON public.odontogram_entries TO authenticated;
GRANT ALL ON public.odontogram_entries TO service_role;
ALTER TABLE public.odontogram_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Odontogram: author or active relationship" ON public.odontogram_entries FOR SELECT TO authenticated
  USING (author_id = (select auth.uid()) OR public.can_read_dossier(patient_id));

CREATE OR REPLACE FUNCTION public.add_odontogram_entry(_patient_id uuid, _clinic_id uuid, _tooth integer, _faces text[],
  _status text, _notes text DEFAULT NULL, _family_member_id uuid DEFAULT NULL, _appointment_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  PERFORM public.assert_dossier_writer(_patient_id, _clinic_id);
  IF _family_member_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_family_member'; END IF;
  IF _appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = _appointment_id AND patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_appointment'; END IF;
  INSERT INTO odontogram_entries (patient_id, family_member_id, tooth, faces, status, notes, author_id, clinic_id, appointment_id)
  VALUES (_patient_id, _family_member_id, _tooth, coalesce(_faces,'{}'), _status, left(_notes, 1000), auth.uid(), _clinic_id, _appointment_id)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

CREATE TABLE public.treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.treatment_plans(patient_id);
CREATE INDEX ON public.treatment_plans(clinic_id);
CREATE INDEX ON public.treatment_plans(author_id);
CREATE INDEX ON public.treatment_plans(family_member_id);
GRANT SELECT ON public.treatment_plans TO authenticated;
GRANT ALL ON public.treatment_plans TO service_role;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
-- Professionals only; patients read through my_treatment_plans() which omits internal_notes.
CREATE POLICY "Plans: author or active relationship" ON public.treatment_plans FOR SELECT TO authenticated
  USING (author_id = (select auth.uid()) OR (patient_id <> (select auth.uid()) AND public.can_read_dossier(patient_id)));

CREATE TABLE public.treatment_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.treatment_plans(id),
  tooth smallint,
  procedure text NOT NULL,
  status text NOT NULL DEFAULT 'planeado' CHECK (status IN ('planeado','feito','cancelado')),
  estimated_price numeric CHECK (estimated_price IS NULL OR estimated_price >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.treatment_plan_items(plan_id);
GRANT SELECT ON public.treatment_plan_items TO authenticated;
GRANT ALL ON public.treatment_plan_items TO service_role;
ALTER TABLE public.treatment_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan items follow plan" ON public.treatment_plan_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.treatment_plans p WHERE p.id = plan_id
    AND (p.author_id = (select auth.uid()) OR (p.patient_id <> (select auth.uid()) AND public.can_read_dossier(p.patient_id)))));

CREATE OR REPLACE FUNCTION public.create_treatment_plan(_patient_id uuid, _clinic_id uuid, _title text,
  _internal_notes text DEFAULT NULL, _family_member_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  PERFORM public.assert_dossier_writer(_patient_id, _clinic_id);
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'title_required'; END IF;
  IF _family_member_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_family_member'; END IF;
  INSERT INTO treatment_plans (patient_id, family_member_id, clinic_id, author_id, title, internal_notes)
  VALUES (_patient_id, _family_member_id, _clinic_id, auth.uid(), left(trim(_title),200), left(_internal_notes,4000))
  RETURNING id INTO _id;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.add_treatment_item(_plan_id uuid, _procedure text, _tooth integer DEFAULT NULL, _estimated_price numeric DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p treatment_plans%ROWTYPE; _id uuid;
BEGIN
  SELECT * INTO _p FROM treatment_plans WHERE id = _plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'plan_not_found'; END IF;
  PERFORM public.assert_dossier_writer(_p.patient_id, _p.clinic_id);
  IF coalesce(trim(_procedure),'') = '' THEN RAISE EXCEPTION 'procedure_required'; END IF;
  INSERT INTO treatment_plan_items (plan_id, tooth, procedure, estimated_price, sort_order)
  VALUES (_plan_id, _tooth, left(trim(_procedure),300), _estimated_price,
          coalesce((SELECT max(sort_order)+1 FROM treatment_plan_items WHERE plan_id = _plan_id), 0))
  RETURNING id INTO _id;
  UPDATE treatment_plans SET updated_at = now() WHERE id = _plan_id;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.set_treatment_item_status(_item_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p treatment_plans%ROWTYPE;
BEGIN
  SELECT p.* INTO _p FROM treatment_plans p JOIN treatment_plan_items i ON i.plan_id = p.id WHERE i.id = _item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'item_not_found'; END IF;
  PERFORM public.assert_dossier_writer(_p.patient_id, _p.clinic_id);
  IF _status NOT IN ('planeado','feito','cancelado') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  UPDATE treatment_plan_items SET status = _status, updated_at = now() WHERE id = _item_id;
  UPDATE treatment_plans SET updated_at = now() WHERE id = _p.id;
END $$;

-- Patient view of own plans (and family's): never internal_notes.
CREATE OR REPLACE FUNCTION public.my_treatment_plans()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'title', p.title, 'family_member_id', p.family_member_id, 'clinic', c.name,
    'created_at', p.created_at, 'updated_at', p.updated_at,
    'items', coalesce((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'tooth', i.tooth, 'procedure', i.procedure,
        'status', i.status, 'estimated_price', i.estimated_price) ORDER BY i.sort_order)
      FROM treatment_plan_items i WHERE i.plan_id = p.id), '[]'::jsonb)
  ) ORDER BY p.created_at DESC), '[]'::jsonb)
  FROM treatment_plans p LEFT JOIN clinics c ON c.id = p.clinic_id
  WHERE p.patient_id = auth.uid();
$$;

CREATE TABLE public.clinical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id),
  clinic_id uuid REFERENCES public.clinics(id),
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  uploaded_by_patient boolean NOT NULL DEFAULT false,
  doc_type text NOT NULL CHECK (doc_type IN ('radiografia','relatorio','consentimento','outro')),
  title text,
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL CHECK (mime_type IN ('application/pdf','image/jpeg','image/png','image/webp')),
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 15728640),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.clinical_documents(patient_id);
CREATE INDEX ON public.clinical_documents(uploaded_by);
CREATE INDEX ON public.clinical_documents(clinic_id);
CREATE INDEX ON public.clinical_documents(family_member_id);
GRANT SELECT ON public.clinical_documents TO authenticated;
GRANT ALL ON public.clinical_documents TO service_role;
ALTER TABLE public.clinical_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Docs: patient, uploader or active relationship" ON public.clinical_documents FOR SELECT TO authenticated
  USING (patient_id = (select auth.uid()) OR uploaded_by = (select auth.uid()) OR public.can_read_dossier(patient_id));

CREATE OR REPLACE FUNCTION public.can_access_patient_folder(_folder text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR _folder IS NULL OR _folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN RETURN false; END IF;
  RETURN auth.uid() = _folder::uuid OR public.can_read_dossier(_folder::uuid);
END $$;

CREATE OR REPLACE FUNCTION public.register_clinical_document(_patient_id uuid, _storage_path text, _doc_type text,
  _mime_type text, _size_bytes integer, _title text DEFAULT NULL, _clinic_id uuid DEFAULT NULL, _family_member_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE _self boolean := (auth.uid() = _patient_id); _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF split_part(_storage_path, '/', 1) <> _patient_id::text THEN RAISE EXCEPTION 'invalid_path'; END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'clinical-documents' AND o.name = _storage_path) THEN
    RAISE EXCEPTION 'file_not_uploaded'; END IF;
  IF NOT _self THEN
    IF NOT (public.current_role_is('dentist') OR public.current_role_is('clinic')) THEN RAISE EXCEPTION 'not_professional'; END IF;
    IF NOT public.can_read_dossier(_patient_id) THEN RAISE EXCEPTION 'no_active_relationship'; END IF;
    IF _clinic_id IS NOT NULL AND NOT public.is_professional_of_clinic(_clinic_id) THEN RAISE EXCEPTION 'not_clinic_professional'; END IF;
  ELSE
    _clinic_id := NULL;
  END IF;
  IF _family_member_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id) THEN
    RAISE EXCEPTION 'invalid_family_member'; END IF;
  INSERT INTO clinical_documents (patient_id, family_member_id, clinic_id, uploaded_by, uploaded_by_patient, doc_type, title, storage_path, mime_type, size_bytes)
  VALUES (_patient_id, _family_member_id, _clinic_id, auth.uid(), _self, _doc_type, left(_title,200), _storage_path, _mime_type, _size_bytes)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Every view goes through here: checks access, logs, returns the private path to sign (short-lived).
CREATE OR REPLACE FUNCTION public.open_clinical_document(_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d clinical_documents%ROWTYPE;
BEGIN
  SELECT * INTO _d FROM clinical_documents WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF NOT (_d.patient_id = auth.uid() OR _d.uploaded_by = auth.uid() OR public.can_read_dossier(_d.patient_id)) THEN
    RAISE EXCEPTION 'forbidden'; END IF;
  IF auth.uid() <> _d.patient_id THEN
    INSERT INTO dossier_access_log (patient_id, accessor_id, section) VALUES (_d.patient_id, auth.uid(), left('document:' || _d.id::text, 40));
  END IF;
  RETURN _d.storage_path;
END $$;

CREATE TABLE public.triage_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.triage_responses(appointment_id);
CREATE INDEX ON public.triage_responses(patient_id);
GRANT SELECT, INSERT ON public.triage_responses TO authenticated;
GRANT ALL ON public.triage_responses TO service_role;
ALTER TABLE public.triage_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Triage: patient or active relationship" ON public.triage_responses FOR SELECT TO authenticated
  USING (patient_id = (select auth.uid()) OR public.can_read_dossier(patient_id));
CREATE POLICY "Triage: patient adds for own appointment" ON public.triage_responses FOR INSERT TO authenticated
  WITH CHECK (patient_id = (select auth.uid()) AND EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_id AND a.patient_id = (select auth.uid())));

-- Patient self-declared data for the professional dossier (separate from professional notes).
CREATE OR REPLACE FUNCTION public.dossier_self_declared(_patient_id uuid, _family_member_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p patients%ROWTYPE; _h jsonb;
BEGIN
  IF NOT public.can_read_dossier(_patient_id) THEN RAISE EXCEPTION 'no_active_relationship'; END IF;
  PERFORM public.log_dossier_access(_patient_id, 'self_declared');
  IF _family_member_id IS NOT NULL THEN
    SELECT health INTO _h FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id;
    RETURN coalesce(_h, '{}'::jsonb);
  END IF;
  SELECT * INTO _p FROM patients WHERE id = _patient_id;
  RETURN coalesce(_p.self_health, '{}'::jsonb) || jsonb_build_object('allergies', coalesce(_p.allergies, '[]'::jsonb));
END $$;

REVOKE ALL ON FUNCTION public.is_professional_of_clinic(uuid), public.assert_dossier_writer(uuid, uuid),
  public.save_clinical_note(uuid, text, text, text, text, text),
  public.add_odontogram_entry(uuid, uuid, integer, text[], text, text, uuid, uuid),
  public.create_treatment_plan(uuid, uuid, text, text, uuid), public.add_treatment_item(uuid, text, integer, numeric),
  public.set_treatment_item_status(uuid, text), public.my_treatment_plans(), public.can_access_patient_folder(text),
  public.register_clinical_document(uuid, text, text, text, integer, text, uuid, uuid), public.open_clinical_document(uuid),
  public.dossier_self_declared(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_professional_of_clinic(uuid),
  public.save_clinical_note(uuid, text, text, text, text, text),
  public.add_odontogram_entry(uuid, uuid, integer, text[], text, text, uuid, uuid),
  public.create_treatment_plan(uuid, uuid, text, text, uuid), public.add_treatment_item(uuid, text, integer, numeric),
  public.set_treatment_item_status(uuid, text), public.my_treatment_plans(), public.can_access_patient_folder(text),
  public.register_clinical_document(uuid, text, text, text, integer, text, uuid, uuid), public.open_clinical_document(uuid),
  public.dossier_self_declared(uuid, uuid) TO authenticated;

-- Storage: private bucket objects readable/insertable only for own folder or active relationship; no update/delete.
CREATE POLICY "clinical-docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'clinical-documents' AND public.can_access_patient_folder((storage.foldername(name))[1]));
CREATE POLICY "clinical-docs insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clinical-documents' AND public.can_access_patient_folder((storage.foldername(name))[1]));