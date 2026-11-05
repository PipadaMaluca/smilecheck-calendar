-- A1: clients can no longer read/sign clinical files directly; signing only via the sign-file edge function.
DROP POLICY IF EXISTS "clinical-docs read" ON storage.objects;

-- A2: triage linked to appointment (+ family member).
ALTER TABLE public.triage_responses ADD COLUMN family_member_id uuid REFERENCES public.family_members(id);
CREATE INDEX ON public.triage_responses(family_member_id);
DROP POLICY IF EXISTS "Triage: patient adds for own appointment" ON public.triage_responses;
CREATE POLICY "Triage: patient adds for own appointment" ON public.triage_responses FOR INSERT TO authenticated
  WITH CHECK (patient_id = (select auth.uid()) AND EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_id
    AND a.patient_id = (select auth.uid()) AND a.family_member_id IS NOT DISTINCT FROM triage_responses.family_member_id));

-- A3: patient uploads for own family members (register already validates family ownership); plans per family member.
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

-- ================= Conversations =================
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a uuid NOT NULL REFERENCES public.profiles(id),
  profile_b uuid NOT NULL REFERENCES public.profiles(id),
  kind text NOT NULL CHECK (kind IN ('patient_professional','professional')),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  CHECK (profile_a < profile_b),
  UNIQUE (profile_a, profile_b)
);
CREATE INDEX ON public.conversations(profile_b);
CREATE INDEX ON public.conversations(created_by);
GRANT SELECT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversations: participants" ON public.conversations FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (profile_a, profile_b));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id),
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL DEFAULT '',
  attachment_path text,
  attachment_mime text CHECK (attachment_mime IS NULL OR attachment_mime IN ('application/pdf','image/jpeg','image/png','image/webp')),
  attachment_size integer CHECK (attachment_size IS NULL OR (attachment_size > 0 AND attachment_size <= 15728640)),
  read_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.messages(conversation_id, created_at);
CREATE INDEX ON public.messages(sender_id);
GRANT SELECT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages: participants" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (select auth.uid()) IN (c.profile_a, c.profile_b)));

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM conversations c WHERE c.id = _conv AND auth.uid() IN (c.profile_a, c.profile_b));
$$;

-- Professional profile linked to a clinic: dentist member or clinic owner.
CREATE OR REPLACE FUNCTION public.profile_in_clinic(_profile uuid, _clinic uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM clinics c WHERE c.id = _clinic AND c.owner_profile_id = _profile)
      OR EXISTS (SELECT 1 FROM clinic_members m WHERE m.clinic_id = _clinic AND m.dentist_id = _profile);
$$;

-- Who may talk to whom (server-side rule, used by start_conversation).
CREATE OR REPLACE FUNCTION public.can_start_conversation(_me uuid, _other uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _r1 app_role; _r2 app_role;
BEGIN
  IF _me IS NULL OR _other IS NULL OR _me = _other THEN RETURN NULL; END IF;
  SELECT role INTO _r1 FROM profiles WHERE id = _me;
  SELECT role INTO _r2 FROM profiles WHERE id = _other;
  IF _r1 IS NULL OR _r2 IS NULL THEN RETURN NULL; END IF;
  IF _r1 = 'patient' AND _r2 = 'patient' THEN RETURN NULL; END IF;
  IF _r1 = 'patient' OR _r2 = 'patient' THEN
    -- Active relationship: a booked or past (not cancelled) appointment between them.
    IF EXISTS (SELECT 1 FROM appointments a
       WHERE a.status <> 'cancelada'
         AND ((a.patient_id = _me AND (a.dentist_id = _other OR public.profile_in_clinic(_other, a.clinic_id)))
           OR (a.patient_id = _other AND (a.dentist_id = _me OR public.profile_in_clinic(_me, a.clinic_id))))) THEN
      RETURN 'patient_professional';
    END IF;
    RETURN NULL;
  END IF;
  -- Professionals of the same clinic.
  IF EXISTS (SELECT 1 FROM clinics c WHERE public.profile_in_clinic(_me, c.id) AND public.profile_in_clinic(_other, c.id)) THEN
    RETURN 'professional';
  END IF;
  -- Approved clinic owner <-> dentist who published future availability (substitutions), either direction.
  IF EXISTS (SELECT 1 FROM clinics c WHERE c.verification_status = 'aprovado' AND c.owner_profile_id IN (_me, _other))
     AND EXISTS (SELECT 1 FROM dentist_availability d WHERE d.dentist_id IN (_me, _other) AND d.ends_at > now()) THEN
    RETURN 'professional';
  END IF;
  RETURN NULL;
END $$;

-- ================= Availability for substitutions =================
CREATE TABLE public.dentist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES public.profiles(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  city text NOT NULL,
  radius_km integer NOT NULL DEFAULT 20 CHECK (radius_km BETWEEN 0 AND 300),
  notes text CHECK (notes IS NULL OR length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (length(city) BETWEEN 1 AND 120)
);
CREATE INDEX ON public.dentist_availability(dentist_id);
CREATE INDEX ON public.dentist_availability(ends_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dentist_availability TO authenticated;
GRANT ALL ON public.dentist_availability TO service_role;
ALTER TABLE public.dentist_availability ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.owns_approved_clinic()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM clinics WHERE owner_profile_id = auth.uid() AND verification_status = 'aprovado');
$$;
CREATE POLICY "Availability: own dentist reads" ON public.dentist_availability FOR SELECT TO authenticated
  USING (dentist_id = (select auth.uid()) OR public.owns_approved_clinic());
CREATE POLICY "Availability: own dentist inserts" ON public.dentist_availability FOR INSERT TO authenticated
  WITH CHECK (dentist_id = (select auth.uid()) AND public.current_role_is('dentist'));
CREATE POLICY "Availability: own dentist updates" ON public.dentist_availability FOR UPDATE TO authenticated
  USING (dentist_id = (select auth.uid())) WITH CHECK (dentist_id = (select auth.uid()));
CREATE POLICY "Availability: own dentist deletes" ON public.dentist_availability FOR DELETE TO authenticated
  USING (dentist_id = (select auth.uid()));
CREATE TRIGGER trg_availability_updated BEFORE UPDATE ON public.dentist_availability FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Clinic view with the dentist's public name only.
CREATE OR REPLACE FUNCTION public.list_dentist_availability()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', d.id, 'dentist_id', d.dentist_id, 'dentist_name', p.full_name,
    'avatar_url', p.avatar_url, 'starts_at', d.starts_at, 'ends_at', d.ends_at, 'city', d.city, 'radius_km', d.radius_km, 'notes', d.notes)
    ORDER BY d.starts_at), '[]'::jsonb)
  FROM dentist_availability d JOIN profiles p ON p.id = d.dentist_id
  WHERE public.owns_approved_clinic() AND d.ends_at > now() AND coalesce(p.is_test, false) = false;
$$;

-- ================= Conversation RPCs =================
CREATE OR REPLACE FUNCTION public.start_conversation(_other uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me uuid := auth.uid(); _kind text; _a uuid; _b uuid; _id uuid;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  _a := least(_me, _other); _b := greatest(_me, _other);
  SELECT id INTO _id FROM conversations WHERE profile_a = _a AND profile_b = _b;
  IF _id IS NOT NULL THEN RETURN _id; END IF;
  _kind := public.can_start_conversation(_me, _other);
  IF _kind IS NULL THEN RAISE EXCEPTION 'no_relationship'; END IF;
  INSERT INTO conversations (profile_a, profile_b, kind, created_by) VALUES (_a, _b, _kind, _me) RETURNING id INTO _id;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.send_message(_conversation_id uuid, _body text, _attachment_path text DEFAULT NULL,
  _attachment_mime text DEFAULT NULL, _attachment_size integer DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
DECLARE _c conversations%ROWTYPE; _me uuid := auth.uid(); _other uuid; _id uuid; _name text;
BEGIN
  SELECT * INTO _c FROM conversations WHERE id = _conversation_id;
  IF NOT FOUND OR _me NOT IN (_c.profile_a, _c.profile_b) THEN RAISE EXCEPTION 'not_participant'; END IF;
  _other := CASE WHEN _c.profile_a = _me THEN _c.profile_b ELSE _c.profile_a END;
  -- A patient<->professional chat stays open only while the relationship exists.
  IF public.can_start_conversation(_me, _other) IS NULL THEN RAISE EXCEPTION 'no_relationship'; END IF;
  IF coalesce(trim(_body),'') = '' AND _attachment_path IS NULL THEN RAISE EXCEPTION 'empty_message'; END IF;
  IF length(_body) > 4000 THEN RAISE EXCEPTION 'too_long'; END IF;
  IF _attachment_path IS NOT NULL THEN
    IF split_part(_attachment_path, '/', 1) <> _conversation_id::text
       OR NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'message-attachments' AND o.name = _attachment_path AND o.owner_id = _me::text) THEN
      RAISE EXCEPTION 'invalid_attachment';
    END IF;
  END IF;
  INSERT INTO messages (conversation_id, sender_id, body, attachment_path, attachment_mime, attachment_size)
  VALUES (_conversation_id, _me, coalesce(trim(_body),''), _attachment_path, _attachment_mime, _attachment_size) RETURNING id INTO _id;
  UPDATE conversations SET last_message_at = now() WHERE id = _conversation_id;
  SELECT coalesce(full_name, '') INTO _name FROM profiles WHERE id = _me;
  PERFORM public.create_notification(_other, 'message', 'Nova mensagem', _name, '/app?tab=conversas');
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.void_message(_message_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _m messages%ROWTYPE;
BEGIN
  SELECT * INTO _m FROM messages WHERE id = _message_id;
  IF NOT FOUND OR _m.sender_id <> auth.uid() THEN RAISE EXCEPTION 'not_author'; END IF;
  IF _m.voided_at IS NOT NULL THEN RETURN; END IF;
  IF _m.created_at < now() - interval '5 minutes' THEN RAISE EXCEPTION 'void_window_closed'; END IF;
  UPDATE messages SET voided_at = now(), body = '', attachment_path = NULL, attachment_mime = NULL, attachment_size = NULL WHERE id = _message_id;
END $$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_conversation_participant(_conversation_id) THEN RAISE EXCEPTION 'not_participant'; END IF;
  UPDATE messages SET read_at = now() WHERE conversation_id = _conversation_id AND sender_id <> auth.uid() AND read_at IS NULL;
END $$;

CREATE OR REPLACE FUNCTION public.my_unread_messages()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM messages m JOIN conversations c ON c.id = m.conversation_id
   WHERE auth.uid() IN (c.profile_a, c.profile_b) AND m.sender_id <> auth.uid() AND m.read_at IS NULL AND m.voided_at IS NULL;
$$;

-- My conversations with the other party's public name/avatar only.
CREATE OR REPLACE FUNCTION public.my_conversations()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(x ORDER BY (x->>'last_message_at') DESC), '[]'::jsonb) FROM (
    SELECT jsonb_build_object('id', c.id, 'kind', c.kind, 'last_message_at', c.last_message_at,
      'other_id', o.id, 'other_name', o.full_name, 'other_avatar', o.avatar_url, 'other_role', o.role,
      'unread', (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> auth.uid() AND m.read_at IS NULL AND m.voided_at IS NULL),
      'last_body', (SELECT CASE WHEN m.voided_at IS NOT NULL THEN NULL ELSE left(m.body, 120) END FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1)) AS x
    FROM conversations c JOIN profiles o ON o.id = CASE WHEN c.profile_a = auth.uid() THEN c.profile_b ELSE c.profile_a END
    WHERE auth.uid() IN (c.profile_a, c.profile_b)) s;
$$;

-- People I may start a conversation with (public name/avatar only).
CREATE OR REPLACE FUNCTION public.my_contactable_profiles()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT auth.uid() AS uid),
  cand AS (
    SELECT a.dentist_id AS pid FROM appointments a, me WHERE a.patient_id = me.uid AND a.status <> 'cancelada' AND a.dentist_id IS NOT NULL
    UNION SELECT c.owner_profile_id FROM appointments a JOIN clinics c ON c.id = a.clinic_id, me WHERE a.patient_id = me.uid AND a.status <> 'cancelada'
    UNION SELECT a.patient_id FROM appointments a, me WHERE a.status <> 'cancelada' AND (a.dentist_id = me.uid OR public.profile_in_clinic(me.uid, a.clinic_id))
    UNION SELECT m.dentist_id FROM clinic_members m, me WHERE public.profile_in_clinic(me.uid, m.clinic_id)
    UNION SELECT c.owner_profile_id FROM clinics c, me WHERE public.profile_in_clinic(me.uid, c.id)
  )
  SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.full_name, 'avatar_url', p.avatar_url, 'role', p.role)), '[]'::jsonb)
  FROM cand JOIN profiles p ON p.id = cand.pid, me WHERE cand.pid IS NOT NULL AND cand.pid <> me.uid;
$$;

CREATE OR REPLACE FUNCTION public.open_message_attachment(_message_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _m messages%ROWTYPE;
BEGIN
  SELECT * INTO _m FROM messages WHERE id = _message_id;
  IF NOT FOUND OR NOT public.is_conversation_participant(_m.conversation_id) OR _m.attachment_path IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN _m.attachment_path;
END $$;

CREATE OR REPLACE FUNCTION public.can_upload_conversation_folder(_folder text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR _folder IS NULL OR _folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN RETURN false; END IF;
  RETURN public.is_conversation_participant(_folder::uuid);
END $$;

-- Message attachments: participants may upload into the conversation folder; nobody reads directly (signed by sign-file).
CREATE POLICY "msg-attachments insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments'
    AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','webp')
    AND public.can_upload_conversation_folder((storage.foldername(name))[1]));

-- ================= Avatars =================
CREATE POLICY "avatars own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text AND lower(storage.extension(name)) = 'webp');
CREATE POLICY "avatars own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "avatars own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text);
CREATE POLICY "avatars own select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (select auth.uid())::text);

-- profiles.avatar_url may only point to the owner's own folder in the avatars bucket.
CREATE OR REPLACE FUNCTION public.guard_avatar_url()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
     AND position(('/storage/v1/object/public/avatars/' || NEW.id::text || '/') IN NEW.avatar_url) = 0 THEN
    RAISE EXCEPTION 'invalid_avatar_url';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_avatar_url BEFORE UPDATE OF avatar_url ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_avatar_url();

REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid), public.profile_in_clinic(uuid, uuid), public.can_start_conversation(uuid, uuid),
  public.owns_approved_clinic(), public.list_dentist_availability(), public.start_conversation(uuid),
  public.send_message(uuid, text, text, text, integer), public.void_message(uuid), public.mark_conversation_read(uuid),
  public.my_unread_messages(), public.my_conversations(), public.my_contactable_profiles(), public.open_message_attachment(uuid),
  public.can_upload_conversation_folder(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid), public.owns_approved_clinic(), public.list_dentist_availability(),
  public.start_conversation(uuid), public.send_message(uuid, text, text, text, integer), public.void_message(uuid),
  public.mark_conversation_read(uuid), public.my_unread_messages(), public.my_conversations(), public.my_contactable_profiles(),
  public.open_message_attachment(uuid), public.can_upload_conversation_folder(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.guard_avatar_url() TO authenticated, anon;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;