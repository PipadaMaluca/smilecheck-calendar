# Plano de segurança — diferenças face à versão anterior

Só as alterações. Tudo o resto do plano anterior mantém-se. Nada é aplicado até aprovares.

## Resumo
1. Novas ações `confirmacao_24h` e `confirmacao_1h` (dadas pelo próprio paciente).
2. Ações de presença: estados exigidos corrigidos por ação.
3. Índice único passa a incluir `type`, sem filtro por `type`.
4. O paciente deixa de mudar `scheduled_at` diretamente; nova função `request_reschedule`.
5. Regra: ações novas só entram quando o módulo deixar de usar dados de demonstração.

---

## Detalhes técnicos

### Fase 1 — trigger `guard_appointment_update` (alterado)
Antes: o paciente podia mudar `scheduled_at`.
Agora, no ramo do paciente, acrescenta:
```sql
IF NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at
   AND coalesce(current_setting('app.reschedule_rpc', true), '') <> 'on' THEN
  RAISE EXCEPTION 'reschedule_via_rpc_only';
END IF;
```
Removida a linha "scheduled_at pode mudar (reagendamento)".

### Fase 1 — nova RPC `request_reschedule`
```sql
CREATE OR REPLACE FUNCTION public.request_reschedule(_appointment_id uuid, _new_time timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.appointments;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO a FROM public.appointments WHERE id = _appointment_id FOR UPDATE;
  IF NOT FOUND OR a.patient_id <> auth.uid() THEN RAISE EXCEPTION 'not_allowed'; END IF;
  IF a.status NOT IN ('agendada','confirmada') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  IF _new_time <= now() THEN RAISE EXCEPTION 'time_in_past'; END IF;
  IF a.dentist_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.appointments o
    WHERE o.dentist_id = a.dentist_id AND o.id <> a.id
      AND o.status NOT IN ('cancelada','falta')
      AND tstzrange(o.scheduled_at, o.scheduled_at + make_interval(mins => o.duration_minutes))
       && tstzrange(_new_time, _new_time + make_interval(mins => a.duration_minutes))
  ) THEN RAISE EXCEPTION 'slot_taken'; END IF;
  PERFORM set_config('app.reschedule_rpc','on',true);
  UPDATE public.appointments SET scheduled_at = _new_time, status = 'agendada' WHERE id = a.id;
END $$;
REVOKE ALL ON FUNCTION public.request_reschedule(uuid, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_reschedule(uuid, timestamptz) TO authenticated;
```
Nota: a marca `app.reschedule_rpc` só liberta `scheduled_at` e o estado `agendada`; os outros bloqueios do trigger continuam ativos. Os pontos do limite de 2 reagendamentos seguidos ficam como estão hoje no cliente (não alterado neste plano).

Frontend: o arrastar/reagendar do paciente em `appointmentActions` passa a chamar `request_reschedule`; dentista e clínica continuam com o update normal. Erro `slot_taken` reutiliza a mensagem existente de horário ocupado.

### Fase 2 — `award_points` (alterado)
```text
  'confirmacao_24h','confirmacao_1h':                       -- NOVO
     consulta obrigatória
     caller = patient_id da consulta
     _profile_id = caller
     status = 'confirmada' E scheduled_at > now()
  'compareceu','chegou_a_horas','colaborou',
  'higiene_oral','seguiu_recomendacoes':                    -- ALTERADO
     status IN ('concluida','visto')
     caller = dentista OU membro/dono da clínica; _profile_id = patient_id
  'falta':                                                  -- ALTERADO
     status = 'falta'; mesmo caller/destinatário
  'cancelamento_tardio':                                    -- ALTERADO
     status = 'cancelada'; mesmo caller/destinatário
```
Regra documentada em comentário na função: ações como `emitir_receita`, `carta_referencia`, mensagens, etc. só são acrescentadas à lista quando o módulo correspondente deixar de usar dados de demonstração. Até lá dão `action_not_allowed`.

### Fase 2 — índice único (alterado)
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_once_per_appt
  ON public.points_ledger (profile_id, related_appointment_id, reason, type)
  WHERE related_appointment_id IS NOT NULL;
```

### Fase 7 — testes acrescentados
- Paciente muda `scheduled_at` com update direto -> recusado.
- `request_reschedule` por outro utilizador -> recusado; para o passado -> recusado; sobreposto a outra consulta do dentista -> `slot_taken`; válido -> horário muda e estado fica `agendada`.
- `confirmacao_24h` pelo paciente numa consulta `confirmada` futura -> aceite; em consulta `agendada` ou passada -> recusado; repetida -> recusada pelo índice.
- `falta` com estado `concluida` -> recusado; `cancelamento_tardio` com estado `cancelada` -> aceite.
- `compareceu` com estado `visto` -> aceite.
- `emitir_receita` -> `action_not_allowed`.
