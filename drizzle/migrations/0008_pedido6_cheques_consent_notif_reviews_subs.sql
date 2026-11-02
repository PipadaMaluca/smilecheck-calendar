-- 3. Cheques (Portugal only)
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'PT',
  ADD COLUMN IF NOT EXISTS accepts_cheque_dentista boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_cheque_protese boolean NOT NULL DEFAULT false;
UPDATE public.clinics SET country = CASE WHEN timezone = 'Europe/Paris' THEN 'FR' ELSE 'PT' END;
UPDATE public.clinics SET accepts_cheque_dentista = true, accepts_cheque_protese = true WHERE name = 'Clínica SmileCheck';
ALTER TABLE public.clinics ADD CONSTRAINT clinics_country_check CHECK (country IN ('PT','FR'));

CREATE OR REPLACE FUNCTION public.guard_clinic_cheques()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- country always follows the clinic timezone
  NEW.country := CASE WHEN NEW.timezone = 'Europe/Paris' THEN 'FR' ELSE 'PT' END;
  IF NEW.country <> 'PT' AND (NEW.accepts_cheque_dentista OR NEW.accepts_cheque_protese) THEN
    RAISE EXCEPTION 'cheques_only_portugal';
  END IF;
  IF TG_OP = 'UPDATE' AND public.is_untrusted_caller()
     AND (NEW.accepts_cheque_dentista IS DISTINCT FROM OLD.accepts_cheque_dentista
          OR NEW.accepts_cheque_protese IS DISTINCT FROM OLD.accepts_cheque_protese)
     AND OLD.owner_profile_id IS DISTINCT FROM (select auth.uid()) THEN
    RAISE EXCEPTION 'cheques_owner_only';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_clinic_cheques BEFORE INSERT OR UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.guard_clinic_cheques();

-- 4. Consent
CREATE TABLE public.consent_preferences (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  statistics boolean NOT NULL DEFAULT false,
  ads boolean NOT NULL DEFAULT false,
  decided_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_preferences TO authenticated;
GRANT ALL ON public.consent_preferences TO service_role;
ALTER TABLE public.consent_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own consent read" ON public.consent_preferences FOR SELECT TO authenticated USING (profile_id = (select auth.uid()));
CREATE POLICY "Own consent insert" ON public.consent_preferences FOR INSERT TO authenticated WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "Own consent update" ON public.consent_preferences FOR UPDATE TO authenticated USING (profile_id = (select auth.uid())) WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "Own consent delete" ON public.consent_preferences FOR DELETE TO authenticated USING (profile_id = (select auth.uid()));
CREATE TRIGGER trg_consent_updated BEFORE UPDATE ON public.consent_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Notification preferences
CREATE TABLE public.notification_preferences (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notif_type text NOT NULL CHECK (notif_type IN ('reminders','confirmations','points','news')),
  channel text NOT NULL CHECK (channel IN ('email','push','sms','whatsapp')),
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, notif_type, channel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notif read" ON public.notification_preferences FOR SELECT TO authenticated USING (profile_id = (select auth.uid()));
CREATE POLICY "Own notif insert" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "Own notif update" ON public.notification_preferences FOR UPDATE TO authenticated USING (profile_id = (select auth.uid())) WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "Own notif delete" ON public.notification_preferences FOR DELETE TO authenticated USING (profile_id = (select auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_notification_channel()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- push, SMS and WhatsApp are not available yet ("Em breve")
  IF NEW.channel <> 'email' AND NEW.enabled AND public.is_untrusted_caller() THEN
    RAISE EXCEPTION 'channel_not_available';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_notification_channel BEFORE INSERT OR UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.guard_notification_channel();

-- 7. Verified reviews: only after a 'visto'/'concluida' appointment between both parties
CREATE OR REPLACE FUNCTION public.can_rate_appointment(_appointment_id uuid, _to_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.appointments a
      LEFT JOIN public.clinics c ON c.id = a.clinic_id
     WHERE a.id = _appointment_id
       AND a.status IN ('visto','concluida')
       AND (a.patient_id = auth.uid() OR a.dentist_id = auth.uid()
            OR c.owner_profile_id = auth.uid() OR public.is_clinic_member(a.clinic_id))
       AND _to_profile_id IN (a.patient_id, a.dentist_id, c.owner_profile_id)
       AND _to_profile_id <> auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.guard_feedback_verified()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.appointment_id IS NULL OR NOT public.can_rate_appointment(NEW.appointment_id, NEW.to_profile_id) THEN
    RAISE EXCEPTION 'review_requires_completed_appointment';
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.appointment_id IS DISTINCT FROM OLD.appointment_id OR NEW.to_profile_id IS DISTINCT FROM OLD.to_profile_id) THEN
    RAISE EXCEPTION 'review_target_immutable';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_feedback_verified BEFORE INSERT OR UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.guard_feedback_verified();
-- 1 review per appointment per author
CREATE UNIQUE INDEX IF NOT EXISTS uq_feedback_one_per_appt_author ON public.feedback (appointment_id, from_profile_id);

-- 8. Subscriptions (written only by the payments webhook / service role)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own subscriptions read" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- Server-only: recompute profiles.plan from the active subscription (trusted write)
CREATE OR REPLACE FUNCTION public.sync_profile_plan(_user_id uuid, _env text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _plan text := 'free';
BEGIN
  SELECT CASE WHEN s.price_id LIKE '%\_premium\_%' THEN 'premium' WHEN s.price_id LIKE '%\_pro\_%' THEN 'pro' ELSE 'free' END
    INTO _plan
    FROM public.subscriptions s
   WHERE s.user_id = _user_id AND s.environment = _env
     AND (s.status IN ('active','trialing','past_due') OR (s.status = 'canceled' AND s.current_period_end > now()))
     AND (s.current_period_end IS NULL OR s.current_period_end > now())
   ORDER BY s.created_at DESC LIMIT 1;
  _plan := coalesce(_plan, 'free');
  PERFORM set_config('app.trusted_write', 'on', true);
  UPDATE public.profiles SET plan = _plan WHERE id = _user_id;
  PERFORM set_config('app.trusted_write', 'off', true);
  RETURN _plan;
END $$;
REVOKE ALL ON FUNCTION public.sync_profile_plan(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profile_plan(uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.guard_clinic_cheques() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guard_notification_channel() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guard_feedback_verified() FROM PUBLIC, anon;