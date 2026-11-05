Security tests run inside a DO block that ends with `RAISE EXCEPTION 'ROLLBACK:%'`, so every row they create is rolled back.
`clinical_documents_rls.sql`: prescriptions / referral letters (RLS, immutability, void with reason, public QR check without patient data), private rankings, job market.
