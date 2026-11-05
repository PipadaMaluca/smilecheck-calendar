# Clinical dossier rules (real accounts)

- Real dossier = `RealPatientDossier` (src/components/dossier) behind `PatientDossierView` when `!useDirectory().isDemo`; the demo mock body stays untouched.
- All dossier writes go through RPCs (`save_clinical_note`, `add_odontogram_entry`, `create_treatment_plan`, `add_treatment_item`, `set_treatment_item_status`, `register_clinical_document`) that call `assert_dossier_writer` (clinic professional + `can_read_dossier` + `can_edit_patient` 12-month window); tables grant clients SELECT only — no client INSERT/UPDATE/DELETE.
- Notes are corrected, never deleted: every save appends an immutable `clinical_note_versions` row; "editada em" shows when version > 1. Odontogram is append-only (latest entry per tooth = current state).
- Reads: author always, otherwise `can_read_dossier` — so after a dentist+clinic change the old dentist keeps only his own rows.
- Patients read plans only via `my_treatment_plans()` (no `internal_notes`); self-declared data reaches professionals via `dossier_self_declared` (logged), shown apart from professional notes.
- Clinical files: private bucket `clinical-documents`, path `<patient_id>/<uuid>.<ext>`, storage RLS via `can_access_patient_folder`; every view calls `open_clinical_document` (logs access) and then a ≤60 s signed URL — never public URLs.
- Triage answers live in `triage_responses` (patient inserts for own appointment); detail views show them read-only via `RealTriagePanel`.
- Security tests: `supabase/tests/dossier_rls_rollback.sql` (always rolls back).
