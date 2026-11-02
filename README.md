# SmileCheck

Plataforma de teleodontologia para Portugal e França. Complementa o Doctolib: agenda de consultas, teleconsulta, dossier clínico e gamificação (XP, níveis, conquistas, loja de recompensas).

Três perfis — **paciente**, **dentista** e **clínica** — em três línguas (PT-PT, FR, EN).

## Stack

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3 + shadcn/ui (tokens semânticos em `src/index.css`)
- i18next (`src/i18n/locales/{pt,fr,en}.json`)
- Lovable Cloud (Postgres com RLS, autenticação, funções de servidor)
- Leaflet + OpenStreetMap (mapa da pesquisa)
- Vitest (testes de regras de negócio)

## Como correr

```bash
bun install
bun run dev      # http://localhost:8080
bunx vitest run  # testes
bun run build    # build de produção
```

Modo demo: `/demo` ou `?demo=true` (perfis Paciente / Dentista / Clínica).

## Estrutura

```text
src/
  components/   ecrãs e componentes por área (calendar, landing, rewards, ...)
  components/ui primitivos partilhados (shadcn, empty/error states, PersonAvatar)
  data/         fontes de dados (Cloud) e dados de demonstração (mock)
  lib/          regras e utilitários (formatters, planRules, kpis, a11y, storeLinks)
  i18n/         configuração e traduções PT/FR/EN
  pages/        páginas de topo (Landing, App, Termos, Privacidade)
supabase/
  functions/    funções de servidor (ex.: triage-ai)
  migrations/   esquema, RLS, triggers e funções SQL
public/         logótipos otimizados (WebP + PNG), badges das lojas, vídeo de abertura
```

## Regras do projeto

- **Segurança:** pontos, XP, níveis, conquistas e resgates só no servidor. Todas as tabelas com RLS. Os utilizadores não alteram o próprio perfil de acesso nem campos administrativos. Dados clínicos só para o paciente e quem o trata.
- **i18n:** nenhum texto fixo; as três línguas têm sempre as mesmas chaves. Português europeu, tratamento formal.
- **Formatação:** moeda, números e datas só via `src/lib/formatters.ts`.
- **Design:** visual clínico e calmo nas áreas médicas; efeitos "gaming" apenas em pontuações, recompensas, rankings, conquistas e onboarding. Cores dos tipos de consulta são fixas. Ícones Lucide fora da gamificação.
- **Layout:** tablet segue o desktop; alvos de toque ≥ 44px em mobile; escala de 4px e tokens Tailwind.
- **Dados:** módulos ainda em mock mantêm o mock como fallback do modo demo.
- Regras técnicas detalhadas: ver `AGENTS.md`.
