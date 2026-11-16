# AYORENI — Calm Glass UI (design brief, from the user, 2026-11-16)

The user's permanent visual and UX direction. Where it conflicts with an earlier lock,
the reconciliation decided with the user is recorded in `colour-shape-spec.md`.

## 1. Product
Personal health management: medicines & supplements, prescriptions & records, appointments,
readings (BP, glucose…), allergies & reactions, medical history timeline, reminders & adherence,
profile & family accounts. Trustworthy, calm, premium, organized; not playful, not cluttered.
Modern, reassuring, clean, Apple-inspired polish, professional for sensitive health data.

## 2. Visual language: "Calm Glass UI"
Hybrid of:
1. **Calm UI** — clean, spacious, low noise, gentle.
2. **Soft glass** — translucent layered cards, frosted surfaces, subtle blur, gentle highlights / edge glow; never flashy.
3. **Gradient UI** — blue→teal, used selectively: hero cards, highlights, emphasis, progress, branding.
4. **Apple-inspired minimalism** — refined type, premium spacing, rounded components, strong hierarchy, subtle depth, clean icons, polished light & dark.

Not: childish, gimmicky, over-decorated, neon, too futuristic, enterprise-heavy, Android-default, dense, flat/lifeless.
Feels: premium iOS-quality healthcare app; soft, elegant, readable, calming, clinically trustworthy.

## 3. Principles
- Emotional: calm, safe, organized, supportive, intelligent, easy to trust.
- UX: reduce overwhelm, effortless daily tasks, clarity & adherence first, scannable meds/health info, rich but minimal, progressive disclosure.
- Interaction: simple, intuitive, smooth, lightweight, minimal friction.
- Layout: clean structure, modular, card-based, rounded, soft depth, readable, comfortable spacing.

## 4. Colour direction (feel, not rigid hexes)
- Brand: Primary Blue #0080FC, Deep Blue #0060FC, Bright Support Blue #2E90FF, Aqua/Teal #20D7C5, Soft Teal Glow #6CE7D8.
- Light neutrals: bg #F7FAFC–#FFFFFF; card white with soft transparency; border #E7EEF5; text #0F172A; secondary #5B6B7F; tertiary #8A97A8.
- Dark neutrals: base #07111F / #081423; elevated #0C1B2D; dark glass card #10253A / #11263D; border = subtle blue/cyan translucent line; text #F7FAFF; secondary #B7C4D6; tertiary #8EA0B5.
- Status: Taken green · Due now blue · Upcoming muted/slate blue · Missed red · Alert warm red dot/chip · Supplement soft green/teal pill. Must work in both themes.

## 5. Light theme
Airy, premium, bright, soft, warm-but-clinical. Cool-white bg; glass hero cards with blue-teal gradient overlays; soft diffuse shadows; rounded cards with faint borders; subtle translucency; meaningful blue/teal highlights; very readable. Buttons/chips tactile, not bulky. Hero areas may use soft mesh/wave gradient forms.

## 6. Dark theme
A true companion, not inverted. Deep, rich, sophisticated, luminous, calming; futuristic but trustworthy. Dark navy bg; dark glass cards; subtle inner glow / soft edge light; blue-teal gradients as luminous accents; white text, softer secondary; clear accessible chips/buttons; same hierarchy as light. No aggression, no contrast spikes, glow used sparingly.

## 7. Typography
Modern, premium, readable, slightly Apple-inspired, clinical but friendly. Strong hierarchy: bold headlines, medium-weight section titles, regular supporting text, readable labels/chips; no decorative fonts. Large welcoming headings, clear section titles, smaller metadata, compact readable medication details, clean button labels.

## 8. Shape
Soft rounded geometry: large-radius hero cards, medium-large cards, pill chips/buttons, rounded-square or circular icon containers. No sharp/brutalist edges.

## 9. Elevation, shadow, glass (critical)
Calm glass: slight translucency, frosted feel, soft layering, subtle border highlights, smooth depth. Shadows very soft — light: low-opacity cool shadow; dark: subtle glow/shadow mix; never heavy. Borders thin — low-contrast in light, slightly luminous in dark. Depth premium, gentle, never noisy.

## 10. Icons
Clean, rounded, simple, outline or soft-fill, consistent stroke. Meds, health, reports, appointment, readings, upload, profile, search, notifications, schedule, reminders, morning/afternoon/evening. Support clarity, never dominate.

## 11. Layout
Generous padding, strong section separation, clean grouping, scannable vertical flow, modular. Hero overview near top → grouped sections → quick-action card grid → appointment/reminder cards; lightly floating premium bottom nav.
Priority: 1 daily actions · 2 due now · 3 upcoming · 4 quick actions · 5 deeper data.

## 12–13. Today screen (must preserve)
- Header: status bar, logo + app name, optional tagline, search icon, notification icon; greeting e.g. "Good Morning, Alex 👋" + health subtext.
- Hero card: Today's Medications — completion summary, circular progress, blue/teal gradient.
- Medications grouped Morning / Afternoon / Evening: label, count, card container. Row: icon, name, dosage, time, optional "Supplement" label, status chip (Taken / Due Now / Upcoming / Missed), actual taken time, overflow menu.
- Appointment card: doctor, consultation label, date, time, "View Details".
- Quick Actions: Upload Record, Add Medication, Add Appointment, Add Reading.
- Premium bottom nav.
- Chips: Taken green · Due Now blue emphasis · Upcoming muted cool · Missed red. Home command center: informative but calm.

## 14. Navigation
Brief lists Today / Medications / Health / Profile, with Records, Appointments, Reminders, Timeline, Quick Add, Family as secondary areas. Keep primary nav simple.

## 15. Feature requirements
A. Medications: scan/upload prescriptions, editable OCR (name, dosage, frequency, timing, duration), prescribed + user-added supplements, pause/stop/change/restart, taken history, reminders.
B. Records: upload prescriptions & reports, preserve originals, structured extracted data, link to timeline.
C. Quick Add: BP, glucose, temperature, one-off meds, supplements, appointments.
D. Timeline: consultations, conditions, tests, prescriptions, surgeries, reactions, hospitalizations, vaccinations, injuries.
E. Allergies: known / not sure / none; allergens, reaction type, severity, suspected triggers.
F. Profile basics: name, DOB, gender, optional email, verified mobile, height, weight, blood group, emergency contacts, doctors.

## 16. Onboarding
1 Mobile number · 2 OTP · 3 Create account (name, DOB, gender mandatory, email optional) · 4 Health basics (height, weight, blood group) · 5 Allergies (Yes / No / Not sure; allergen, reaction, severity). Later "Complete Your Profile" prompt. Friendly, short, clear, reassuring, not clinical.

## 17. Profile
My Health: Personal Information · Health Details · Allergies & Reactions · Emergency & Healthcare Contacts. Family & Account: Family Members / switching (one person per account) · Data & Privacy.

## 18. Components
App header, greeting, hero summary card, medication group card, medication row, status chips, appointment card, quick-action tiles, bottom nav, search & notification buttons, vitals/summary cards, form fields, dropdowns, segmented controls, toggles, upload cards, timeline items, empty states, sheets/modals, confirmation dialogs. Rounded, light, tactile, premium, scannable, consistent across themes.

## 19. Motion
Subtle, premium, calming, purposeful: card transitions, chip state changes, tab changes, sheets, progress, success. No flashy motion or big bounces.

## 20. Tone
Supportive, concise, reassuring. "Stay on track with your health today." · "3 of 5 completed" · "Due now" · "Taken at 7:42 AM" · "View Details". No jargon, no fear, no excess words.

## 21. Accessibility
High readability and contrast, clear chips, touch-friendly targets, legible sizes, obvious hierarchy, never icon-only status, readable dark mode, scannable for all ages. Usability before elegance.

## 22. Output format for every screen or flow
1 Purpose · 2 Information hierarchy · 3 Layout breakdown · 4 Visual treatment · 5 Components · 6 Light mode · 7 Dark mode · 8 Key UX decisions · 9 Microcopy · 10 Improvements within the system.
Don't change style, colours, navigation or hierarchy unless explicitly told.

## 24. Design system deliverable
Principles, colour tokens, type scale, spacing, radii, icon rules, elevation/shadow, light/dark rules, chip/button/input styles, card patterns, navigation patterns, motion, accessibility, reusable components.

## 25. Constraints
Don't: too playful, generic hospital dashboard, enterprise-heavy, overuse gradients or glass, clutter, over-flatten, off-palette colours, harsh/neon dark mode.
Do: premium, calm, modern, trustworthy, health-focused, elegant, consistent.
