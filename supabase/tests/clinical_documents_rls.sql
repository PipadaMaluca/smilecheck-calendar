-- Rolled-back security test (see README). Replace the four ids with QA accounts:
-- d = approved test dentist, pa = test patient, co = test clinic owner, cl = that owner's approved clinic.
DO $$
DECLARE
  d uuid := 'e787f03f-b6c2-4b89-b92d-7a13588573e3'; pa uuid := '052d5906-fa47-47ea-a9d1-3cea7b706229';
  co uuid := '5c5a8f45-b43f-4a23-adab-a209bfa3fe1c'; cl uuid := '7e814588-884b-4032-9866-2b42acefd64e';
  other uuid; rx uuid; rl uuid; code text; out text := ''; n int; j jsonb; post uuid;
BEGIN
  SELECT id INTO other FROM profiles WHERE role='dentist' AND id<>d AND NOT is_test LIMIT 1;
  INSERT INTO clinic_members (clinic_id, dentist_id) VALUES (cl, d) ON CONFLICT DO NOTHING;
  INSERT INTO appointments (patient_id, dentist_id, clinic_id, consultation_type, status, scheduled_at, duration_minutes)
  VALUES (pa, d, cl, 'avaliacao', 'agendada', now() + interval '3 days', 30);

  PERFORM set_config('request.jwt.claims', json_build_object('sub', d, 'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  rx := issue_prescription(pa, cl, '[{"medicamento":"Amoxicilina","dosagem":"500mg","posologia":"8/8h","duracao":"7 dias","quantidade":"1 caixa"}]'::jsonb, 'nota');
  SELECT number, verification_code INTO n, code FROM prescriptions WHERE id = rx;
  out := out || ' rx_no=' || n;
  BEGIN UPDATE prescriptions SET notes='x' WHERE id=rx; GET DIAGNOSTICS n = ROW_COUNT; out := out || ' direct_update_rows=' || n;
  EXCEPTION WHEN others THEN out := out || ' direct_update_refused'; END;
  BEGIN DELETE FROM prescriptions WHERE id=rx; GET DIAGNOSTICS n = ROW_COUNT; out := out || ' delete_rows=' || n;
  EXCEPTION WHEN others THEN out := out || ' delete_refused'; END;
  BEGIN INSERT INTO prescriptions (number, clinic_id, dentist_id, patient_id, items, verification_code) VALUES (99, cl, d, pa, '[]', 'X');
    out := out || ' DIRECT_INSERT_OK'; EXCEPTION WHEN others THEN out := out || ' direct_insert_refused'; END;
  rl := issue_referral_letter(pa, cl, 'Endodontia', 'resumo', 'urgente', other);
  j := my_ranking(); out := out || ' ranking_has_names=' || (j::text ~ 'full_name');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', other, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM referral_letters WHERE id = rl; out := out || ' recipient_letter=' || n;
  SELECT count(*) INTO n FROM prescriptions WHERE id = rx; out := out || ' recipient_rx=' || n;
  out := out || ' recipient_dossier=' || can_read_dossier(pa);
  BEGIN PERFORM issue_prescription(pa, cl, '[{"medicamento":"X"}]'); out := out || ' UNRELATED_ISSUE_OK';
  EXCEPTION WHEN others THEN out := out || ' unrelated_issue_refused'; END;
  BEGIN PERFORM void_clinical_document('prescription', rx, 'erro'); out := out || ' OTHER_VOID_OK';
  EXCEPTION WHEN others THEN out := out || ' other_void_refused'; END;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', pa, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM prescriptions; out := out || ' patient_rx=' || n;
  BEGIN PERFORM my_ranking(); out := out || ' PATIENT_RANKING_OK'; EXCEPTION WHEN others THEN out := out || ' patient_ranking_refused'; END;
  SELECT count(*) INTO n FROM job_posts; out := out || ' patient_jobs=' || n;
  UPDATE patients SET self_health = '{"medications":[{"name":"Varfarina","dosage":"5mg"}]}' WHERE id = pa;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', d, 'role','authenticated')::text, true);
  j := dossier_safety(pa); out := out || ' safety_meds=' || jsonb_array_length(j->'medications');
  BEGIN UPDATE patients SET self_health = '{}' WHERE id = pa; out := out || ' DENTIST_SELF_HEALTH_OK';
  EXCEPTION WHEN others THEN out := out || ' dentist_self_health_refused'; END;
  BEGIN PERFORM void_clinical_document('prescription', rx, ''); out := out || ' EMPTY_REASON_OK';
  EXCEPTION WHEN others THEN out := out || ' empty_reason_refused'; END;
  PERFORM void_clinical_document('prescription', rx, 'Dose errada');
  BEGIN PERFORM void_clinical_document('prescription', rx, 'outra vez'); out := out || ' REVOID_OK';
  EXCEPTION WHEN others THEN out := out || ' revoid_refused'; END;

  RESET ROLE;
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
  SET LOCAL ROLE anon;
  j := verify_document(code); out := out || ' verify=' || j::text;

  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', co, 'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  INSERT INTO job_posts (clinic_id, created_by, title, contract_type, days, city) VALUES (cl, co, 'Dentista generalista', 'partTime', '{mon,wed}', 'Lisboa') RETURNING id INTO post;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', d, 'role','authenticated')::text, true);
  INSERT INTO job_applications (post_id, dentist_id, message) VALUES (post, d, 'Olá');
  BEGIN INSERT INTO job_applications (post_id, dentist_id) VALUES (post, other); out := out || ' APPLY_AS_OTHER_OK';
  EXCEPTION WHEN others THEN out := out || ' apply_as_other_refused'; END;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', other, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM job_applications WHERE post_id=post; out := out || ' other_dentist_sees_apps=' || n;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', co, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM job_applications WHERE post_id=post; out := out || ' clinic_sees_apps=' || n;
  SELECT count(*) INTO n FROM notifications WHERE profile_id=co AND type='job_application'; out := out || ' clinic_notif=' || n;
  RESET ROLE;
  RAISE EXCEPTION 'ROLLBACK:%', out;
END $$;
