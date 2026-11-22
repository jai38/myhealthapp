# Locked Baseline — Approved Design & Functionality

**Locked on:** 2026-11-22
**Locked commit:** `4fe65ee` (Merge PR #2 — Ayoreni app IDs and a separate dev app)
**Git tag:** `baseline-approved-2026-11-22`

Everything present in the codebase at the locked commit is the **approved** design
and functionality of the Ayoreni (My Health App) mobile client. It is frozen.

## Lock rules

1. Do not change, remove, restyle or re-flow any locked item below unless the
   product owner explicitly asks for that specific change.
2. New work is **additive**: new screens, features and components may be added,
   but they must reuse the locked design system (`design/`) and must not alter
   existing behaviour as a side effect.
3. Bug fixes to locked items are allowed only when requested, and must keep the
   approved look and behaviour.
4. To see exactly what was approved: `git diff baseline-approved-2026-11-22`.

## Locked design system (`design/`)

- Tokens, typography, contrast and status colours: `design/tokens.ts`,
  `design/typography.ts`, `design/contrast.ts`, `design/status.ts`, `design/fonts.ts` (Inter)
- Components: `design/components/` — Actions, Containers, Feedback, Foundations,
  Inputs, Navigation, Trust
- Copy/strings: `design/strings/en.ts`
- Brand: "Ayoreni" naming on sign-in, register and sign-out buttons; app assets in `assets/`
- Dev component gallery: `app/dev/gallery.tsx`, `design/gallery/`

## Locked navigation (`app/`)

- Root stack `app/_layout.tsx`; bottom tabs `app/(tabs)/` — Today (index),
  Health Plan, Medications, Records, Reports, Timeline, Profile
- Custom tab bar and header: `features/shell/`

## Locked functionality (`features/`, `services/`)

- **Auth:** sign-in/register modal & screen, session restore, auth gate (`features/auth`, `services/auth`)
- **Account / Profile:** profile card, info sections, sign-out (`features/account`)
- **Legal:** terms modal (`features/legal`)
- **Today (Home):** greeting, next dose, dose rows and actions, notices, states,
  prescription upload and confirmation (`features/today`)
- **Documents:** picker (camera, gallery, PDF; test samples only in dev builds),
  preview, 15 MB / JPEG-PNG-PDF validation, upload (`features/documents`, `services/documents`)
- **Prescription review:** patient review & correction, low-confidence flags,
  custom reminder time validation; historical prescriptions default inactive
  (`features/prescriptions`)
- **Medications:** list, detail, day schedule, next dose, weekly adherence
  (unrecorded doses not counted as missed), manual add with custom times,
  dose actions hidden for paused/stopped medicines, reminder outcome messaging
  (`features/medications`, `services/medications`)
- **Notifications:** actual-count scheduler (ADR-006), logs medication IDs never
  names (`services/notifications`)
- **Records / Reports / Timeline:** records screen, reports hero/metrics/vault,
  timeline view, filters, date strip, detail modal, report export
  (`features/records`, `features/reports`, `features/timeline`, `services/reports`, `services/timeline`)
- **App status:** force update, optional update, maintenance screens (`features/app-status`, `services/app-status`)
- **System:** connectivity banner, error boundary, global error screen, support code (`features/system`, `services/network`)
- **Environments & builds:** prod / dev / local backends (`services/config/environment.ts`,
  `scripts/start-env.js`), Ayoreni app IDs with a separate dev app (`app.config.js`, `eas.json`)
- **CI:** `.github/workflows/ci-cd.yml`; tests in `test/`
