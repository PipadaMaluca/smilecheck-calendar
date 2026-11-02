# Pedido 3/4 — Acessibilidade, toque e consistência visual

Este pedido mexe em centenas de ficheiros: cerca de 840 tamanhos de letra, 490 cores fixas, 118 emojis e 100 botões. Pela regra do projeto, apresento primeiro o plano. Proponho fazer o trabalho em 4 lotes, cada um verificado no ecrã (tema claro e escuro, 360px, 768px e 1280px) antes de passar ao seguinte.

## Lote 1 — Correções pendentes (A–J)
- **A.** Seletor Lista/Mapa no ecrã "Pesquisa" (o FavoritesView), nos separadores Clínicas e Dentistas, reutilizando o DentistMapView.
- **B.** "Próximas consultas" mostra só consultas futuras (agendada/confirmada, hora ≥ agora).
- **C.** A data passa a aparecer só na barra superior; sai de debaixo da saudação.
- **D.** Todos os `toFixed()` visíveis passam para `formatNumber` com 1 casa decimal (4,1 · ×1,3).
- **E.** Regra única no `formatCurrency`: valores inteiros sem cêntimos, valores com cêntimos sempre com 2 casas. Aplicada em toda a app e coberta por teste.
- **F.** "Receita mensal" mostra os últimos 6 meses até ao mês atual. Coberto por teste.
- **G.** Cabeçalhos da tabela "Por dentista" em estilo frase; "Rating" → "Avaliação".
- **H.** O badge DEMO só aparece dentro da app em modo demo.
- **I.** Cabeçalho mobile da landing compacto, com menu, sem nada fora do ecrã a 360px.
- **J.** Revisão dos 3 ficheiros de tradução para estilo frase em PT e FR.

## Lote 2 — Interação e acessibilidade (1, 2, 3, 12)
- **Toque:** utilitário `.touch-target`, uma área invisível de 44×44 com pseudo-elemento, para não mudar o aspeto. Aplicado aos botões pequenos, setas, seletores da barra lateral, "Avaliar", listas de espera, disponibilidade, cartões e histórico.
- **Nomes acessíveis:** `aria-label` traduzido em todos os botões que só têm ícone, com novas chaves `a11y.*` em PT/EN/FR.
- **Elementos clicáveis que não são botões:** os `div onClick` passam a `<button>`/`<a>`. Onde não der, ganham role, tabIndex e teclado (Enter/Espaço). Foco visível global com `focus-visible:ring`.
- **Movimento reduzido:** prefers-reduced-motion respeitado no CSS global, no GSAP (`gsap.matchMedia`), no splash e nas celebrações.

## Lote 3 — Sistema visual (5, 6, 9, 10, 11)
- **Tipografia:** escala no tailwind.config (`text-2xs` 11/16, `text-13` → `text-sm`, …). Substituição automática por script, com revisão.
- **Espaçamentos:** valores soltos arredondados à escala de 4px.
- **z-index:** escala única (`z-base`, `z-dropdown`, `z-sticky`, `z-overlay`, `z-modal`, `z-toast`), sem perder a regra atual de z-70 nos elementos fixos em mobile.
- **Avatares:** um componente único, com tamanho e contorno fixos e a cor das iniciais derivada do nome (filtra "Dr.", iniciais para clínicas).
- **Contraste:** muted-foreground ajustado para ≥ 4,5:1 nos dois temas, medido por script.
- **Cores fixas:** as 491 cores hex passam a tokens do tema. Ficam de fora as cores dos tipos de consulta, os badges e QR das lojas, e as áreas de gamificação.

## Lote 4 — Ecrãs (4, 7, 8)
- **Emojis:** passam a ícones Lucide fora de pontuacoes, rewards, rankings, achievements, onboarding e level.
- **Cabeçalho da agenda:** data curta numa só linha em ecrãs estreitos ("seg., 2 nov.").
- **Cabeçalho mobile:** título do ecrã atual (logótipo no Início) e safe-area em cima e em baixo.

## Riscos
- A substituição em massa de cores e tamanhos pode causar pequenas diferenças visuais. Reviso cada lote em capturas de ecrã.
- Os lotes 3 e 4 são os mais longos e podem precisar de mais do que uma mensagem.
