DROP POLICY IF EXISTS "clinical-docs insert" ON storage.objects;
CREATE POLICY "clinical-docs insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clinical-documents'
    AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','webp')
    AND public.can_access_patient_folder((storage.foldername(name))[1]));