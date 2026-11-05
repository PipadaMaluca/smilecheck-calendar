-- Rolled-back security test: conversations, messages, attachments, availability, avatars (ends with RAISE so nothing is kept).
INSERT INTO auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-4000-8000-0000000000c1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c1@qa-rollback.test','{"role":"patient"}',now(),now()),
       ('00000000-0000-4000-8000-0000000000c2','00000000-0000-0000-0000-000000000000','authenticated','authenticated','c2@qa-rollback.test','{"role":"patient"}',now(),now());
SELECT set_config('app.trusted_write','on',true);
UPDATE public.profiles SET role='patient', is_seed=true, terms_accepted_at=now(), terms_version=public.current_terms_version() WHERE id IN ('00000000-0000-4000-8000-0000000000c1','00000000-0000-4000-8000-0000000000c2');
UPDATE public.clinics SET verification_status='pendente' WHERE id='c9c4b85b-3a8b-47c3-b423-b1c5afd437fd';
SELECT set_config('app.trusted_write','off',true);
CREATE TEMP TABLE r(k text, v text) ON COMMIT DROP; GRANT ALL ON r TO authenticated;
CREATE OR REPLACE FUNCTION pg_temp.as_user(u text) RETURNS text LANGUAGE sql AS $$ SELECT set_config('request.jwt.claims', json_build_object('sub',u,'role','authenticated')::text, true) $$;
GRANT EXECUTE ON FUNCTION pg_temp.as_user(text) TO authenticated;
-- 1) no relationship -> refused
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000c1'); SET LOCAL ROLE authenticated;
DO $$ BEGIN PERFORM public.start_conversation('ab4212ff-23a6-484e-acb6-703cd345d54d'); INSERT INTO r VALUES ('norel_start','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('norel_start', SQLERRM); END $$;
DO $$ BEGIN PERFORM public.start_conversation('00000000-0000-4000-8000-0000000000c2'); INSERT INTO r VALUES ('patient_patient','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('patient_patient', SQLERRM); END $$;
DO $$ BEGIN INSERT INTO dentist_availability(dentist_id, starts_at, ends_at, city) VALUES (auth.uid(), now()+interval '1 day', now()+interval '2 days', 'X'); INSERT INTO r VALUES ('patient_publish','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('patient_publish', 'denied'); END $$;
RESET ROLE;
-- booked appointment -> allowed
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000c1');
INSERT INTO appointments (patient_id, dentist_id, clinic_id, consultation_type, status, scheduled_at, duration_minutes, is_seed)
VALUES ('00000000-0000-4000-8000-0000000000c1','ab4212ff-23a6-484e-acb6-703cd345d54d','22d1b353-e031-483b-af83-23cc7896db53','avaliacao','agendada', now()+interval '3 days',30,true);
SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'conv', public.start_conversation('ab4212ff-23a6-484e-acb6-703cd345d54d')::text;
INSERT INTO r SELECT 'msg', public.send_message((SELECT v::uuid FROM r WHERE k='conv'), 'olá')::text;
DO $$ BEGIN INSERT INTO messages(conversation_id, sender_id, body) VALUES ((SELECT v::uuid FROM r WHERE k='conv'), auth.uid(), 'x'); INSERT INTO r VALUES ('direct_insert','allowed?'); EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('direct_insert','denied'); END $$;
DO $$ BEGIN DELETE FROM messages; INSERT INTO r VALUES ('delete','allowed?'); EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('delete','denied'); END $$;
RESET ROLE;
SELECT pg_temp.as_user('ab4212ff-23a6-484e-acb6-703cd345d54d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'dentist_reads', count(*)::text FROM messages WHERE conversation_id = (SELECT v::uuid FROM r WHERE k='conv');
INSERT INTO r SELECT 'dentist_unread', public.my_unread_messages()::text;
DO $$ BEGIN PERFORM public.void_message((SELECT v::uuid FROM r WHERE k='msg')); INSERT INTO r VALUES ('void_other','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('void_other', SQLERRM); END $$;
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000c2'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'alien_reads', count(*)::text FROM messages;
INSERT INTO r SELECT 'alien_convs', count(*)::text FROM conversations;
DO $$ BEGIN PERFORM public.send_message((SELECT v::uuid FROM r WHERE k='conv'), 'intruso'); INSERT INTO r VALUES ('alien_send','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('alien_send', SQLERRM); END $$;
DO $$ BEGIN PERFORM public.open_message_attachment((SELECT v::uuid FROM r WHERE k='msg')); INSERT INTO r VALUES ('alien_attach','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('alien_attach', SQLERRM); END $$;
INSERT INTO r SELECT 'alien_upload_folder', public.can_upload_conversation_folder((SELECT v FROM r WHERE k='conv'))::text;
RESET ROLE;
-- void window: author within 5 min ok, after 5 min refused
UPDATE messages SET created_at = now() - interval '6 minutes' WHERE id = (SELECT v::uuid FROM r WHERE k='msg');
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000c1'); SET LOCAL ROLE authenticated;
DO $$ BEGIN PERFORM public.void_message((SELECT v::uuid FROM r WHERE k='msg')); INSERT INTO r VALUES ('void_late','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('void_late', SQLERRM); END $$;
INSERT INTO r SELECT 'msg2', public.send_message((SELECT v::uuid FROM r WHERE k='conv'), 'outra')::text;
SELECT public.void_message((SELECT v::uuid FROM r WHERE k='msg2'));
INSERT INTO r SELECT 'void_ok', (voided_at IS NOT NULL AND body = '')::text FROM messages WHERE id = (SELECT v::uuid FROM r WHERE k='msg2');
DO $$ BEGIN UPDATE profiles SET avatar_url = 'https://x/storage/v1/object/sign/avatars/ab4212ff-23a6-484e-acb6-703cd345d54d/a.webp' WHERE id = auth.uid(); INSERT INTO r VALUES ('avatar_other_folder','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('avatar_other_folder', SQLERRM); END $$;
UPDATE profiles SET avatar_url = 'https://x/storage/v1/object/sign/avatars/00000000-0000-4000-8000-0000000000c1/a.webp' WHERE id = auth.uid();
INSERT INTO r SELECT 'avatar_own', (avatar_url LIKE '%0000000000c1%')::text FROM profiles WHERE id = auth.uid();
UPDATE profiles SET avatar_url = 'x' WHERE id = 'ab4212ff-23a6-484e-acb6-703cd345d54d';
RESET ROLE;
INSERT INTO r SELECT 'avatar_write_other_profile', (avatar_url = 'x')::text FROM profiles WHERE id = 'ab4212ff-23a6-484e-acb6-703cd345d54d';
-- availability
SELECT pg_temp.as_user('ab4212ff-23a6-484e-acb6-703cd345d54d'); SET LOCAL ROLE authenticated;
INSERT INTO dentist_availability(dentist_id, starts_at, ends_at, city) VALUES (auth.uid(), now()+interval '1 day', now()+interval '2 days', 'Lisboa');
DO $$ BEGIN INSERT INTO dentist_availability(dentist_id, starts_at, ends_at, city) VALUES ('181975e9-8ef0-46da-ae84-5ad21eae930d', now()+interval '1 day', now()+interval '2 days', 'X'); INSERT INTO r VALUES ('publish_for_other','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('publish_for_other', 'denied'); END $$;
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000c1'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'patient_reads_avail', count(*)::text FROM dentist_availability;
RESET ROLE;
SELECT pg_temp.as_user('181975e9-8ef0-46da-ae84-5ad21eae930d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'other_dentist_reads_avail', count(*)::text FROM dentist_availability WHERE dentist_id <> auth.uid();
RESET ROLE;
SELECT pg_temp.as_user('0484a585-61cd-4ef8-8747-cfe4c58b3689'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'pending_clinic_reads_avail', count(*)::text FROM dentist_availability;
RESET ROLE;
SELECT pg_temp.as_user('f94a287f-cefa-401f-a924-fafcce0708cc'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'approved_clinic_reads_avail', (count(*) >= 1)::text FROM dentist_availability;
INSERT INTO r SELECT 'approved_clinic_contacts', (public.start_conversation('ab4212ff-23a6-484e-acb6-703cd345d54d') IS NOT NULL)::text;
RESET ROLE;
-- buckets: no client read/sign policy on private files
INSERT INTO r SELECT 'select_policies_private', count(*)::text FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND cmd='SELECT' AND (qual LIKE '%clinical-documents%' OR qual LIKE '%message-attachments%');
INSERT INTO r SELECT 'buckets_public', string_agg(id||':'||public::text, ',') FROM storage.buckets WHERE id IN ('clinical-documents','message-attachments','avatars');
DO $x$ BEGIN RAISE EXCEPTION 'RESULTS: %', (SELECT string_agg(k||'='||coalesce(v,'null'), ' | ') FROM r); END $x$;
