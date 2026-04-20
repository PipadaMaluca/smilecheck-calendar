

# Production-Ready Polish Pass

Implementation of the 8 approved options. Grouped by file impact to minimize risk.

---

## 1.1 — Quarantine gaming visuals (medical neutralization)

**What changes**
- Remove `glow-primary`, `glow-gold`, `glow-green`, `animate-fire-flicker`, `animate-sparkle`, `animate-pulse-glow`, `animate-rocket`, `animate-golden-shimmer`, `text-gradient-gold`, `text-gradient-green`, `font-gaming`, `btn-gaming*` classes from the following surfaces:
  - `DashboardView.tsx` — strip `animate-fire-flicker` from streak emoji, remove any glow boxes from stat cards.
  - `landing/HeroSection.tsx` and `LandingNavbar.tsx` — replace gaming gradients with solid primary blue.
  - `auth/AuthBackground.tsx`, `LoginScreen.tsx`, `SignUpScreen.tsx` — remove gold/green glows.
  - `splash/VideoSplashScreen.tsx`, `header/UserAvatarDropdown.tsx`, `calendar/*` — remove any leftover sparkle/glow.
  - `account/AccountView.tsx`, `profile/*View.tsx`, `settings/*`, `team/*`, `billing/*`, `prescription/*`, `referral/*`, `triage/*`, `conversations/*`, `dashboard/*` — audit for and remove gaming classes.
- **Keep** gaming visuals exclusively in:
  - `pontuacoes/*` (PontuacoesView, PontosTab, ClassificacoesTab, StreakTab)
  - `rewards/*` (RewardsStoreView, ProductGrid, RedeemModal, BrandsList, AllProductsList, RewardsHistory)
  - `rankings/RankingsView.tsx`
  - `achievements/*` (AchievementsView, BadgeShowcase, BadgeFrame, MiniBadges, BadgeSelectionModal)
  - `onboarding/slides/*` (one-time tutorial — keep playful)
- Streak emoji 🔥 on dashboard stays as plain emoji (no flicker animation).
- `index.css` and `tailwind.config.ts`: keep utility classes defined (so gamification pages still work) but stop applying them on neutral surfaces.

**Outcome**: Dashboard, agenda, profile, dossier, prescription, referral, chat, equipa, settings, billing, auth all read as a calm medical product. Pontos/Loja/Rankings/Conquistas keep their playful identity.

---

## 1.2 — Desaturate consultation type colors (~22%)

**What changes** — `src/index.css` `:root` block:
| Token | Before | After |
|-------|--------|-------|
| `--restauracao` | `207 90% 54%` | `207 70% 56%` |
| `--primeira-consulta` | `49 98% 60%` | `49 76% 62%` |
| `--protese` | `122 39% 49%` | `122 30% 51%` |
| `--urgencia` | `4 90% 58%` | `4 70% 60%` |
| `--teleconsulta` | `36 100% 50%` | `36 78% 54%` |
| `--bloqueado` / `--livre` | `0 0% 62%` | unchanged |
| Legacy `--presencial`, `--urgente`, `--prioritario`, `--rotina` | mirror new values | mirrored |

All 10 categories preserved. Hex equivalents in `mockData`/`CATEGORY_COLORS` (if any hard-coded) get updated to match.

---

## 1.3 — Spacing audit (Dashboard + Agenda + Profile)

Replace arbitrary `[Npx]` values with strict 4px-scale tokens:
- `py-[3px]` → `py-1` (4px)
- `py-[5px]` → `py-1.5` (6px)
- `py-[10px]` → `py-2.5` (10px) — already on scale, convert to token form
- `px-[15px]` → `px-4` (16px)
- `gap-[10px]` → `gap-2.5`
- `pl-[48px]` → `pl-12`
- `gap-[5px]` → `gap-1.5`
- `px-[8px] py-[8px]` → `p-2`
- `my-[6px]` → `my-1.5`

**Files touched**:
- `src/components/dashboard/DashboardView.tsx` (~10 occurrences)
- `src/components/calendar/desktop/*.tsx`, `MultiDentistGrid.tsx`, `ConsultationCard.tsx`, `MobileConsultationDetail.tsx`
- `src/components/profile/ProfileView.tsx`, `EditProfileView.tsx`, `DentistProfileView.tsx`, `ClinicProfileView.tsx`, `patient/PatientProfileBody.tsx`

No visual regression — values rounded to nearest 4px token.

---

## 1.5 — Typography rhythm classes

Add to `src/index.css` under `@layer components`:
```css
.t-h1 { @apply text-2xl font-semibold leading-tight; }   /* 24px */
.t-h2 { @apply text-xl font-semibold leading-snug; }     /* 20px */
.t-h3 { @apply text-base font-medium leading-snug; }     /* 16px */
.t-h4 { @apply text-sm font-medium leading-normal; }     /* 14px */
```
Apply across `DashboardView.tsx`:
- Greeting `<h1>` → `t-h1`
- Section headers ("Consultas de Hoje", "Confirmações", "Lista de Espera", "Ações Rápidas", "Pontos Pendentes", "Histórico") → `t-h3`
- Stat card labels → `t-h4`

---

## 2.1 — Hide demo role switcher unless `?demo=true`

**`src/components/calendar/CalendarDemo.tsx`**:
- Read `searchParams.get('demo') === 'true'`.
- If `false`, render only the `<TabsContent value={initialRole}>` for the role given by `?role=` (default `patient`) — no `<TabsList>` and no sticky tab bar.
- If `true`, keep current 3-tab switcher (for the `/demo` page).
- Also update `src/pages/Index.tsx` / `src/pages/AppPage.tsx` if they wrap CalendarDemo to pass through the param naturally (URLSearchParams already handles it).

---

## 2.2 — Standardize all "Avaliar" entry points

Unify on `BidirectionalFeedbackModal` + the literal label `t('bidirectionalFeedback.rate')` ("Avaliar"):
- `PatientScoreHistory.tsx` — replace `PatientFeedbackModal` trigger with `BidirectionalFeedbackModal` for pending items; keep `PatientFeedbackModal` only for legacy in-call flow if still used.
- `FullHistoryView.tsx` — same swap; button label normalized to "Avaliar".
- `desktop/DesktopCalendarView.tsx` — `DentistFeedbackModal` button label normalized to "Avaliar"; modal kept (it has clinical checkboxes specific to dentist post-call).
- All "Dar Feedback", "Avaliar Agora", "Rate", "Avaliar Dentista" buttons across the codebase → single label `t('bidirectionalFeedback.rate')`.
- Visual style normalized to outline button with star icon, size sm.

---

## 2.3 — Skip simulated loading after first session visit

Update `src/hooks/use-simulated-loading.ts`:
```ts
export function useSimulatedLoading(duration = 1200, key = 'global'): boolean {
  const storageKey = `sc:loaded:${key}`;
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return sessionStorage.getItem(storageKey) !== '1';
  });
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem(storageKey, '1');
    }, duration);
    return () => clearTimeout(timer);
  }, [isLoading, duration, storageKey]);
  return isLoading;
}
```
Pass per-screen keys at call sites: `useSimulatedLoading(1200, 'dashboard')`, `'agenda'`, `'profile'`, `'achievements'`, `'rewards'`, `'conversations'`. Backward compatible — calls without a key share `'global'`.

---

## 2.4 — Back button audit (3 critical flows)

1. **Triagem → Booking**
   - `src/pages/Triagem.tsx` and `src/components/booking/BookingFlow.tsx`: ensure browser back from BookingFlow returns to the last triage step (not landing). Add `history.pushState` markers when entering booking from triage; `BookingFlow`'s back arrow calls `navigate(-1)` instead of fixed route.

2. **Dashboard → Dossier (patient view)**
   - `src/components/calendar/desktop/PatientDossierView.tsx` and `MobilePatientDossier.tsx`: store the entry tab (`agenda` vs `dashboard`) in component state; back arrow returns to that tab. Currently always goes to `agenda`.

3. **Profile → Edit Profile**
   - `src/components/profile/ProfileView.tsx` and `EditProfileView.tsx`: Edit screen's back arrow must return to Profile (currently can land on dashboard if profile was opened modally). Add `onBackToProfile` callback wired through `ProfileNavigationContext`.

---

## 2.5 — Collapsible "Confirmações" + "Lista de Espera"

In `DashboardView.tsx` (Dentist + Clinic dashboards):
- Wrap each section in a small local component `<CollapsibleSection title persistKey defaultOpen=true>` using the existing `@/components/ui/collapsible` primitive.
- Header row: title + count badge + chevron (rotates 180° when open).
- State persisted per session via `sessionStorage` key `sc:collapse:confirmacoes` / `sc:collapse:lista-espera`.
- Default expanded.
- "Consultas de Hoje" stays always open (primary content).

---

## File Inventory

**Modified**
- `src/index.css` (color tokens + typography classes + remove gaming utilities from neutral surfaces' usages — utility classes themselves stay defined)
- `tailwind.config.ts` (no change needed)
- `src/hooks/use-simulated-loading.ts`
- `src/components/calendar/CalendarDemo.tsx`
- `src/components/dashboard/DashboardView.tsx` (spacing + typography + collapsibles + remove gaming)
- `src/components/dashboard/PatientScoreHistory.tsx` (unify Avaliar)
- `src/components/history/FullHistoryView.tsx` (unify Avaliar)
- `src/components/calendar/desktop/DesktopCalendarView.tsx` (label normalize)
- `src/components/booking/BookingFlow.tsx` (back nav)
- `src/components/calendar/desktop/PatientDossierView.tsx` + `mobile/MobilePatientDossier.tsx` (back nav)
- `src/components/profile/ProfileView.tsx` + `EditProfileView.tsx` (back nav)
- ~12 calendar/profile files for spacing-token swaps
- `src/components/landing/HeroSection.tsx`, `LandingNavbar.tsx`, `auth/*`, `account/AccountView.tsx`, `header/UserAvatarDropdown.tsx`, etc. for gaming-class removal
- i18n: add `bidirectionalFeedback.rate` ("Avaliar" / "Rate" / "Évaluer") if missing

**Created**: none (all reuses existing primitives)

---

## Out of scope (per user)
- 1.4 (card hierarchy) — already addressed.
- Issue 3 strengths — left untouched.

