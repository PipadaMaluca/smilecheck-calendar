REVOKE ALL ON public.clinical_notes, public.clinical_note_versions, public.odontogram_entries, public.treatment_plans,
  public.treatment_plan_items, public.clinical_documents, public.triage_responses FROM anon, PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.clinical_notes, public.clinical_note_versions,
  public.odontogram_entries, public.treatment_plans, public.treatment_plan_items, public.clinical_documents FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.triage_responses FROM authenticated;
GRANT SELECT ON public.clinical_notes, public.clinical_note_versions, public.odontogram_entries, public.treatment_plans,
  public.treatment_plan_items, public.clinical_documents TO authenticated;
GRANT SELECT, INSERT ON public.triage_responses TO authenticated;