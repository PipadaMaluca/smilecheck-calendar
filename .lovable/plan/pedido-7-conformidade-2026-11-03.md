# Pedido 7 — Conformidade

## 1. Triagem = orientação geral
- Reescrever o prompt de sistema de `triage-ai`: proibido diagnóstico, hipótese de doença, gravidade ou tratamento. Saída JSON: `symptomSummary` (para o dentista), `generalTips` (higiene/conforto), `urgentHelp` (sinais → 112/15), `bookAppointment`.
- `TriageAiAnalysisCard` e textos da triagem/landing (PT/FR/EN): título "Resumo dos sintomas para o seu dentista"; retirar "diagnóstico", "avaliação clínica", "gravidade", "análise". AiNotice mantém-se.

## 2. Classificações de profissionais só para o próprio
- Vista `professional_public_profiles`: `showcased_achievements` devolve vazio para dentistas/clínicas.
- UI: rankings, selos ("Top Dentista", "Clínica Diamante"), nível e conquistas em destaque de profissionais escondidos quando quem vê não é o próprio (nem a sua clínica) — pesquisa, perfis, cartões, modal.
- Pesquisa: retirar ordenação por classificação/plano (distância, especialidade, disponibilidade).
- Classificações entre pacientes ficam.

## 3. Loja da clínica
- `rewards_catalog`: `active=false` em `clinic:cd2` e em qualquer recompensa de destaque na pesquisa; mock também.

## 4. Consumidor
- Botão "Cancelar subscrição" (+ condições: mantém até ao fim do período) → Portal do Stripe; ligação no rodapé "Gerir/cancelar subscrição".
- Checkout de pacientes: caixa obrigatória de renúncia ao direito de retratação (14 dias) + ligação aos termos; `create-checkout` recusa sem ela e guarda a data em `subscriptions.withdrawal_waiver_at` (via metadata → webhook).
- Preços: pacientes "IVA incluído"; profissionais "+ IVA" (mesmos valores de `planRules.ts`).
- Edge function `renewal-reminders` diária (cron): planos anuais a 30 dias → notificação na app + e-mail (envio de e-mail depende do domínio de e-mail; se não estiver configurado, fica só a notificação e digo-o). Coluna `renewal_notified_for` para não repetir.
- Rodapé e Termos: "Livro de Reclamações" e secção "Resolução de litígios" com placeholders (entidade RAL PT, mediador FR).

## 5. Eliminar conta + descarregar dados
- Definições: fluxo com 2 confirmações (escrever "ELIMINAR"/"SUPPRIMER"/"DELETE"), texto a explicar que o dossier fica com o profissional.
- Edge function `delete-account` (service_role): regista em `account_deletion_requests`, cancela subscrições Stripe, apaga pontos/convites/preferências/consentimentos/notificações/conquistas, anonimiza o perfil, desliga as consultas/dossier da conta sem os apagar, elimina o utilizador de auth.
- Edge function `export-my-data`: JSON com os dados do próprio.
- Testes: transação revertida da função SQL `anonymize_account` + testes de app.

## 6. Páginas legais (provisórias)
- Reescrever Termos e Privacidade; nova `/termos-profissionais` (P2B), via `LegalDocument` e i18n PT/FR/EN, com todos os pontos pedidos e `[a preencher]` onde faltam dados.
- Ligações no rodapé e no registo; aceitação obrigatória no registo com data guardada em `profiles.terms_accepted_at`.

## Detalhes técnicos
- Migração: `subscriptions.withdrawal_waiver_at`, `subscriptions.renewal_notified_for`, `profiles.terms_accepted_at` (+ versão), tabela `account_deletion_requests` (RLS, só service_role escreve; o próprio lê), função `anonymize_account(uuid)` (service_role), vista recriada, recompensa desativada (dados via SQL).
- Cron diário para `renewal-reminders`.
- No fim: typecheck, testes, build, verificação a 375/1280px.
