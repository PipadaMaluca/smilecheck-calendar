# Pedido 6 — Atualização 2026

Executado em 5 lotes, por esta ordem. PT/FR/EN em tudo; formatters, tokens, alvos de 44px, tablet = desktop.

## Lote 1 — Páginas e avisos (sem BD)
1. **Acessibilidade**: página pública `/acessibilidade` (`LegalDocument` + i18n `legal.accessibility.sections`), ligada no rodapé da landing e nas Definições. Referência WCAG 2.1 AA / EN 301 549, estado "parcialmente conforme", o que já está feito, limitações conhecidas (cores protegidas dos tipos de consulta, alguns cartões sem teclado, mapas), e-mail de contacto vindo de uma constante configurável (`SUPPORT_EMAIL`) e data da revisão via `formatDate`. Não afirma conformidade total.
2. **Transparência da IA**: aviso fixo no topo da triagem por IA e de qualquer resposta gerada por IA ("Está a falar com um assistente de IA…"), mais uma etiqueta "IA" com ícone Lucide em cada resposta. O encaminhamento de urgência para o 112 / 15 mantém-se.

## Lote 2 — Base de dados
3. **Cheques**: `clinics.country` (PT/FR, preenchido a partir do fuso horário, e um trigger mantém os dois coerentes), `accepts_cheque_dentista` e `accepts_cheque_protese` (por defeito false). Um trigger recusa true quando o país é FR e só deixa o dono da clínica alterar. Filtros na pesquisa (só quando a pesquisa inclui Portugal), distintivo discreto no perfil e no cartão, e cheque-prótese com "a partir de janeiro de 2027". Na demo, a Clínica SmileCheck aceita os dois.
4. **Consentimento**: tabela `consent_preferences` (só o próprio lê e escreve) e localStorage sem sessão. Banner na 1.ª visita com Recusar / Aceitar / Personalizar com o mesmo destaque. Categorias: necessários (sempre ligado), estatísticas e anúncios, desligados por defeito. Pode ser mudado em Definições > Privacidade. Os anúncios Free só são personalizados com consentimento e nunca usam dados de saúde.
6. **Notificações**: tabela `notification_preferences` (perfil × tipo × canal, RLS só o próprio). Tipos: lembretes, confirmações, pontos e novidades. Só o e-mail fica ativo; push, SMS e WhatsApp aparecem como "Em breve" e não se podem ligar.
7. **Avaliações verificadas**: reforçar `can_rate_appointment` e acrescentar um trigger: uma avaliação só é aceite com uma consulta `visto`/`concluida` entre quem avalia e quem é avaliado, e só 1 por consulta (índice único). Mostrar "Avaliação verificada" junto de cada avaliação.
- Testes de segurança com transações revertidas: cheque true numa clínica FR é recusado; ninguém escreve preferências de outra pessoa; não é possível avaliar sem consulta nem avaliar duas vezes.

## Lote 3 — App instalável
5. Manifest completo e ícones 192/512 e maskable gerados a partir do logótipo atual. Service worker com `vite-plugin-pwa` que guarda só a casca da app e as imagens/ficheiros fixos, com navegação sempre pela rede primeiro e nunca respostas do servidor nem dados de saúde. Só se ativa na app publicada (nunca na pré-visualização). Página offline simples. Botão "Instalar a app": no Android/computador abre o pedido de instalação; no iPhone mostra "Partilhar → Adicionar ao ecrã principal". Os badges das lojas continuam "Em breve".

## Lote 4 — Pagamentos (Stripe, modo de teste)
8. Pagamentos incluídos do Lovable já ativos em modo de teste (sem conta Stripe própria nem chave). Checkout dentro da app; compliance fiscal tratada pelo Stripe (+3,5% por transação, desativável).
   - criar produtos e preços de teste Pro/Premium × 3 perfis × mensal/anual, com valores de `planRules.ts` (anual −15%);
   - Checkout (cartão, Apple Pay, Google Pay; MB WAY se a conta o permitir) e Portal do Cliente para gerir/cancelar;
   - webhook com assinatura verificada que atualiza `profiles.plan` só pelo servidor (trusted write). Um cancelamento ou downgrade volta a Free no fim do período;
   - faixa "Modo de teste — nenhum pagamento real" nos planos e no checkout. A teleconsulta continua "Em breve";
   - testes: evento de teste do webhook muda o plano; o cliente não consegue mudar o plano diretamente.

## Lote 5 — Verificação
Typecheck, testes (`src/test`) e build. Playwright a 360/768/1280px, claro/escuro, PT/FR/EN nos ecrãs novos e nas páginas públicas sem sessão.

## Notas técnicas
- Tabelas novas com GRANT a authenticated/service_role, RLS com `(select auth.uid())` e índices nas FKs.
- Os triggers usam `is_untrusted_caller()` e as escritas do servidor usam `app.trusted_write`.
- Os ecrãs novos seguem a regra de não ter texto fixo no código: tudo nas 3 traduções, com as mesmas chaves.
