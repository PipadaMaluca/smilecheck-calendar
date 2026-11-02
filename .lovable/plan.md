# Plano de segurança da base de dados (revisto)

Só plano. Nada é aplicado até aprovares. Uma migração por fase, testada antes da seguinte.

## O que muda em relação à versão anterior
- Estados de consulta: só os 8 válidos (`agendada, confirmada, em_sala_de_espera, em_consulta, concluida, cancelada, falta, visto`). Sai `reagendamento_pendente`. O paciente só pode pôr `confirmada` ou `cancelada`; reagendar = mudar `scheduled_at`.
- Todos os triggers usam `auth.role()` e bloqueiam quando é `authenticated` ou `anon`.
- `award_points` recusa por defeito: lista explícita de ações, tudo o resto dá erro.
- `convidar_amigo` suspenso até existir sistema de convites com o id do convidado.
- `confirm_phone_verification`: só `service_role`.
- `triage-ai`: o uso é registado pelo servidor (service role) antes de chamar a IA; sem INSERT para `authenticated`.
- `protect_patient_fields` e `restrict_professional_patient_update` passam a ser um único trigger.

## Fases
1. Campos protegidos (role, patients, appointments)
2. `award_points` com lista explícita + unicidade por consulta
3. Acesso a dados clínicos (já planeado, sem alterações)
4. Telemóvel verificado (`phone_verified_at`)
5. Verificação de dentistas e clínicas
6. Limite da triagem IA
7. Testes

---

## Detalhes técnicos

### Nota sobre `auth.role()` dentro de funções do servidor
`auth.role()` lê o JWT do pedido, por isso continua `authenticated` quando uma função SECURITY DEFINER (ex.: `recompute_profile_rating`) escreve em `patients.rating`. Para essas escritas legítimas, as funções do servidor ativam uma marca local à transação:
```sql
PERFORM set_config('app.trusted_write', 'on', true);
```
Os triggers bloqueiam se `auth.role() IN ('authenticated','anon')` **e** a marca não estiver ativa. O cliente não consegue ativá-la (não há RPC que o permita).

Helper:
```sql
CREATE OR REPLACE FUNCTION public.is_untrusted_caller() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT auth.role() IN ('authenticated','anon')
     AND coalesce(current_setting('app.trusted_write', true), '') <> 'on'
$$;
```

### Fase 1 — Campos protegidos
```sql
-- profiles.role imutável
CREATE OR REPLACE FUNCTION public.protect_profile_role() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.is_untrusted_caller() AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role_change_not_allowed';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_protect_profile_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- patients: trigger único (substitui os dois anteriores)
CREATE OR REPLACE FUNCTION public.guard_patient_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  -- Ninguém no cliente mexe em campos administrativos
  IF NEW.blocked IS DISTINCT FROM OLD.blocked
     OR NEW.rating IS DISTINCT FROM OLD.rating THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  -- Profissional: só campos clínicos e só se tratar o paciente
  IF auth.uid() <> OLD.id THEN
    IF NOT public.treats_patient(OLD.id) THEN
      RAISE EXCEPTION 'not_treating_professional';
    END IF;
    IF NEW.fear_level IS DISTINCT FROM OLD.fear_level THEN
      RAISE EXCEPTION 'field_not_allowed_for_professional';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_patient_update BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.guard_patient_update();

-- appointments
CREATE OR REPLACE FUNCTION public.guard_appointment_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.is_untrusted_caller() THEN RETURN NEW; END IF;
  IF NEW.price IS DISTINCT FROM OLD.price
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    RAISE EXCEPTION 'admin_field_not_allowed';
  END IF;
  IF auth.uid() = OLD.patient_id
     AND auth.uid() IS DISTINCT FROM OLD.dentist_id
     AND NOT public.is_clinic_member(OLD.clinic_id)
     AND NOT public.owns_clinic(OLD.clinic_id) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status NOT IN ('confirmada','cancelada') THEN
      RAISE EXCEPTION 'patient_status_not_allowed';
    END IF;
    IF NEW.dentist_id IS DISTINCT FROM OLD.dentist_id
       OR NEW.clinic_id IS DISTINCT FROM OLD.clinic_id
       OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
       OR NEW.observation IS DISTINCT FROM OLD.observation THEN
      RAISE EXCEPTION 'patient_field_not_allowed';
    END IF;
    -- scheduled_at pode mudar (reagendamento)
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_appointment_update BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_update();
```
`recompute_profile_rating` e `apply_points` passam a chamar `set_config('app.trusted_write','on',true)`.

### Fase 2 — `award_points` (recusa por defeito)
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_once_per_appt
  ON public.points_ledger (profile_id, related_appointment_id, reason)
  WHERE related_appointment_id IS NOT NULL AND type = 'xp';
```
Lógica, no início de `award_points` (antes de ler `points_rules`):
```text
caller := auth.uid(); se NULL -> erro not_authenticated

CASE _action_key
  'checkin_diario':
     _profile_id = caller
  'compareceu','falta','chegou_a_horas','colaborou','higiene_oral',
  'seguiu_recomendacoes','cancelamento_tardio':
     consulta obrigatória, status = 'concluida'
     caller = dentist_id da consulta OU membro/dono da clínica
     _profile_id = patient_id da consulta
  'consulta_concluida','teleconsulta','consulta_clinica':
     consulta obrigatória, status IN ('concluida','visto')
     caller = dentist_id OU membro/dono da clínica
     _profile_id = dentist_id OU clinics.owner_profile_id dessa consulta
  'feedback_rating':
     _related_appointment_id obrigatório
     can_rate_appointment(_related_appointment_id, _profile_id) = true
     existe feedback com from_profile_id = caller,
       to_profile_id = _profile_id, appointment_id = _related_appointment_id
  'convidar_amigo':
     erro action_suspended (até haver convites com id do convidado)
  ELSE:
     erro action_not_allowed
END
```
Conquistas: `check_achievements` continua a dar bónus por chamada interna com a marca de confiança, sem passar pela lista do cliente.
`REVOKE EXECUTE ON FUNCTION apply_points FROM authenticated, anon;` (só interna).

### Fase 3 — Dados clínicos
Sem alterações face à versão anterior: profissionais só leem campos clínicos de pacientes com consulta futura ou dos últimos 12 meses (`treats_patient` atualizado com essa janela).

### Fase 4 — Telemóvel verificado
```sql
ALTER TABLE public.profiles ADD COLUMN phone_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.confirm_phone_verification(_profile_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN RAISE EXCEPTION 'not_allowed'; END IF;
  PERFORM set_config('app.trusted_write','on',true);
  UPDATE public.profiles SET phone_verified_at = now() WHERE id = _profile_id;
END $$;
REVOKE ALL ON FUNCTION public.confirm_phone_verification(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_phone_verification(uuid) TO service_role;
```
`protect_profile_role` passa também a bloquear mudanças a `phone_verified_at` vindas do cliente; mudar `phone` limpa `phone_verified_at`.

### Fase 5 — Verificação de profissionais
```sql
CREATE TYPE public.verification_status AS ENUM ('pendente','aprovado','rejeitado');
ALTER TABLE public.dentists ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'pendente';
ALTER TABLE public.clinics  ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'pendente';
```
Os registos existentes (seed) ficam `aprovado` no mesmo passo. Políticas de leitura pública e pesquisa filtram `verification_status = 'aprovado'`; o próprio vê sempre o seu. O trigger de proteção bloqueia o cliente de alterar este campo.

### Fase 6 — Limite da triagem IA
```sql
CREATE TABLE public.triage_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.triage_ai_usage (profile_id, created_at);
GRANT SELECT ON public.triage_ai_usage TO authenticated;
GRANT ALL ON public.triage_ai_usage TO service_role;
ALTER TABLE public.triage_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage read" ON public.triage_ai_usage
  FOR SELECT TO authenticated USING (profile_id = auth.uid());
```
Função `triage-ai`:
1. Exige `Authorization: Bearer`; valida o utilizador -> 401 se falhar.
2. Com cliente service role: conta pedidos das últimas 24h; se >= 10 -> 429.
3. Insere a linha em `triage_ai_usage` **antes** de chamar a IA.
4. Só depois chama a IA.

Frontend: `TriageAiAnalysisCard` mostra mensagem traduzida (PT/EN/FR) para 401 e 429. Modo demo não chama a função.

### Fase 7 — Testes
- Paciente muda status para `em_consulta` -> recusado; para `confirmada`/`cancelada` -> aceite; muda `scheduled_at` -> aceite; muda `price` -> recusado.
- Utilizador muda o próprio `role` -> recusado.
- `award_points('compareceu')` pelo paciente -> recusado; pelo dentista numa consulta `agendada` -> recusado; `concluida` -> aceite; segunda vez -> recusado (índice único).
- `consulta_concluida` com destinatário que não é o dentista/dono da clínica -> recusado.
- `feedback_rating` sem consulta ou sem feedback do caller -> recusado.
- `convidar_amigo` e ação desconhecida -> erro.
- `confirm_phone_verification` chamado por utilizador autenticado -> recusado.
- Triagem sem sessão -> 401; 11.º pedido no dia -> 429.
- Avaliações continuam a atualizar `patients.rating` (escrita de confiança funciona).
