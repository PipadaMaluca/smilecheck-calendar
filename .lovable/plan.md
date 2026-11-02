# Pedido 5 — Planos, medo, dossier, anúncios, convites, segurança

Ordem de execução em 5 lotes; cada lote termina com typecheck, testes e build.

## Lote 1 — Limpeza e marca (sem BD)
- **9. Remover MCP/OAuth:** apagar `supabase/functions/mcp`, `src/lib/mcp`, `.lovable/mcp`, `OAuthConsent.tsx`, `oauth-return-path.ts`, rota `/.lovable/oauth/consent`, retorno OAuth em Login/SignUp, `@lovable.dev/mcp-js`, chaves i18n `oauthConsent.*`; apagar a função publicada e desligar o servidor OAuth (se ativo).
- **8. Azul:** `--primary: 207 90% 54%` nos 2 temas; novo `--primary-solid` (≈ 207 90% 38%, AA com branco) usado só em `Button default`, `Badge default` e fills com texto branco. Restantes ajustes de contraste mantidos.

## Lote 2 — Planos (sem BD)
- **1.** Reescrever features em `planRules.ts` (fonte única) por perfil/plano, consumidas pela landing `PricingSection` e pelos ecrãs de planos na app. Anual: `round(mensal×12×0,85/12, 2)` → 16,99 € / 33,99 € (teste). "Em breve" confirmado no código: teleconsultas/comissões, receitas e cartas digitais, ícone da app, teleconsultas da equipa. Removidos os itens listados. Faixa: "Menos faltas: os pacientes ganham pontos por comparecer." PT/FR/EN.

## Lote 3 — BD e segurança (1 migração `pedido5_security_data`)
- **5.** `REVOKE EXECUTE ... FROM PUBLIC, anon` em todas as funções `public`; `GRANT` só a `authenticated` nas usadas pela app (`award_points`, `check_achievements`, `redeem_reward`, `request_reschedule`, `can_*`, `treats_patient`, helpers de RLS); `apply_points`, `confirm_phone_verification`, `refresh_seed_appointments` só service_role/postgres.
  - `is_seed boolean default false` em `profiles`, `patients`, `appointments`; backfill dos seed atuais; `refresh_seed_appointments` passa a filtrar por `is_seed`.
  - `handle_new_user` recusa e-mails `@seed.smilecheck.app` (+ validação no formulário de registo).
  - `clinics.timezone text default 'Europe/Lisbon'`; clínicas FR → `Europe/Paris`. Formatters ganham `formatTime(date, tz)`; agenda e cartões mostram horas no fuso da clínica.
- **2. Medo:** `CHECK (fear_level BETWEEN 0 AND 4)` em `patients`; tabela `fear_assessments` (patient_id, professional_id, appointment_id, level 0–4, note, created_at) com índices FK; RLS: paciente sem SELECT; SELECT via `can_read_dossier(patient_id)`; INSERT só `professional_id = auth.uid()` e com relação ativa.
- **3. Dossier:** função `can_read_dossier(_patient)` = é o autor OU pertence (dentista/dono/membro) à clínica da última consulta concluída/visto ou futura do paciente. Tabela `dossier_access_log` (actor_id, patient_id, action, resource, created_at), insert via RPC `log_dossier_access`, leitura só pelo próprio paciente e pelo ator. Aplicado às notas/avaliações de medo existentes.
- **4.** Associar os 2 dentistas seed sem `clinic_members` à clínica seed SmileCheck (dados, via query). Trigger impede marcação com dentista sem clínica.
- **6. Anúncios:** `points_rules` `anuncios_10` (2 pts, 0 XP) para os 3 perfis; tabela `ad_state` (profile_id PK, videos_watched, ad_free_until, ads_seen_count) + `ad_rewards_daily` (profile_id, day, UNIQUE). RPCs `register_ad_view(kind)` (vídeo: ao 5.º → `ad_free_until = now()+8h`, reset 0; anúncio: ao 10.º → `award` interno 1×/dia por índice único). Plano lido do servidor; Pro/Premium recusados. Cliente nunca escreve.
- **7. Convites:** tabela `referrals` (inviter_id, invitee_id UNIQUE, level 1/2 derivado, status pendente/validado, validated_at). Trigger de validação: paciente com telemóvel verificado + 1.ª consulta `concluida/visto`; dentista/clínica quando `aprovado`. Ao validar: `convidar_amigo` ao convidante direto e `convite_nivel2` (1 pt, nova regra) ao convidante desse — `award_points` allowlist ativa com índice único `(profile_id, reason, invitee)`.
- **Testes de segurança** com transações revertidas (`request.jwt.claims`): paciente não lê `fear_assessments`; profissional fora da relação só vê as suas notas; anon sem EXECUTE; registo seed recusado; anúncios 1×/dia; convite contado 1 vez; Pro sem anúncios.

## Lote 4 — UI
- **2.** Editar perfil (paciente): 5 opções com rótulo + cor + ícone Lucide. Passo opcional "Atualizar nível de medo" ao marcar `visto`, último valor pré-selecionado. Perfil do paciente (profissional): chip "Medo 3 · Medo intenso" + "P 2 · C 3", aviso se diferença ≥ 2, painel com escala/conduta/data/histórico. Agenda/cartões: ponto numérico só quando ≥ 2. Tokens `--fear-0..4`.
- **4.** Dentista sem clínica: estado "Associe-se a uma clínica" + convidar clínica.
- **6.** Faixa discreta + botões "Remover anúncios 0/5" (temporizador 8 h) e "Ganhar pontos"; vídeos simulados em demo; ocultos em dossier, teleconsulta, triagem, receitas; nota de consentimento (CMP) preparada; Pro/Premium vê "Sem anúncios no seu plano".
- **7.** Ecrã de convites: destino qualquer perfil, lista pendente/validado e pontos.

## Lote 5 — Verificação
360/768/1280, claro/escuro, PT/FR/EN nos ecrãs tocados; relatório final por ponto, migrações, resultados dos testes e lista "Em breve".

## Pressupostos (corrija se necessário)
- O plano do utilizador (Free/Pro/Premium) ainda não existe na BD: crio `profiles.plan` (default `free`, protegido por trigger) para o servidor decidir anúncios.
- "Bónus de +10% em pontos" do Premium fica "Em breve" (não altero `apply_points` sem pagamentos reais).
- Clínicas FR identificadas pelo código postal/cidade das seed (Mitry-Mory, Montfermeil).
