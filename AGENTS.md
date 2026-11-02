
- Server functions that must write client-protected columns (ratings, phone_verified_at, verification_status) set `app.trusted_write` locally and reset it before every return; guard triggers trust only that flag or non-client roles, so client writes can never bypass them.
- Format money, numbers and dates only via `src/lib/formatters.ts` (formatCurrency, formatNumber, formatDate, getDateFnsLocale); never hardcode `€`, `toFixed` for prices, `'pt-PT'` or `locale: pt` — so every screen follows the active language.
- Legal pages (Termos/Privacidade) render from i18n `legal.<doc>.sections` through `LegalDocument`; screen titles go through `useDocumentTitle`.
