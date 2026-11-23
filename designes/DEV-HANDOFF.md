# AYORENI — Design → Development handoff (2026-11-19)

Paste this at the start of a development session.

> **Locked baseline — 2026-11-22.** Frozen design and behaviour, approved by the owner: design system (Calm Glass UI v4 with the 2026-11-19 contrast fix), S01–S07 (incl. the S01/S02 WhatsApp update), A01–A04. Baseline commit `8c62eb0` on `designes/initial-upload`. Changes to these need the owner's approval. Not in the baseline (in review): M02 Medication Details, landing page.

## 1. Where things are
- **Design source of truth:** Claude Design canvas — https://claude.ai/artifact/7f6T8pLUF6V4CTzCKeYmU9 (private until the owner shares it).
  - Cover board: colour tokens (light/dark), type scale, shapes, screen index, product rules.
  - One row per screen: the live screen (Theme + State props) and a States board with every state in light and dark.
- **Design branch:** `designes/initial-upload` in `jai38/myhealthapp`. All designs are pushed here only, never to `main`. Developers take designs from this branch.
  - `designes/claude-design/*.dc.html` — backup of the canvas source (HTML + CSS per screen; exact values to copy).
  - `designes/design/colour-shape-spec.md` — frozen design system spec (Calm Glass UI v4).
  - `designes/design/calm-glass-ui-brief.md` — visual direction brief.
  - `designes/design/screens.md` — per-screen content, behaviour and decisions (read this before building a screen).
  - `designes/design/mockups/` — older static HTML/PNG versions of S01–S07 (reference only).
  - `designes/assets/logo/` — final logo (`ayoreni-logo-final.png`, `-cropped.png`, `.webp`). Never redraw or recolour.
- **App code:** `main` branch. Expo 57 + Expo Router, React Native 0.86, TypeScript strict, Vitest. `design/` (tokens, typography, components), `features/`, `services/`, `app/(tabs)/`.

## 2. Screen status
| Screen | Status | States |
|---|---|---|
| S01 Mobile Number | Locked | default, ready, error, sending |
| S02 OTP Verification | Locked | default, filled, verifying, wrong, resend, expired |
| S03 Create Your Account | Locked | default, filled, errors, dob, selfdescribe |
| S04 Your Health Profile | Locked | default, yes, saved, no, notsure |
| S05 Welcome / first-time Today | Locked | incomplete, sheet, complete |
| S06 Today (returning) | Locked | default, toast (after Mark as Taken) |
| S07 Dose update sheet + Mark as Taken toast | Locked 2026-11-19 | ask, taken, other, skipped |
| S01/S02 WhatsApp update (copy, Paste, no-WhatsApp state) | Locked 2026-11-21 | S01 +nowhatsapp, S02 +nowhatsapp |
| A01 App lock · A02 Recovery code · A03 New-device check · A04 Under 18 | Locked 2026-11-21 | see `screens.md` Flow 3 |
| M02 Medication Details | In review (owner handling) | active, manual, paused, stopped, inactive |
| S-RX-01 Add Health Record | Locked 2026-11-22 (spec `designes/design/specs/S-RX-01-add-health-record.md`) | empty, photos, pdf, preparing, cameraoff, fileerror, offline, discard |
| S-RX-02 Review Your Document | Locked 2026-11-22 (spec `designes/design/specs/S-RX-02-review-your-document.md`) | ready, flagged, pdf, uploading, duplicate, failed, offline, remove |
| S-RX-03 Confirm Classification & Verify Information | Locked 2026-11-22 (spec `designes/design/specs/S-RX-03-confirm-and-verify.md`) | reading, failed, type, picker, mixed, check, item, duplicate, pending, mismatch, basic |
| S-RX-03 v1.1 Lab report review (replaces the lab part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.1-lab-review.md`; rules in `DOC-02-laboratory-report-spec.md`) | review, unclear, previous, narrative, critical, pending, link |
| S-RX-03 v1.2 Imaging & diagnostic review (replaces the imaging part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.2-imaging-review.md`; rules in `DOC-03-imaging-diagnostic-report-spec.md`) | review, side, unclear, ecg, findings, pending, recs, condition |
| S-RX-03 v1.3 Consultation & clinical notes review (replaces the consultation part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.3-consultation-review.md`; rules in `DOC-04-consultation-notes-spec.md`) | review, unclear, notes, pending, vitals, condition, samevisit |
| S-RX-03 v1.4 Hospitalization & procedure review (replaces the hospital part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.4-hospital-review.md`; rules in `DOC-05-hospitalization-procedure-spec.md`) | review, changes, notes, pending, allergy, allergyexists, samestay |
| S-RX-03 v1.5 Vaccination & immunization review (replaces the vaccination part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.5-vaccination-review.md`; rules in `DOC-06-vaccination-immunization-spec.md`) | review, lower, card, item, pending, link, nextdue, updated |
| S-RX-03 v1.6 Medical bill & receipt review (replaces the bills part of 3C) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-03-v1.6-bill-review.md`; rules in `DOC-07-medical-bills-receipts-spec.md`) | review, total, pharmacy, item, pending, link, receipt |
| S-RX-04 Medication Reconciliation & Optional Scheduling | Locked 2026-11-22 (spec `designes/design/specs/S-RX-04-reconcile-and-schedule.md`) | list, compare, taking, reaction, finish, setup, change, tests, confirm |
| S-RX-04 v1.1 "Summary says stop / hold" (adds to S-RX-04) | Locked 2026-11-23 (spec `designes/design/specs/S-RX-04-v1.1-stop-hold.md`) | list, disagree, which, stop, pause, confirm |
| S-RX-05 Completion Summary | Locked 2026-11-22 (spec `designes/design/specs/S-RX-05-completion-summary.md`) | done, partial, reminderset, recordonly, reading, failed, notifoff, other |

Flow 1 = S01–S05 (sign in / sign up), Flow 2 = S06–S07 (Today).

## 3. Design system (frozen — Calm Glass UI v4)
- Canvas 402 × 874 pt (iPhone 17 Pro); content scrolls, never squeezed.
- **Font: Plus Jakarta Sans** — 700/600/400; Large Title 34/40, Title 1 28/34, Section 20/25, Headline 17/22, Body 16–17/23, Meta 14–15/20, Footnote 13/18, Caption/chip 12/16, Button 17/20, Tab 10.5/13. Tabular figures for times, doses, readings.
- **Colours (light / dark):** bg `#F7FAFC` / `#07111F`; surface `#FFFFFF` / `#0C1B2D`; glass card `rgba(255,255,255,.72)` / `rgba(16,37,58,.72)`; text `#0F172A`/`#F7FAFF`, `#5B6B7F`/`#B7C4D6`, `#647387`/`#8EA0B5`; primary gradient `#006AE6 → #0058E8`; action blue `#0062DB` / `#2E90FF`; brand teal `#00C69C`; teal text `#007358` / `#20D7C5`; error `#D0101F` / `#FF6B76`. Hero `linear-gradient(135deg,#0058E6 0%,#0068EE 55%,#00B894 135%)`, text in the left 60%. Light-mode contrast fixed 2026-11-19: see the spec's "Contrast fix" table.
- **Dose chips (icon + word, never colour only):** ✓ Taken (green, with actual time), ● Due now (primary gradient), Upcoming (grey), ? Not confirmed (amber, "Tap to update"), Missed (red, only when the user says so).
- **Shape:** radii hero 28 · cards 22 · tiles 18 · inputs 16 · icon chips 12; buttons/chips/tab bar are pills. Margin 16, row min height 68, touch targets ≥ 44.
- **Elevation:** light cards `0 8px 24px rgba(20,60,120,.08)` + blur 20–24; dark cards add an inset top highlight; button glow in light only.
- **Navigation:** floating frosted tab bar — Today / Records / Medications / Profile (inset 16, bottom 30, height 68, radius 34). Header: logo lockup left, search + bell right, no profile icon.
- Motion 150 / 250 / 350 ms, ease-out `cubic-bezier(0.2,0,0,1)`, respect Reduce Motion. Text ≥ 4.5:1.

## 4. Locked product rules
- Tabs: Today, Records, Medications, Profile.
- Dose statuses: Taken, Due now, Upcoming, Not confirmed, Missed. Missed is never automatic.
- Mark as Taken logs the current time instantly; toast "<Medicine> marked as taken at <time>" with Undo (~5 s); hero count and ring update.
- Not confirmed → dose update sheet: Yes (as scheduled / just now / other time, not in the future), Skipped (optional reason), Missed. Only updates the log, not the schedule.
- Allergies live in S04 Health Profile (Yes / No known allergies / I'm not sure). Profile has 9 sections.
- Height stored in cm (in = total inches), allergen suggestions tagged Medicine / Food / Environment.

## 5. Gaps between the app code (`main`) and the frozen design
Found on 2026-11-19; resolve before building screens:
- `design/fonts.ts` loads **Inter**; design uses **Plus Jakarta Sans**.
- `design/tokens.ts` uses an older palette (e.g. clearBlue `#2878C7`, deepNavy `#16324F`, coolGrey `#F2F5F7`); it does not match v4 and has no dark-mode set.
- `app/(tabs)/` has health-plan, index, medications, profile, records, reports, timeline — the design locks four tabs (Today / Records / Medications / Profile).

## 6. Open items
2. Design Medication Details next, on the same canvas.
3. Share the canvas with the team (Share menu on the canvas page).
4. The canvas was ported from the locked HTML mockups with the same CSS but has not yet been checked visually side by side against the old PNGs.
