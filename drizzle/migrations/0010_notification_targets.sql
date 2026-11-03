CREATE OR REPLACE FUNCTION public.notification_default_target(_type text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _type IN ('appointment','appointment_created','appointment_confirmed','appointment_cancelled',
                   'appointment_changed','appointment_reminder_24h','appointment_reminder_1h',
                   'waiting_list','waiting_room') THEN '/app?tab=agenda'
    WHEN _type IN ('points','level_up','streak','feedback_pending') THEN '/app?tab=pontuacoes'
    WHEN _type = 'feedback_received' THEN '/app?tab=pontuacoes&section=avaliacoes'
    WHEN _type IN ('achievement','achievement_unlocked') THEN '/app?tab=conquistas'
    WHEN _type = 'message' THEN '/app?tab=conversas'
    WHEN _type IN ('referral','referral_used') THEN '/app?tab=convidar&section=convites'
    WHEN _type = 'prescription' THEN '/app?tab=saude&section=receitas'
    WHEN _type = 'referral_letter' THEN '/app?tab=saude&section=referencias'
    WHEN _type = 'daily_summary' THEN '/app?tab=estatisticas'
    WHEN _type = 'new_dentist' THEN '/app?tab=equipa'
    ELSE '/app?tab=home'
  END
$$;
REVOKE ALL ON FUNCTION public.notification_default_target(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notification_default_target(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.normalize_notification_target()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.action_url IS NULL OR NEW.action_url !~ '^/app\?tab=[a-z_]+' THEN
    NEW.action_url := public.notification_default_target(NEW.type);
  ELSIF NEW.type = 'feedback_received' AND NEW.action_url = '/app?tab=pontuacoes' THEN
    NEW.action_url := '/app?tab=pontuacoes&section=avaliacoes';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.normalize_notification_target() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_normalize_notification_target ON public.notifications;
CREATE TRIGGER trg_normalize_notification_target
BEFORE INSERT OR UPDATE OF action_url ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.normalize_notification_target();

UPDATE public.notifications
   SET action_url = public.notification_default_target(type)
 WHERE action_url IS NULL OR action_url !~ '^/app\?tab=[a-z_]+';
UPDATE public.notifications
   SET action_url = '/app?tab=pontuacoes&section=avaliacoes'
 WHERE type = 'feedback_received' AND action_url = '/app?tab=pontuacoes';