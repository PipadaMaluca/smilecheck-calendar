-- Self-declared health (patient-only writes)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS self_health jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS health jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.guard_patient_self_health()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.is_untrusted_caller() THEN
    IF NEW.self_health IS DISTINCT FROM OLD.self_health AND NEW.id <> (SELECT auth.uid()) THEN
      RAISE EXCEPTION 'self_health_patient_only';
    END IF;
    IF NEW.medical_notes IS DISTINCT FROM OLD.medical_notes AND NEW.id = (SELECT auth.uid()) THEN
      RAISE EXCEPTION 'medical_notes_professional_only';
    END IF;
    IF jsonb_typeof(NEW.self_health) <> 'object' OR length(NEW.self_health::text) > 20000 THEN
      RAISE EXCEPTION 'invalid_self_health';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_patient_self_health ON public.patients;
CREATE TRIGGER trg_guard_patient_self_health BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.guard_patient_self_health();

CREATE OR REPLACE FUNCTION public.guard_family_health()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF jsonb_typeof(NEW.health) <> 'object' OR length(NEW.health::text) > 20000 THEN
    RAISE EXCEPTION 'invalid_health';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_family_health ON public.family_members;
CREATE TRIGGER trg_guard_family_health BEFORE INSERT OR UPDATE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.guard_family_health();

-- Helpers
CREATE OR REPLACE FUNCTION public.is_approved_dentist()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM dentists d JOIN profiles p ON p.id = d.id
    WHERE d.id = (SELECT auth.uid()) AND p.role = 'dentist' AND d.verification_status = 'aprovado');
$$;
REVOKE ALL ON FUNCTION public.is_approved_dentist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved_dentist() TO authenticated;

-- Per-clinic sequential numbering (server only)
CREATE TABLE public.document_counters (
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('prescription','referral_letter')),
  last_no integer NOT NULL DEFAULT 0,
  PRIMARY KEY (clinic_id, kind)
);
GRANT ALL ON public.document_counters TO service_role;
ALTER TABLE public.document_counters ENABLE ROW LEVEL SECURITY;

-- Prescriptions
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  dentist_id uuid NOT NULL REFERENCES public.profiles(id),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  notes text,
  verification_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'emitida' CHECK (status IN ('emitida','anulada')),
  voided_at timestamptz,
  voided_by uuid REFERENCES public.profiles(id),
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, number)
);
CREATE INDEX idx_prescriptions_dentist ON public.prescriptions(dentist_id);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_family ON public.prescriptions(family_member_id);
CREATE INDEX idx_prescriptions_appt ON public.prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_voided_by ON public.prescriptions(voided_by);
GRANT SELECT ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prescription readers" ON public.prescriptions FOR SELECT TO authenticated
USING (dentist_id = (SELECT auth.uid()) OR patient_id = (SELECT auth.uid()) OR public.owns_clinic(clinic_id));

-- Referral letters
CREATE TABLE public.referral_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id),
  dentist_id uuid NOT NULL REFERENCES public.profiles(id),
  patient_id uuid NOT NULL REFERENCES public.profiles(id),
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  to_dentist_id uuid REFERENCES public.profiles(id),
  to_clinic_id uuid REFERENCES public.clinics(id),
  to_external text,
  reason text NOT NULL,
  clinical_summary text,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','urgente')),
  verification_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'emitida' CHECK (status IN ('emitida','anulada')),
  voided_at timestamptz,
  voided_by uuid REFERENCES public.profiles(id),
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, number),
  CHECK (num_nonnulls(to_dentist_id, to_clinic_id, to_external) >= 1),
  CHECK (to_external IS NULL OR (to_dentist_id IS NULL AND to_clinic_id IS NULL))
);
CREATE INDEX idx_refl_dentist ON public.referral_letters(dentist_id);
CREATE INDEX idx_refl_patient ON public.referral_letters(patient_id);
CREATE INDEX idx_refl_family ON public.referral_letters(family_member_id);
CREATE INDEX idx_refl_appt ON public.referral_letters(appointment_id);
CREATE INDEX idx_refl_to_dentist ON public.referral_letters(to_dentist_id);
CREATE INDEX idx_refl_to_clinic ON public.referral_letters(to_clinic_id);
CREATE INDEX idx_refl_voided_by ON public.referral_letters(voided_by);
GRANT SELECT ON public.referral_letters TO authenticated;
GRANT ALL ON public.referral_letters TO service_role;
ALTER TABLE public.referral_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referral letter readers" ON public.referral_letters FOR SELECT TO authenticated
USING (dentist_id = (SELECT auth.uid()) OR patient_id = (SELECT auth.uid()) OR public.owns_clinic(clinic_id)
  OR to_dentist_id = (SELECT auth.uid()) OR (to_clinic_id IS NOT NULL AND public.owns_clinic(to_clinic_id)));

-- Immutability: only the void RPC (trusted flag) may update; never delete
CREATE OR REPLACE FUNCTION public.guard_clinical_document()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'document_immutable'; END IF;
  IF coalesce(current_setting('app.trusted_write', true), '') <> 'on' THEN RAISE EXCEPTION 'document_immutable'; END IF;
  IF (to_jsonb(NEW) - ARRAY['status','voided_at','voided_by','void_reason'])
     IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status','voided_at','voided_by','void_reason']) THEN
    RAISE EXCEPTION 'document_immutable';
  END IF;
  IF OLD.status = 'anulada' THEN RAISE EXCEPTION 'document_already_voided'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_prescription BEFORE UPDATE OR DELETE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.guard_clinical_document();
CREATE TRIGGER trg_guard_referral_letter BEFORE UPDATE OR DELETE ON public.referral_letters
FOR EACH ROW EXECUTE FUNCTION public.guard_clinical_document();

CREATE OR REPLACE FUNCTION public.new_verification_code()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;
REVOKE ALL ON FUNCTION public.new_verification_code() FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.next_document_number(_clinic uuid, _kind text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  INSERT INTO document_counters (clinic_id, kind, last_no) VALUES (_clinic, _kind, 1)
  ON CONFLICT (clinic_id, kind) DO UPDATE SET last_no = document_counters.last_no + 1
  RETURNING last_no INTO _n;
  RETURN _n;
END $$;
REVOKE ALL ON FUNCTION public.next_document_number(uuid, text) FROM PUBLIC, anon, authenticated;

-- Shared validation for an issuing dentist
CREATE OR REPLACE FUNCTION public.assert_can_issue(_patient uuid, _family uuid, _clinic uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := (SELECT auth.uid());
BEGIN
  IF NOT public.is_approved_dentist() THEN RAISE EXCEPTION 'not_approved_dentist'; END IF;
  IF NOT EXISTS (SELECT 1 FROM clinic_members WHERE clinic_id = _clinic AND dentist_id = _uid) THEN
    RAISE EXCEPTION 'not_clinic_member';
  END IF;
  IF NOT public.can_read_dossier(_patient) THEN RAISE EXCEPTION 'no_active_relationship'; END IF;
  IF _family IS NOT NULL AND NOT EXISTS (SELECT 1 FROM family_members WHERE id = _family AND primary_patient_id = _patient) THEN
    RAISE EXCEPTION 'family_member_mismatch';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.assert_can_issue(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Safety context (allergies + current medication) for the prescriber, logged
CREATE OR REPLACE FUNCTION public.dossier_safety(_patient_id uuid, _family_member_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p patients%ROWTYPE; _h jsonb;
BEGIN
  IF NOT public.can_read_dossier(_patient_id) THEN RAISE EXCEPTION 'no_active_relationship'; END IF;
  PERFORM public.log_dossier_access(_patient_id, 'safety');
  IF _family_member_id IS NOT NULL THEN
    SELECT health INTO _h FROM family_members WHERE id = _family_member_id AND primary_patient_id = _patient_id;
    RETURN jsonb_build_object('allergies', coalesce(_h->'allergies', '[]'::jsonb), 'medications', coalesce(_h->'medications', '[]'::jsonb));
  END IF;
  SELECT * INTO _p FROM patients WHERE id = _patient_id;
  RETURN jsonb_build_object('allergies', coalesce(_p.allergies, '[]'::jsonb), 'medications', coalesce(_p.self_health->'medications', '[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.dossier_safety(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dossier_safety(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_prescription(_patient_id uuid, _clinic_id uuid, _items jsonb,
  _notes text DEFAULT NULL, _family_member_id uuid DEFAULT NULL, _appointment_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _it jsonb; _lang text;
BEGIN
  PERFORM public.assert_can_issue(_patient_id, _family_member_id, _clinic_id);
  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) < 1 OR jsonb_array_length(_items) > 30 THEN
    RAISE EXCEPTION 'invalid_items';
  END IF;
  FOR _it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    IF jsonb_typeof(_it) <> 'object' OR length(trim(coalesce(_it->>'medicamento',''))) = 0
       OR length(coalesce(_it->>'medicamento','')) > 200 OR length(coalesce(_it->>'dosagem','')) > 200
       OR length(coalesce(_it->>'posologia','')) > 300 OR length(coalesce(_it->>'duracao','')) > 100
       OR length(coalesce(_it->>'quantidade','')) > 100 THEN
      RAISE EXCEPTION 'invalid_items';
    END IF;
  END LOOP;
  IF length(coalesce(_notes,'')) > 2000 THEN RAISE EXCEPTION 'invalid_notes'; END IF;
  IF _appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = _appointment_id AND patient_id = _patient_id) THEN
    RAISE EXCEPTION 'appointment_mismatch';
  END IF;
  INSERT INTO prescriptions (number, clinic_id, dentist_id, patient_id, family_member_id, appointment_id, items, notes, verification_code)
  VALUES (public.next_document_number(_clinic_id, 'prescription'), _clinic_id, (SELECT auth.uid()), _patient_id, _family_member_id,
    _appointment_id,
    (SELECT jsonb_agg(jsonb_build_object('medicamento', trim(x->>'medicamento'), 'dosagem', coalesce(x->>'dosagem',''),
       'posologia', coalesce(x->>'posologia',''), 'duracao', coalesce(x->>'duracao',''), 'quantidade', coalesce(x->>'quantidade',''))) FROM jsonb_array_elements(_items) x),
    nullif(trim(coalesce(_notes,'')), ''), public.new_verification_code())
  RETURNING id INTO _id;
  SELECT language::text INTO _lang FROM profiles WHERE id = _patient_id;
  INSERT INTO notifications (profile_id, type, title, message, action_url) VALUES (_patient_id, 'prescription',
    CASE _lang WHEN 'fr' THEN 'Nouvelle ordonnance' WHEN 'en' THEN 'New prescription' ELSE 'Nova receita' END,
    CASE _lang WHEN 'fr' THEN 'Une ordonnance est disponible dans Santé.' WHEN 'en' THEN 'A prescription is available in Health.' ELSE 'Tem uma receita disponível em Saúde.' END,
    '/app?tab=saude&section=receitas');
  RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.issue_prescription(uuid, uuid, jsonb, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_prescription(uuid, uuid, jsonb, text, uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_referral_letter(_patient_id uuid, _clinic_id uuid, _reason text,
  _clinical_summary text DEFAULT NULL, _urgency text DEFAULT 'normal', _to_dentist_id uuid DEFAULT NULL,
  _to_clinic_id uuid DEFAULT NULL, _to_external text DEFAULT NULL, _family_member_id uuid DEFAULT NULL, _appointment_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _lang text; _owner uuid; _plang text;
BEGIN
  PERFORM public.assert_can_issue(_patient_id, _family_member_id, _clinic_id);
  IF length(trim(coalesce(_reason,''))) < 3 OR length(_reason) > 500 OR length(coalesce(_clinical_summary,'')) > 4000
     OR length(coalesce(_to_external,'')) > 300 THEN RAISE EXCEPTION 'invalid_fields'; END IF;
  IF _to_external IS NOT NULL AND length(trim(_to_external)) = 0 THEN _to_external := NULL; END IF;
  IF _to_dentist_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dentists WHERE id = _to_dentist_id AND verification_status = 'aprovado') THEN
    RAISE EXCEPTION 'invalid_recipient';
  END IF;
  IF _to_dentist_id = (SELECT auth.uid()) THEN RAISE EXCEPTION 'invalid_recipient'; END IF;
  IF _to_clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id = _to_clinic_id AND verification_status = 'aprovado') THEN
    RAISE EXCEPTION 'invalid_recipient';
  END IF;
  IF _appointment_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = _appointment_id AND patient_id = _patient_id) THEN
    RAISE EXCEPTION 'appointment_mismatch';
  END IF;
  INSERT INTO referral_letters (number, clinic_id, dentist_id, patient_id, family_member_id, appointment_id,
    to_dentist_id, to_clinic_id, to_external, reason, clinical_summary, urgency, verification_code)
  VALUES (public.next_document_number(_clinic_id, 'referral_letter'), _clinic_id, (SELECT auth.uid()), _patient_id, _family_member_id,
    _appointment_id, _to_dentist_id, _to_clinic_id, _to_external, trim(_reason), nullif(trim(coalesce(_clinical_summary,'')), ''),
    CASE WHEN _urgency = 'urgente' THEN 'urgente' ELSE 'normal' END, public.new_verification_code())
  RETURNING id INTO _id;
  -- Recipient (in-app) is notified and gains read access to this letter only
  IF _to_dentist_id IS NOT NULL THEN
    SELECT language::text INTO _lang FROM profiles WHERE id = _to_dentist_id;
    INSERT INTO notifications (profile_id, type, title, message, action_url) VALUES (_to_dentist_id, 'referral_letter_received',
      CASE _lang WHEN 'fr' THEN 'Nouvelle lettre d''adressage' WHEN 'en' THEN 'New referral letter' ELSE 'Nova carta de referenciação' END,
      CASE _lang WHEN 'fr' THEN 'Un confrère vous a adressé un patient.' WHEN 'en' THEN 'A colleague has referred a patient to you.' ELSE 'Um colega referenciou-lhe um paciente.' END,
      '/app?tab=pesquisa&section=cartas');
  END IF;
  IF _to_clinic_id IS NOT NULL THEN
    SELECT owner_profile_id INTO _owner FROM clinics WHERE id = _to_clinic_id;
    IF _owner IS NOT NULL AND _owner IS DISTINCT FROM _to_dentist_id THEN
      SELECT language::text INTO _lang FROM profiles WHERE id = _owner;
      INSERT INTO notifications (profile_id, type, title, message, action_url) VALUES (_owner, 'referral_letter_received',
        CASE _lang WHEN 'fr' THEN 'Nouvelle lettre d''adressage' WHEN 'en' THEN 'New referral letter' ELSE 'Nova carta de referenciação' END,
        CASE _lang WHEN 'fr' THEN 'Un patient a été adressé à votre clinique.' WHEN 'en' THEN 'A patient has been referred to your clinic.' ELSE 'Um paciente foi referenciado para a sua clínica.' END,
        '/app?tab=pesquisa&section=cartas');
    END IF;
  END IF;
  SELECT language::text INTO _plang FROM profiles WHERE id = _patient_id;
  INSERT INTO notifications (profile_id, type, title, message, action_url) VALUES (_patient_id, 'referral_letter',
    CASE _plang WHEN 'fr' THEN 'Nouvelle lettre d''adressage' WHEN 'en' THEN 'New referral letter' ELSE 'Nova carta de referenciação' END,
    CASE _plang WHEN 'fr' THEN 'Une lettre d''adressage est disponible dans Santé.' WHEN 'en' THEN 'A referral letter is available in Health.' ELSE 'Tem uma carta de referenciação em Saúde.' END,
    '/app?tab=saude&section=referencias');
  RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.issue_referral_letter(uuid, uuid, text, text, text, uuid, uuid, text, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_referral_letter(uuid, uuid, text, text, text, uuid, uuid, text, uuid, uuid) TO authenticated;

-- Void (author only, reason required, recorded)
CREATE OR REPLACE FUNCTION public.void_clinical_document(_kind text, _id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  IF length(trim(coalesce(_reason,''))) < 3 OR length(_reason) > 500 THEN RAISE EXCEPTION 'reason_required'; END IF;
  PERFORM set_config('app.trusted_write', 'on', true);
  IF _kind = 'prescription' THEN
    UPDATE prescriptions SET status = 'anulada', voided_at = now(), voided_by = (SELECT auth.uid()), void_reason = trim(_reason)
     WHERE id = _id AND dentist_id = (SELECT auth.uid()) AND status = 'emitida';
  ELSIF _kind = 'referral_letter' THEN
    UPDATE referral_letters SET status = 'anulada', voided_at = now(), voided_by = (SELECT auth.uid()), void_reason = trim(_reason)
     WHERE id = _id AND dentist_id = (SELECT auth.uid()) AND status = 'emitida';
  ELSE
    PERFORM set_config('app.trusted_write', 'off', true);
    RAISE EXCEPTION 'invalid_kind';
  END IF;
  GET DIAGNOSTICS _n = ROW_COUNT;
  PERFORM set_config('app.trusted_write', 'off', true);
  IF _n = 0 THEN RAISE EXCEPTION 'not_allowed'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.void_clinical_document(text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.void_clinical_document(text, uuid, text) TO authenticated;

-- Full document payload for PDF, for anyone allowed by RLS on the row
CREATE OR REPLACE FUNCTION public.clinical_document(_kind text, _id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := (SELECT auth.uid()); _r jsonb; _clinic uuid; _dentist uuid; _patient uuid; _family uuid; _ok boolean;
BEGIN
  IF _kind = 'prescription' THEN
    SELECT to_jsonb(p), p.clinic_id, p.dentist_id, p.patient_id, p.family_member_id,
      (p.dentist_id = _uid OR p.patient_id = _uid OR public.owns_clinic(p.clinic_id))
      INTO _r, _clinic, _dentist, _patient, _family, _ok FROM prescriptions p WHERE p.id = _id;
  ELSIF _kind = 'referral_letter' THEN
    SELECT to_jsonb(l), l.clinic_id, l.dentist_id, l.patient_id, l.family_member_id,
      (l.dentist_id = _uid OR l.patient_id = _uid OR public.owns_clinic(l.clinic_id) OR l.to_dentist_id = _uid
        OR (l.to_clinic_id IS NOT NULL AND public.owns_clinic(l.to_clinic_id)))
      INTO _r, _clinic, _dentist, _patient, _family, _ok FROM referral_letters l WHERE l.id = _id;
    _r := _r || jsonb_build_object(
      'to_dentist_name', (SELECT full_name FROM profiles WHERE id = (_r->>'to_dentist_id')::uuid),
      'to_clinic_name', (SELECT name FROM clinics WHERE id = (_r->>'to_clinic_id')::uuid));
  ELSE RAISE EXCEPTION 'invalid_kind';
  END IF;
  IF _r IS NULL OR NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'not_allowed'; END IF;
  RETURN _r - ARRAY['voided_by'] || jsonb_build_object(
    'clinic', (SELECT jsonb_build_object('name', name, 'address', address, 'postal_code', postal_code, 'city', city, 'phone', phone) FROM clinics WHERE id = _clinic),
    'dentist', (SELECT jsonb_build_object('name', pr.full_name, 'order_number', d.rpps_number) FROM profiles pr LEFT JOIN dentists d ON d.id = pr.id WHERE pr.id = _dentist),
    'patient', CASE WHEN _family IS NOT NULL
        THEN (SELECT jsonb_build_object('name', full_name, 'date_of_birth', date_of_birth) FROM family_members WHERE id = _family)
        ELSE (SELECT jsonb_build_object('name', full_name, 'date_of_birth', date_of_birth) FROM profiles WHERE id = _patient) END);
END $$;
REVOKE ALL ON FUNCTION public.clinical_document(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clinical_document(text, uuid) TO authenticated;

-- Public QR verification: status, date and clinic only — never patient data
CREATE OR REPLACE FUNCTION public.verify_document(_code text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(
    (SELECT jsonb_build_object('kind', 'prescription', 'status', p.status, 'issued_on', (p.created_at AT TIME ZONE c.timezone)::date, 'clinic', c.name)
       FROM prescriptions p JOIN clinics c ON c.id = p.clinic_id WHERE p.verification_code = upper(trim(_code))),
    (SELECT jsonb_build_object('kind', 'referral_letter', 'status', l.status, 'issued_on', (l.created_at AT TIME ZONE c.timezone)::date, 'clinic', c.name)
       FROM referral_letters l JOIN clinics c ON c.id = l.clinic_id WHERE l.verification_code = upper(trim(_code))),
    jsonb_build_object('status', 'not_found'));
$$;
REVOKE ALL ON FUNCTION public.verify_document(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_document(text) TO anon, authenticated;

-- Private rankings: own position and 7-day change only, no other names
CREATE OR REPLACE FUNCTION public.my_ranking()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := (SELECT auth.uid()); _role app_role; _xp int; _prev int; _country text; _res jsonb; _clinics jsonb;
BEGIN
  SELECT role INTO _role FROM profiles WHERE id = _uid;
  IF _role IS NULL OR _role = 'patient' THEN RAISE EXCEPTION 'not_allowed'; END IF;

  CREATE TEMP TABLE IF NOT EXISTS _rk_pool (id uuid, xp int, prev int, countries text[], clinic_ids uuid[]) ON COMMIT DROP;
  TRUNCATE _rk_pool;
  IF _role = 'dentist' THEN
    INSERT INTO _rk_pool
    SELECT p.id, coalesce(ul.current_xp, 0),
      coalesce(ul.current_xp, 0) - coalesce((SELECT sum(amount) FROM points_ledger pl WHERE pl.profile_id = p.id AND pl.type = 'xp' AND pl.created_at > now() - interval '7 days'), 0),
      ARRAY(SELECT DISTINCT c.country FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id WHERE m.dentist_id = p.id),
      ARRAY(SELECT m.clinic_id FROM clinic_members m WHERE m.dentist_id = p.id)
    FROM profiles p JOIN dentists d ON d.id = p.id LEFT JOIN user_levels ul ON ul.id = p.id
    WHERE p.role = 'dentist' AND NOT p.is_test AND (d.verification_status = 'aprovado' OR p.id = _uid);
  ELSE
    INSERT INTO _rk_pool
    SELECT p.id, coalesce(ul.current_xp, 0),
      coalesce(ul.current_xp, 0) - coalesce((SELECT sum(amount) FROM points_ledger pl WHERE pl.profile_id = p.id AND pl.type = 'xp' AND pl.created_at > now() - interval '7 days'), 0),
      ARRAY(SELECT DISTINCT c.country FROM clinics c WHERE c.owner_profile_id = p.id),
      ARRAY[]::uuid[]
    FROM profiles p LEFT JOIN user_levels ul ON ul.id = p.id
    WHERE p.role = 'clinic' AND NOT p.is_test
      AND (p.id = _uid OR EXISTS (SELECT 1 FROM clinics c WHERE c.owner_profile_id = p.id AND c.verification_status = 'aprovado'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM _rk_pool WHERE id = _uid) THEN
    INSERT INTO _rk_pool VALUES (_uid, 0, 0, ARRAY[]::text[], ARRAY[]::uuid[]);
  END IF;
  SELECT xp, prev, countries[1] INTO _xp, _prev, _country FROM _rk_pool WHERE id = _uid;

  _res := jsonb_build_object('xp', _xp,
    'global', (SELECT jsonb_build_object('position', 1 + count(*) FILTER (WHERE xp > _xp), 'total', count(*),
       'change', (1 + count(*) FILTER (WHERE prev > _prev)) - (1 + count(*) FILTER (WHERE xp > _xp))) FROM _rk_pool),
    'national', CASE WHEN _country IS NULL THEN NULL ELSE
      (SELECT jsonb_build_object('country', _country, 'position', 1 + count(*) FILTER (WHERE xp > _xp), 'total', count(*),
        'change', (1 + count(*) FILTER (WHERE prev > _prev)) - (1 + count(*) FILTER (WHERE xp > _xp))) FROM _rk_pool WHERE _country = ANY(countries)) END);
  IF _role = 'dentist' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name,
        'position', 1 + (SELECT count(*) FROM _rk_pool q WHERE c.id = ANY(q.clinic_ids) AND q.xp > _xp),
        'total', (SELECT count(*) FROM _rk_pool q WHERE c.id = ANY(q.clinic_ids)),
        'change', (SELECT count(*) FROM _rk_pool q WHERE c.id = ANY(q.clinic_ids) AND q.prev > _prev)
                - (SELECT count(*) FROM _rk_pool q WHERE c.id = ANY(q.clinic_ids) AND q.xp > _xp)) ORDER BY c.name), '[]'::jsonb)
      INTO _clinics FROM clinic_members m JOIN clinics c ON c.id = m.clinic_id WHERE m.dentist_id = _uid;
    _res := _res || jsonb_build_object('clinics', _clinics);
  END IF;
  RETURN _res;
END $$;
REVOKE ALL ON FUNCTION public.my_ranking() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_ranking() TO authenticated;

-- Job market
CREATE TABLE public.job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 120),
  contract_type text NOT NULL CHECK (contract_type IN ('fullTime','partTime','freelancer','replacement')),
  days text[] NOT NULL DEFAULT '{}' CHECK (days <@ ARRAY['mon','tue','wed','thu','fri','sat','sun']::text[]),
  city text CHECK (length(city) <= 120),
  description text CHECK (length(description) <= 4000),
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','fechada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_job_posts_clinic ON public.job_posts(clinic_id);
CREATE INDEX idx_job_posts_created_by ON public.job_posts(created_by);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_posts TO authenticated;
GRANT ALL ON public.job_posts TO service_role;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or approved dentists read posts" ON public.job_posts FOR SELECT TO authenticated
USING (public.owns_clinic(clinic_id) OR (status = 'aberta' AND public.is_approved_dentist()));
CREATE POLICY "Approved clinic owner publishes" ON public.job_posts FOR INSERT TO authenticated
WITH CHECK (created_by = (SELECT auth.uid()) AND public.owns_clinic(clinic_id)
  AND EXISTS (SELECT 1 FROM public.clinics c WHERE c.id = clinic_id AND c.verification_status = 'aprovado'));
CREATE POLICY "Clinic owner updates posts" ON public.job_posts FOR UPDATE TO authenticated
USING (public.owns_clinic(clinic_id)) WITH CHECK (public.owns_clinic(clinic_id));
CREATE POLICY "Clinic owner deletes posts" ON public.job_posts FOR DELETE TO authenticated
USING (public.owns_clinic(clinic_id));
CREATE TRIGGER trg_job_posts_updated BEFORE UPDATE ON public.job_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_job_post(_post uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM job_posts j WHERE j.id = _post AND public.owns_clinic(j.clinic_id));
$$;
CREATE OR REPLACE FUNCTION public.job_post_open(_post uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM job_posts j JOIN clinics c ON c.id = j.clinic_id WHERE j.id = _post AND j.status = 'aberta' AND c.verification_status = 'aprovado');
$$;
REVOKE ALL ON FUNCTION public.owns_job_post(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.job_post_open(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_job_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.job_post_open(uuid) TO authenticated;

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES public.profiles(id),
  message text CHECK (length(message) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, dentist_id)
);
CREATE INDEX idx_job_apps_dentist ON public.job_applications(dentist_id);
GRANT SELECT, INSERT, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicant or post owner reads" ON public.job_applications FOR SELECT TO authenticated
USING (dentist_id = (SELECT auth.uid()) OR public.owns_job_post(post_id));
CREATE POLICY "Approved dentist applies" ON public.job_applications FOR INSERT TO authenticated
WITH CHECK (dentist_id = (SELECT auth.uid()) AND public.is_approved_dentist() AND public.job_post_open(post_id));
CREATE POLICY "Applicant withdraws" ON public.job_applications FOR DELETE TO authenticated
USING (dentist_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.notify_job_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid; _title text; _lang text; _name text;
BEGIN
  SELECT c.owner_profile_id, j.title INTO _owner, _title FROM job_posts j JOIN clinics c ON c.id = j.clinic_id WHERE j.id = NEW.post_id;
  IF _owner IS NULL THEN RETURN NEW; END IF;
  SELECT language::text INTO _lang FROM profiles WHERE id = _owner;
  SELECT full_name INTO _name FROM professional_public_profiles WHERE id = NEW.dentist_id;
  INSERT INTO notifications (profile_id, type, title, message, action_url) VALUES (_owner, 'job_application',
    CASE _lang WHEN 'fr' THEN 'Nouvelle candidature' WHEN 'en' THEN 'New application' ELSE 'Nova candidatura' END,
    coalesce(_name, '') || ' — ' || _title, '/app?tab=pesquisa&section=emprego');
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_job_application() FROM PUBLIC, anon;
CREATE TRIGGER trg_notify_job_application AFTER INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_job_application();

-- Notification defaults for the new types
CREATE OR REPLACE FUNCTION public.notification_default_target(_type text)
 RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _type IN ('appointment','appointment_created','appointment_confirmed','appointment_cancelled',
                   'appointment_changed','appointment_reminder_24h','appointment_reminder_1h',
                   'waiting_list','waiting_room') THEN '/app?tab=agenda'
    WHEN _type IN ('points','level_up','streak','feedback_pending') THEN '/app?tab=pontuacoes'
    WHEN _type = 'feedback_received' THEN '/app?tab=pontuacoes&section=avaliacoes'
    WHEN _type IN ('achievement','achievement_unlocked') THEN '/app?tab=conquistas'
    WHEN _type = 'message' THEN '/app?tab=conversas'
    WHEN _type IN ('referral','referral_used') THEN '/app?tab=convidar&section=convites'
    WHEN _type = 'prescription' THEN '/app?tab=saude&section=receitas'
    WHEN _type = 'referral_letter' THEN '/app?tab=saude&section=referencias'
    WHEN _type = 'referral_letter_received' THEN '/app?tab=pesquisa&section=cartas'
    WHEN _type = 'job_application' THEN '/app?tab=pesquisa&section=emprego'
    WHEN _type = 'daily_summary' THEN '/app?tab=estatisticas'
    WHEN _type = 'new_dentist' THEN '/app?tab=equipa'
    WHEN _type = 'plan_renewal' THEN '/app?tab=plano'
    ELSE '/app?tab=home'
  END
$function$;
