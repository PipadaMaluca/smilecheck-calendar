# Diretório real (clínicas, equipa, família)

Demo fica exatamente igual: o hook devolve os dados mock atuais quando em demo.

## 1. Fonte única `directorySource.ts` + `useDirectory()`
- Provider no topo da app; uma só carga por sessão (clínicas do utilizador, membros via `clinic_members` + `professional_public_profiles`, `working_hours`, `family_members` para pacientes).
- Helpers com a mesma forma do mock: `clinics`, `dentists`, `getDentistsForClinic(clinicId)`, `worksOn(dentistId, clinicId, date)`, `familyMembers`, `loading`.
- Substituir os imports mock nos ~40 ficheiros listados (Agenda, criação, avatar, equipa, perfil, saúde, convites, histórico, lista de espera). Loading = skeletons existentes; vazio = `empty-state` existente.

## 2. Horário de trabalho (dentista)
- Cartão "Horário de trabalho" por clínica nas Definições: dias, entrada/saída, almoço opcional.
- Formato mantido: `{ mon: [["09:00","13:00"],["14:00","18:00"]], ... }` (já usado por `next_free_slot`).
- Trigger de validação no servidor: só o próprio dentista ou o dono; horas HH:MM válidas, início < fim, sem sobreposição; domingo permitido (não existe regra por clínica).
- A Agenda usa `worksOn`; a pesquisa já lê este campo.

## 3. Equipa da clínica
- Nova tabela `clinic_invites` (clinic_id, email, status pendente/aceite/recusado/cancelado, invited_by, datas). RLS: dono vê/cria/cancela; dentista convidado vê os seus (email da sessão).
- RPC `accept_clinic_invite(id)`: só o dentista com aquele email; cria o `clinic_members`. Ninguém entra sem aceitar.
- Aviso de convites pendentes ao dentista ao entrar (banner/notificação existente).
- Remover dentista: confirmação; apaga só a ligação, nunca consultas.
- Trigger: recusa remover a última clínica de um dentista.
- Envio de e-mail real fica fora (só convite na app) — o dentista vê-o ao entrar.

## 4. Família (paciente)
- Gestão no perfil (adicionar/editar/remover nome, parentesco, data de nascimento). RLS já restrita ao titular — verificar e reforçar se preciso.
- FamilyFilter e marcação para familiar usam `useDirectory().familyMembers`.

## 5. Testes e verificação
- Vitest: hook devolve mock em demo e real fora de demo.
- SQL em transações revertidas: outro utilizador não lê família/horário alheio; convite exige aceitação; não sair da última clínica; horas inválidas recusadas.
- Typecheck, build; Playwright: demo nos 3 perfis igual antes/depois (capturas comparadas).
- AGENTS.md: 1 regra curta sobre `directorySource`.

## Decisões a confirmar
- Convite: sem envio de e-mail por agora (só aparece na app ao entrar). OK?
- Domingo: sem regra por clínica hoje, por isso permitido em todas.
