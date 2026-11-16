# AYORENI — Design System Spec: Calm Glass UI v4 (FROZEN 2026-11-16)

Replaces palette v3. Direction brief: `calm-glass-ui-brief.md`. Reference render: `mockups/today-calm-glass.html` and `mockups/today-*.png`.
Canvas: iPhone 17 Pro logical **402 × 874 pt** (export @3x = 1206 × 2622). Content scrolls naturally; never squeeze to fit.

## Logo
`assets/logo/ayoreni-logo-final.png` (transparent) / `-cropped.png`. Never redraw or recolour.
Header lockup: logo 42pt wide + "AYORENI" wordmark.

## Colour tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| bg | `#F7FAFC` | `#07111F` | Screen background |
| surface-elevated | `#FFFFFF` | `#0C1B2D` | Sheets, solid surfaces |
| glass-card | `rgba(255,255,255,0.72)` | `rgba(16,37,58,0.72)` | Cards, tiles, icon buttons |
| glass-edge | `rgba(255,255,255,0.95)` + hairline `#E7EEF5` | `rgba(46,144,255,0.16)` | Card border |
| divider | `#E7EEF5` | `rgba(255,255,255,0.06)` | Row separators |
| text-primary | `#0F172A` | `#F7FAFF` | |
| text-secondary | `#5B6B7F` | `#B7C4D6` | |
| text-tertiary | `#8A97A8` | `#8EA0B5` | Counts, metadata |
| primary-gradient | `#0080FC → #0060FC` | same | Primary buttons, Due now chip |
| action-blue | `#0071FF` | `#2E90FF` | Links, active tab, blue icons |
| brand-teal | `#00C69C` | `#00C69C` | Logo-matched fills, gradient end |
| teal-text/icon | `#028265` | `#20D7C5` | Teal icons, Supplement tag text |
| teal-glow | `#6CE7D8` | `#6CE7D8` | Glows only |
| blue-tint | `#E4F0FC` | `rgba(46,144,255,0.14)` | Blue icon chips, active tab pill |
| teal-tint | `#E6F8F3` | `rgba(32,215,197,0.12)` | Teal icon chips, Supplement tag |
| alert-dot | `#FF091B` | `#FF091B` | Notification dot only |
| error-text | `#D0101F` | `#FF6B76` | Errors |

Mesh background: soft blurred blobs (blur 48) of `rgba(0,198,156,0.20)` and `rgba(0,128,252,0.16)` (dark: 0.13 / 0.20) behind content so glass reads.

## Hero card
`linear-gradient(135deg, #0060FC 0%, #0080FC 55%, #00C69C 135%)`, radius 28, padding 22, white text kept on the blue side.
Teal-glow radial bottom-right; 1px `rgba(255,255,255,0.28)` border; top sheen `rgba(255,255,255,0.14)` → transparent.
Shadow light `0 14px 30px rgba(0,96,252,0.26)`; dark adds `0 0 0 1px rgba(108,231,216,0.18)`.

## Dose status chips (icon + word, never colour alone)
| Status | Light text / bg | Dark text / bg | Rule |
|---|---|---|---|
| ✓ Taken | `#0B7F3F` / `#E3F5EA` | `#5FD38D` / `rgba(95,211,141,0.14)` | Show actual time "at 8:12 AM" |
| ● Due now | white on primary-gradient | same | One "Mark as Taken" button in the group |
| Upcoming | `#5B6B7F` / `#EEF2F7` | `#B7C4D6` / `rgba(255,255,255,0.07)` | |
| ? Not confirmed | `#9A5B00` / `#FFF1DB` | `#F5B84A` / `rgba(245,184,74,0.14)` | Past dose with no log; "Tap to update" |
| Missed | `#D0101F` / `#FDE8EA` | `#FF6B76` / `rgba(255,107,118,0.14)` | Only when the user marks it missed |
Supplement tag: teal-text on teal-tint pill, on its own line under the dose.

## Typography — Plus Jakarta Sans, Apple-HIG sizing (revised 2026-11-16)
Large text gets negative tracking; body is Regular 400 (not Medium); weights stay 700/600/400.
| Style | Size/Line | Weight | Tracking | Use |
|---|---|---|---|---|
| Wordmark (header) | 15 | 700 | +22–26% | "AYORENI" beside / under logo |
| Large Title | 34/40 | 700 | −3% | Sign-in headline, hero numbers |
| Title 1 | 28/34 | 700 | −2.5% | Greeting, screen titles |
| Title 3 / Section | 20/25 | 700 | −2% | Morning / Afternoon / Evening, section headers |
| Headline | 17/22 | 600 | −1.5% | Medicine names, card titles, form labels |
| Body | 16–17/23 | 400 | −0.5% | Descriptions, main text |
| Subhead / Meta | 14–15/20 | 400 | 0 | Dose lines, secondary text, links (600) |
| Footnote | 13/18 | 400–500 | 0 | Helper text, counts, consent text |
| Overline | 13 | 600 | +6%, uppercase | Hero card label only |
| Caption / chip | 12/16 | 400 (caption), 600 (chip) | 0 | Timestamps, status chips (minimum size) |
| Button | 17/20 | 600 | −1% | All buttons |
| Tab label | 10.5/13 | 600 | +1% | Bottom tabs only |
Accent: sign-in headline second line may use the blue→teal gradient as text fill (once per screen max).
Tabular figures for all times, doses, readings. Support larger system text without truncation.

Logo sizes: sign-in 92pt wide (soft blue drop shadow) + wordmark below; header 48pt wide + wordmark right.

## Shape & spacing (4pt grid)
- Radii: hero 28 · cards 22 · tiles 18 · inputs 16 · icon chips 12 (14 for 48pt) · buttons/chips/tab bar pill.
- Screen margin 16 · section gap 22–26 · card padding 14–16 · tile gap 12 · row min height 68.
- Touch targets ≥ 44pt (icon buttons 44, buttons 46–50 tall).

## Elevation
- Light card shadow `0 8px 24px rgba(20,60,120,0.08)`; backdrop blur 20–24.
- Dark card: `0 8px 24px rgba(0,0,0,0.35)` + inset top highlight `rgba(255,255,255,0.05)`; no glow except hero edge.
- Primary button glow light `0 6–8px 14–18px rgba(0,96,252,0.28–0.32)`; none in dark.

## Navigation
Tabs **Today / Records / Medications / Profile**. Floating frosted pill bar: inset 16, bottom 30 (above home indicator), height 68, radius 34, `rgba(255,255,255,0.80)` / `rgba(12,27,45,0.84)`, blur 24.
Active tab: filled icon in blue-tint pill + action-blue label; inactive: outline icon, tertiary label.
Header: logo lockup left; search + bell (44pt glass circles) right; no profile icon.

## Icons
Rounded outline, 2pt stroke, round caps/joins; filled only for the active tab. Blue = records, appointments, medicines; teal = supplements, readings.

## Motion
150 ms (chips, taps) · 250 ms (cards, tabs) · 350 ms (sheets). Ease-out `cubic-bezier(0.2,0,0,1)`, no bounce. Chip state change = cross-fade + slight scale. Respect Reduce Motion.

## Accessibility
Text ≥ 4.5:1 (secondary included); never colour-only status; ≥ 44pt targets; readable dark mode; large-text support.
