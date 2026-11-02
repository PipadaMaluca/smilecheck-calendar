ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS showcased_achievements text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_showcase_max8 CHECK (cardinality(showcased_achievements) <= 8);
COMMENT ON COLUMN public.profiles.showcased_achievements IS 'Up to 8 achievement keys the user highlights on their profile; written only by the owner (Own profile update policy), public via professional_public_profiles.';
CREATE OR REPLACE VIEW public.professional_public_profiles AS
 SELECT id, full_name, avatar_url, role, language, showcased_achievements
   FROM profiles p
  WHERE role = 'dentist'::app_role AND (EXISTS ( SELECT 1 FROM dentists d WHERE d.id = p.id AND d.verification_status = 'aprovado'::verification_status))
     OR role = 'clinic'::app_role AND (EXISTS ( SELECT 1 FROM clinics c WHERE c.owner_profile_id = p.id AND c.verification_status = 'aprovado'::verification_status));