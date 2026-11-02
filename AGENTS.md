
- Server functions that must write client-protected columns (ratings, phone_verified_at, verification_status) set `app.trusted_write` locally and reset it before every return; guard triggers trust only that flag or non-client roles, so client writes can never bypass them.
- Format money, numbers and dates only via `src/lib/formatters.ts` (formatCurrency, formatNumber, formatDate, getDateFnsLocale); never hardcode `€`, `toFixed` for prices, `'pt-PT'` or `locale: pt` — so every screen follows the active language.
- Legal pages (Termos/Privacidade) render from i18n `legal.<doc>.sections` through `LegalDocument`; screen titles go through `useDocumentTitle`.
- Touch targets ≥44px come from the global invisible `::before` hit-area in `index.css` (mobile/tablet); add `.no-touch-target` only for elements that already use `::before` for visuals — so small controls keep their look.
- Icon-only buttons need `aria-label={t('a11y.*')}`; non-button clickables use `role="button" tabIndex={0} onKeyDown={onActivateKey}` from `src/lib/a11y.ts` — keyboard and screen-reader parity.
- Avatars for people/clinics render through `PersonAvatar` (`src/components/ui/person-avatar.tsx`) — one size scale, ring and name-derived initials colour.
- Use Tailwind scale tokens only: `text-2xs`…, `z-base|raised|sticky|dropdown|floating|overlay|modal|notification|toast|celebration`; no arbitrary `text-[Npx]`/`z-[N]` — consistency.
- On-screen decimals use `formatDecimal1`; money always `formatCurrency` (whole amounts without cents, otherwise 2 decimals).
- Blue text uses `--primary-text` via `.text-primary` (contrast AA); `--primary` stays for fills.
