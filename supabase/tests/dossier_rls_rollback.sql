-- Rolled-back security test for the clinical dossier (ends with RAISE so nothing is kept). Run via SQL runner.
INSERT INTO auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-4000-8000-0000000000a1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p1@qa-rollback.test','{"role":"patient"}',now(),now()),
       ('00000000-0000-4000-8000-0000000000a2','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p2@qa-rollback.test','{"role":"patient"}',now(),now());
UPDATE public.profiles SET role='patient', is_seed=true WHERE id IN ('00000000-0000-4000-8000-0000000000a1','00000000-0000-4000-8000-0000000000a2');
CREATE TEMP TABLE r(k text, v text) ON COMMIT DROP; GRANT ALL ON r TO authenticated;
-- DA (ab42) at clinic A 22d1, 3 months ago, visto
INSERT INTO appointments (id, patient_id, dentist_id, clinic_id, consultation_type, status, scheduled_at, duration_minutes, is_seed)
VALUES ('00000000-0000-4000-8000-0000000000b1','00000000-0000-4000-8000-0000000000a1','ab4212ff-23a6-484e-acb6-703cd345d54d','22d1b353-e031-483b-af83-23cc7896db53','avaliacao','visto', now()-interval '90 days',30,true);
CREATE OR REPLACE FUNCTION pg_temp.as_user(u text) RETURNS void LANGUAGE sql AS $$ SELECT set_config('request.jwt.claims', json_build_object('sub',u,'role','authenticated')::text, true) $$;
-- DA writes note + odontogram + plan
SELECT pg_temp.as_user('ab4212ff-23a6-484e-acb6-703cd345d54d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'note_id', public.save_clinical_note('00000000-0000-4000-8000-0000000000b1','dor','obs','carie 16','rest','recall')::text;
SELECT public.save_clinical_note('00000000-0000-4000-8000-0000000000b1','dor','obs editada','carie 16','rest','recall');
INSERT INTO r SELECT 'versions', count(*)::text FROM clinical_note_versions;
INSERT INTO r SELECT 'note_version', version::text FROM clinical_notes;
SELECT public.add_odontogram_entry('00000000-0000-4000-8000-0000000000a1','22d1b353-e031-483b-af83-23cc7896db53',16,ARRAY['O'],'carie','{"O":"cavity"}');
INSERT INTO r SELECT 'plan', public.create_treatment_plan('00000000-0000-4000-8000-0000000000a1','22d1b353-e031-483b-af83-23cc7896db53','Plano','NOTA INTERNA')::text;
SELECT public.add_treatment_item((SELECT v::uuid FROM r WHERE k='plan'),'Restauração',16,60);
DO $$ BEGIN DELETE FROM clinical_notes; INSERT INTO r VALUES ('delete','allowed?'); EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('delete','denied'); END $$;
DO $$ BEGIN UPDATE clinical_note_versions SET motivo='x'; INSERT INTO r VALUES ('version_update','allowed?'); EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('version_update','denied'); END $$;
DO $$ BEGIN INSERT INTO clinical_notes(appointment_id,patient_id,author_id,clinic_id) VALUES ('00000000-0000-4000-8000-0000000000b1','00000000-0000-4000-8000-0000000000a1',auth.uid(),'22d1b353-e031-483b-af83-23cc7896db53'); INSERT INTO r VALUES ('direct_insert','allowed?'); EXCEPTION WHEN insufficient_privilege THEN INSERT INTO r VALUES ('direct_insert','denied'); END $$;
RESET ROLE;
-- Same clinic colleague (1819) sees note
SELECT pg_temp.as_user('181975e9-8ef0-46da-ae84-5ad21eae930d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'colleague_sees_notes', count(*)::text FROM clinical_notes;
RESET ROLE;
-- DB (8f85, clinic B only): no relationship
SELECT pg_temp.as_user('8f855138-6c87-48ed-bb3c-453087bf9784'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'norel_notes', count(*)::text FROM clinical_notes;
INSERT INTO r SELECT 'norel_odo', count(*)::text FROM odontogram_entries;
DO $$ BEGIN PERFORM public.save_clinical_note('00000000-0000-4000-8000-0000000000b1','x','x','x','x','x'); INSERT INTO r VALUES ('norel_write','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('norel_write', SQLERRM); END $$;
RESET ROLE;
-- Patient alien a2
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000a2'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'alien_notes', count(*)::text FROM clinical_notes;
INSERT INTO r SELECT 'alien_plans', jsonb_array_length(public.my_treatment_plans())::text;
INSERT INTO r SELECT 'alien_folder', public.can_access_patient_folder('00000000-0000-4000-8000-0000000000a1')::text;
RESET ROLE;
-- Patient a1: plans without internal notes, no raw table access
SELECT pg_temp.as_user('00000000-0000-4000-8000-0000000000a1'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'patient_plans_has_internal', (public.my_treatment_plans()::text LIKE '%NOTA INTERNA%')::text;
INSERT INTO r SELECT 'patient_plan_items', (public.my_treatment_plans()->0->'items')::text;
INSERT INTO r SELECT 'patient_raw_plans', count(*)::text FROM treatment_plans;
INSERT INTO r SELECT 'patient_own_folder', public.can_access_patient_folder('00000000-0000-4000-8000-0000000000a1')::text;
RESET ROLE;
-- Patient moves to DB at clinic B (later visto) -> DA keeps only own notes
INSERT INTO appointments (id, patient_id, dentist_id, clinic_id, consultation_type, status, scheduled_at, duration_minutes, is_seed)
VALUES ('00000000-0000-4000-8000-0000000000b2','00000000-0000-4000-8000-0000000000a1','8f855138-6c87-48ed-bb3c-453087bf9784','c9c4b85b-3a8b-47c3-b423-b1c5afd437fd','avaliacao','visto', now()-interval '10 days',30,true);
SELECT pg_temp.as_user('8f855138-6c87-48ed-bb3c-453087bf9784'); SET LOCAL ROLE authenticated;
SELECT public.save_clinical_note('00000000-0000-4000-8000-0000000000b2','novo','obs B','','','');
RESET ROLE;
SELECT pg_temp.as_user('ab4212ff-23a6-484e-acb6-703cd345d54d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'old_dentist_notes_visible', string_agg(motivo, ',') FROM clinical_notes;
INSERT INTO r SELECT 'old_dentist_odo_own', count(*)::text FROM odontogram_entries;
DO $$ BEGIN PERFORM public.save_clinical_note('00000000-0000-4000-8000-0000000000b1','y','y','y','y','y'); INSERT INTO r VALUES ('old_dentist_write','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('old_dentist_write', SQLERRM); END $$;
RESET ROLE;
SELECT pg_temp.as_user('181975e9-8ef0-46da-ae84-5ad21eae930d'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'old_colleague_notes', count(*)::text FROM clinical_notes;
RESET ROLE;
-- 12-month window: DB's appointment moved to 13 months ago and DA's removed; DB has only last_done relation but window closed
UPDATE appointments SET scheduled_at = now()-interval '13 months' WHERE id IN ('00000000-0000-4000-8000-0000000000b2','00000000-0000-4000-8000-0000000000b1');
SELECT pg_temp.as_user('8f855138-6c87-48ed-bb3c-453087bf9784'); SET LOCAL ROLE authenticated;
INSERT INTO r SELECT 'window_read_still', count(*)::text FROM clinical_notes;
DO $$ BEGIN PERFORM public.save_clinical_note('00000000-0000-4000-8000-0000000000b2','z','z','z','z','z'); INSERT INTO r VALUES ('window_write','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('window_write', SQLERRM); END $$;
RESET ROLE;
-- anon
SET LOCAL ROLE anon;
DO $$ BEGIN PERFORM count(*) FROM clinical_documents; INSERT INTO r VALUES ('anon_docs','allowed?'); EXCEPTION WHEN others THEN INSERT INTO r VALUES ('anon_docs', 'denied'); END $$;
RESET ROLE;
INSERT INTO r SELECT 'bucket_public', public::text FROM storage.buckets WHERE id='clinical-documents';
DO $x$ BEGIN RAISE EXCEPTION 'RESULTS: %', (SELECT string_agg(k||'='||coalesce(v,'null'), ' | ') FROM r); END $x$;
