# AYORENI — Screen Register

Status: LOCKED = approved by the user; REVIEW = shown, awaiting approval.
Design system: `colour-shape-spec.md` (Calm Glass v4 + Apple-style type, locked 2026-11-16).

> **Locked baseline — 2026-11-22.** Frozen design and behaviour, approved by the owner: design system (Calm Glass UI v4 with the 2026-11-19 contrast fix), S01–S07 (incl. the S01/S02 WhatsApp update), A01–A04. Baseline commit `8c62eb0` on `designes/initial-upload`. Changes to these need the owner's approval. Not in the baseline (in review): M02 Medication Details, landing page.

## Flow 1 · Sign in / Sign up
Mobile Number → OTP → (existing user: Today) / (new user: Create Your Account → Your Health Profile incl. allergies → Welcome/first-time Today)

### S01 · Mobile Number — LOCKED 2026-11-16
Mockup: `mockups/s01-mobile-number.html` (#light|#dark - default|ready|error|sending), PNGs `mockups/s01-*.png`.
- Content: logo 92pt + wordmark + "Your Personal Health Companion"; compact 3D illustration; "Your health, *beautifully organized.*" (2nd line gradient); "Keep your medical records, medications and health history in one place." (no "secure"); glass form card: "Continue with mobile number" / "We'll send you a 6-digit verification code." / +91 picker + number field / unticked checkbox "I agree to the Terms of Service and Privacy Policy."; Continue pinned bottom.
- Continue enabled only with valid number + ticked box.
- Valid number: 10 digits starting 6–9; strip pasted +91 / leading 0 / spaces. Display as "98765 43210".
- Country picker visible; launch India (+91) only.
- **WhatsApp update — LOCKED 2026-11-21** (canvas board S01, state `nowhatsapp`). Sign-in is WhatsApp only. Helper line is now "We’ll send a 6-digit code on WhatsApp." New state **No WhatsApp on this number** (when the request returns `422 WHATSAPP_UNAVAILABLE` straight away): number stays filled, calm blue note under the field, "No WhatsApp on this number" / "We send codes on WhatsApp only for now. Try a number that uses WhatsApp."; Continue disabled until the number changes. Not an error colour: the number itself is valid.
- States: default, ready, invalid ("Enter a valid 10-digit mobile number."), sending ("Sending code…"), no WhatsApp (above), no internet ("No internet connection. Check your connection and try again."), rate limit ("Too many attempts. Please try again in 10 minutes."), keyboard open (illustration hides, logo shrinks; not yet drawn).

### S02 · OTP Verification — LOCKED 2026-11-16
Mockup: `mockups/s02-otp.html` (#light|#dark - default|filled|wrong|verifying|resend|expired), PNGs `mockups/s02-*.png`.
- Back button + small logo lockup; gradient phone icon; "Enter verification code"; "We sent a 6-digit code to +91 98765 43210"; "Change number"; six boxes (3+3); resend timer; Verify pinned above keyboard.
- ~~iOS SMS autofill ("From Messages")~~ replaced 2026-11-19. **WhatsApp update — LOCKED 2026-11-21** (canvas board S02, state `nowhatsapp`):
  - Subtitle: "We sent a code on WhatsApp to +91 98765 43210".
  - The keyboard suggestion bar no longer offers "From Messages" (iOS can't autofill from WhatsApp). Instead a glass **Paste** pill (clipboard icon, accessible name "Paste code") sits at the right of the timer row while the code is empty (default, resend). Pasting fills all six boxes and auto-verifies. Android adds one-tap autofill later (Phase 5 task 13); Paste stays as the fallback.
  - New state **We couldn’t send your code** (late failure: delivery status `WHATSAPP_UNAVAILABLE` arrives after the request): keyboard closes, boxes stay empty, blue note "This number doesn’t seem to use WhatsApp. Check the number, or use one that has WhatsApp.", primary button "Use Another Number" returns to S01 with the number selected; "Change number" link stays.
- Rules: auto-verify when 6 digits arrive by autofill/paste; 30 s resend timer; 3 attempts per code; code valid 10 min; max 3 resends then 10-min cool-down.
- Success: brief "Mobile number verified" tick (~0.6 s), no separate screen. Wrong: "That code isn't right. N attempts left." Expired: "This code has expired. Send a new code". Resend only after countdown.

### S03 · Create Your Account — LOCKED 2026-11-16
Mockup: `mockups/s03-create-account.html` (#light|#dark - default|filled|errors|dob|selfdescribe), PNGs `mockups/s03-*.png`.
- Step bar "Step 1 of 2"; "Create Your Account"; "Just a few details to get started with your personal health companion."; masked verified mobile pill.
- Glass form: Full Name, Date of Birth (wheel picker sheet), Gender chips (Male / Female / Other / Self-describe [optional text] / Prefer not to say, none preselected), Email Address (Optional).
- Separate health-data consent checkbox (unticked); Terms already accepted on S01. Continue enabled when name, DOB, gender and consent are valid.
- Decisions: no Terms repeat (done on S01); under-18 DOB → **A04 Under 18** screen (block at launch, 2026-11-19; replaces the guardian note); DOB shown DD / MM / YYYY via wheel, no future dates. Errors: "Please enter your full name." / "Please enter your date of birth." / "Please choose an option."

### S04 · Your Health Profile — LOCKED 2026-11-16
Mockup: `mockups/s04-health-profile.html` (#light|#dark - default|yes|saved|no|notsure), PNGs `mockups/s04-*.png` (full-scroll = whole page).
- Back + step bar + "Skip for Now" (top right); "Step 2 of 2"; "Your Health Profile"; "Add a few health details to personalize AYORENI. You can update them anytime."
- Body measurements card: Height (cm/in toggle), Weight (kg/lb toggle), both optional.
- Blood group card: A+ … O− chips + "I don't know".
- Allergies card: "Do you have any known allergies?" Yes / No known allergies / I'm not sure (none preselected). Yes → Allergen (search + "Add as typed"), Reaction (optional), Severity Mild/Moderate/Severe/Not sure, "Save Allergy" → saved row with edit/delete + "Add Another Allergy". No → green note; Not sure → blue note (approved copy).
- Continue always enabled (saves valid parts) → Welcome / first-time Today.
- Decisions: height in total inches when "in" (stored as cm, exact conversion); deleting an allergy asks "Remove <allergen> from your allergies?" and keeps history; allergen suggestions tagged Medicine / Food / Environment.

### S05 · Welcome / first-time Today — LOCKED 2026-11-16
Mockup: `mockups/s05-welcome-today.html` (#light|#dark - incomplete|sheet|complete), PNGs `mockups/s05-*.png`.
- Header logo lockup + search + bell; "Welcome, Ananya 👋" / "Your personal health companion."
- Gradient hero: overline "WELCOME TO AYORENI", "Let's get your health organized", "Records, medicines, supplements and readings, together in one place.", white "Get Started" pill; small 3D art.
- Quick Actions 2×2: Upload Record, Add Medication, Add Appointment, Add Reading.
- "Complete Your Health Profile" card (ring 5/8, "3 details left · about 1 min") below Quick Actions; hidden when complete.
- Get Started sheet: "What would you like to add first?" / "Pick one to begin. You can add the rest anytime." → Health Record, Medication or Supplement, Reading, Appointment; "Maybe Later"; swipe / tap outside dismisses. Each opens the real shared flow.
- Decisions: profile card sits below Quick Actions for new users, below today's medications once doses exist; tapping it opens only the missing items.

**Flow 1 (Sign in / Sign up) — COMPLETE 2026-11-16.**

## Flow 2 · Today (returning user)

### S06 · Today — LOCKED 2026-11-16
Mockup: `mockups/today-calm-glass.html` (#dark for dark), PNGs `mockups/today-*.png`.
- Header; "Good afternoon, Ananya 👋" / "Stay on track with your health today."; hero "TODAY'S MEDICATIONS · 2 of 6 taken · Next: … · 1 needs confirming" + ring.
- Morning / Afternoon / Evening groups (empty groups hidden); rows: icon, name, dose · time, Supplement tag, status chip + actual taken time, ⋮.
- One "Mark as Taken" under the Due now row; Upcoming Appointment card; Quick Actions; floating tabs.
- Decisions: hide empty groups; max 4–5 rows per group then "Show all"; tapping Not confirmed opens dose-update sheet (Taken at time / Skipped / Missed, never automatic); all done → hero "All done for today ✓", full ring, no confetti.

### S07 · Dose update sheet + Mark as Taken confirmation — LOCKED 2026-11-19
Mockups: `mockups/s07-dose-update.html` (#light|#dark - ask|taken|other|skipped) over Today; `today-calm-glass.html#toast` / `#dark-toast` for the Mark as Taken toast. PNGs `mockups/s07-*.png`.
- Sheet "Update dose": Cancel / Save (Save disabled until a choice); medicine card (name, dose, scheduled time).
- "Did you take this dose?": Yes, I took it → when: As scheduled / Just now / Other time (wheel, can't be in the future); No, I skipped it (optional reason chips: Felt unwell, Doctor advised, Ran out, Side effects, Other); No, I missed it.
- Footnote: "This only updates your log. It doesn't change your schedule or reminders."
- Mark as Taken on Today logs the current time instantly; dark toast "<Medicine> marked as taken at <time>" with Undo (~5 s); hero count and ring update.

## Flow 3 · Account security (Phase 5) — LOCKED 2026-11-21
Canvas: boards A01–A04 plus "Account security · States". Order for a new user: S03 → (under 18: A04, stop) → **A01 app lock offer** → **A02 recovery code (shown once)** → S04. Returning user on a new phone: S02 verified → **A03 new-device check** → passkey or **A02 enter recovery code** → Today.

### A01 · App lock — LOCKED 2026-11-21
States `offer`, `locked`, `failed`.
- Offer (right after S03, on by default): shield-lock tile; "Keep your health records private" / "Lock Ayoreni with Face ID, fingerprint or your phone’s PIN. Only you can open it."; glass card: App lock (switch, on) "Face ID, fingerprint or phone PIN"; "Locks when you leave" / "Opening the app again asks for it"; "Stays on this phone" / "Your face or fingerprint never leaves your phone"; footnote "You can change this anytime in Profile → Privacy & Security."; buttons "Turn On App Lock" / "Not Now".
- Locked (app returns from the background): no health data visible; logo + wordmark; "Ayoreni is locked" / "Unlock to see your health information."; large glass Face ID button; "Unlock" / "Use Phone PIN". The system prompt opens on its own when the screen appears.
- Biometric failed: Face ID glyph turns error red; red note "We couldn’t confirm it’s you" / "Try again, or use your phone’s PIN instead."; primary becomes "Use Phone PIN", secondary "Try Again".
- Build: `expo-local-authentication`; use the device's own name for the method where available (Face ID / Touch ID / fingerprint).

### A02 · Recovery code — LOCKED 2026-11-21
States `show`, `copied`, `enter`, `wrong`. The code is synthetic in the design (`K7QF-29XD-M4PL-8RWC`): 16 characters, shown in 4 groups.
- Shown once (after A01): key tile; "Save your recovery code" / "If you change phones, this code proves it’s you. We’ll show it only once."; glass code card with "Copy Code"; amber note "Keep it somewhere safe, like your password manager. Ayoreni will never ask for it on a call or chat."; checkbox "I’ve saved my recovery code"; Continue disabled until ticked.
- Copied: toast "Recovery code copied"; checkbox ticked; Continue enabled.
- Enter (new device): back button; "Enter your recovery code" / "You’re signing in on a new phone. Enter the code you saved when you set up Ayoreni."; focused field (uppercase, dashes added automatically); hint "16 letters and numbers. Dashes are added for you."; link "I don’t have my code" → A03 records-hidden path if the account qualifies, else support.
- Wrong: red field; "That code doesn’t match. Check it and try again."

### A03 · New-device check — LOCKED 2026-11-21
States `check`, `hidden`. Rules from Phase 5 P2 (90 days and the support path still to be confirmed by the owner).
- Check (new phone, account has a passkey or recovery code): shield tile; "Confirm it’s you" / "This number is signing in on a new phone. To keep your records safe, confirm with one of these."; masked number pill; two glass option rows: "Use a passkey" / "Saved on your old phone or password manager"; "Enter recovery code" / "The code you saved when you signed up"; footer "Don’t have either? Contact support". Show only the options the account actually has.
- Records hidden (no passkey or code, inactive ≥ 90 days): lock tile; "Your records are kept safe" / "This number hadn’t been used for a while, so we’ve hidden its records until our support team confirms it’s you."; blue note "Phone numbers are sometimes given to someone new. This keeps the records private if that happened."; steps 1–3 (Contact support → We confirm it’s you → Your records come back, "Nothing is deleted meanwhile"); "Contact Support" / "Sign Out". No support turnaround time is promised.

### A04 · Under 18 — LOCKED 2026-11-21
Shown when S03's date of birth is under 18 (block at launch, Phase 5 P4, pending legal review of a guardian path).
- Back button; large glass shield; "Ayoreni is for adults for now" / "You need to be 18 or older to create an account."; blue note "We’re working on a safe way for parents and guardians to keep a child’s health records. Nothing you entered has been saved."; "Check Date of Birth" (back to S03 with the wheel open) / "Close".
- Requirement: S03 data is not stored when the age check fails.

## Flow 4 · Medications

### M02 · Medication Details — REVIEW 2026-11-19
Opens when a medicine row is tapped (Today, Medications). Canvas boards "M02 · Medication Details" (props: theme, state, viewport full/phone) and "M02 · States". Built only from fields in `api.md` `MedicationDetail` (no invented data); quantity per dose isn't stored, so the dose line is strength · form · route.
- States: `active` (prescribed), `manual` (added by you), `paused`, `stopped`, `inactive` (from an older prescription).
- Nav: glass back button (to the previous tab) and a glass ⋯ button (same actions as Manage). No tab bar; this is a pushed screen.
- Header: 60pt blue pill tile; name (normalizedMedicineName, else nameAsWritten) Title 1; "500 mg · Tablet · By mouth"; chips: status (● Active green, ❚❚ Paused amber, ✕ Stopped red, "Not in daily list" grey) + source (Prescribed blue / Added by you grey). Icon + word, never colour alone.
- Status note under the header: Paused "Paused since <date>" / "No reminders or doses until you resume. Past doses stay in your history."; Stopped "Stopped on <date>" / "Reason: <discontinuedReason>. It stays in your records."; Inactive "Not in your daily list" / "This came from an older prescription, so it has no reminders. Start it only if you’re taking it now." + primary "Start Taking" (→ pick reminder times, then `POST /medications/:id/activate`).
- **Today** card (active only): each of today's doses with the S06 chips; Taken shows the actual time. Paused, stopped and inactive medicines show no Today card and **no Taken / Skip** anywhere.
- **How to take**: Instructions (prescribedInstructions); Reminders ("8:00 AM · 8:00 PM" / "Every day", Edit link; paused "Off while paused"; stopped "Turned off when stopped"; inactive "None" / "Set when you start taking it"); Course (start date / "No end date", or "12 Oct – 15 Nov 2026" / "Stopped early").
- **Prescription** (prescribed): doctor, clinic, date; "As written" shows nameAsWritten verbatim in a grey code-style pill, "Exactly as on the prescription"; "View Prescription" opens the signed document URL. **Source** (added by you): "Added by you" / "On <date> · no prescription linked"; "As entered" verbatim.
- **History**: newest 4 dose logs (scheduled time + day, chip, actual time or skip reason); past PENDING shows "? Not confirmed" / "Tap to update" (opens S07); "See All" → full intake history (M08, later). Hidden for inactive.
- **Notes**: patient notes, "Only you can see your notes", Edit.
- **Manage** (active / paused): Edit Reminder Times; Pause Medicine or Resume Medicine; Mark as Completed; Stop Medicine (red, asks for an optional reason, then `discontinue`). Footnote "Stopping or completing keeps the medicine and its history in your records." Completed/stopped medicines show no Manage card (the API can't restart them).
- Decisions: names and dates in the design are mock data; the build uses the synthetic set ("Asha Test", "Testmed A 500 mg").

## Side track L · Landing page — REVIEW 2026-11-21 (owner)
Canvas page "Landing page": board **L01** (desktop 1440, light; props `theme` light/dark, `layout` desktop/phone) and **L02** (phone 360 light and dark, desktop dark). Brief: `ayoreni-docs` `docs/phases/landing-brief.md`. Replaces the old MyHealth page in `jai38/MyHealth`.
- Build as static HTML + CSS, Calm Glass v4 tokens with the 2026-11-19 contrast values, Plus Jakarta Sans. One breakpoint: the `phone` layout below 720 px (single column, 16 px gutter, full-width buttons). No tracking scripts, no forms, no download link.
- Nav: logo + AYORENI; How it works · Privacy (hidden on phone) · Contact pill.
- Hero: amber tag "In early testing"; H1 "Your prescriptions and medicines, *in one calm place.*" (second line gradient, as S01); lead "Ayoreni reads your prescriptions, keeps your health records in order and shows what to take today. You check everything before it’s saved."; "See How It Works" / "Contact Us"; fine print "Not in the app stores yet. A small group is testing an early Android version." Right: phone mock of the Today screen drawn with synthetic data only (Asha; Testmed A 500 mg, Testvit D 1000 IU, Testmed B 10 mg) and the caption "Sample data. Not real medicines." Build it as HTML/CSS or an SVG, not a screenshot, so it stays light.
- How it works (3 cards): Snap a prescription · Check what it read ("Nothing is saved as fact until you confirm it.") · See today’s medicines ("You mark each dose taken yourself.").
- In the app now: Today · Records (timeline and a PDF summary for your doctor) · Medications.
- Coming next, labelled "These aren’t in the app yet": Sign in with WhatsApp · Health profile · Reminders · Family.
- Privacy in plain words: You decide what’s saved · How a prescription is read (processed on our servers; documents private to your account) · No ads, we don’t sell your data · Where your data is kept, **placeholder until the owner confirms the hosting wording** (brief task 2).
- Contact: gradient card "Questions about Ayoreni?" with a mailto button for the temporary support address from Phase 5 task 18. Footer: logo, "Ayoreni helps you keep track of your health. It doesn’t replace your doctor’s advice.", © 2026 Ayoreni.
- Not used, by rule: "never miss a dose", HIPAA/DPDP, zero-knowledge, encryption strengths, "certified", package scanning, a waitlist.

## Flow 5 · Add Health Record & prescription journey (S-RX-01 → S-RX-05)
Requirements: the owner's post-Welcome update of 2026-11-22 (document classification v1.0, medication reconciliation v1.0, verification & recovery v1.0). Specs live in `specs/`, one screen at a time; each is reviewed and approved before the next.

**Decisions, 2026-11-22 (owner: "go with recommendations")**
- D-RX-1 · Patient on S-RX-01: fixed "For: You · <name>" line; no selector until family/caregiver access exists.
- D-RX-2 · "Records to Review" (RX-VER-09) is approved as one conditional row in the notice area under the hero on S05/S06 Today, shown only when the count of unique pending documents is above 0. Adds to the locked screens; nothing else on them changes. To be drawn when the verification screens are designed.
- D-RX-3 · Generated doctor PDF reports live in Records → Documents with their own "Report" label (not one of the nine document categories, never Pending Verification).
- D-RX-4 · The new specifications plus the locked baseline are treated as complete for this flow; the Master Blueprint and 40-change register aren't needed unless they touch document upload.

### S-RX-01 · Add Health Record — LOCKED 2026-11-22 (spec and design approved)
Spec: `specs/S-RX-01-add-health-record.md` (approved with all recommendations: photos joined into one PDF with originals kept; PDF or photos, not both; discard dialog, no draft; offline selection with queued upload). Canvas: boards R01 and R01 States.

### S-RX-02 · Review Your Document — LOCKED 2026-11-22 (spec and design approved)
Spec: `specs/S-RX-02-review-your-document.md` (approved with all recommendations). Canvas: boards R02 and R02 States.

### S-RX-03 · Confirm Classification & Verify Information — LOCKED 2026-11-22 (spec and design approved)
Spec: `specs/S-RX-03-confirm-and-verify.md` (approved with all recommendations). Canvas: board R03 with state boards R03 A (reading and type) and R03 B (check and save).

### S-RX-04 · Medication Reconciliation & Optional Scheduling — LOCKED 2026-11-22 (spec and design approved)
Spec: `specs/S-RX-04-reconcile-and-schedule.md` (approved with all recommendations). Canvas: board R04 with state boards R04 A (list and decisions) and R04 B (setup, tests, confirm).

### S-RX-05 · Completion Summary — LOCKED 2026-11-22 (spec and design approved)
Spec: `specs/S-RX-05-completion-summary.md` (approved with all recommendations). Canvas: boards R05 and R05 States.

**Flow 5 (Add Health Record journey, S-RX-01 → S-RX-05) — COMPLETE and LOCKED 2026-11-22.** Next per the owner's plan: Laboratory Report extraction specification (category 2).

## Document categories · extraction specifications

### DOC-02 · Laboratory Report — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-02-laboratory-report-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.1 (lab review in view 3C), which needs its own approval before design.

### S-RX-03 v1.1 · Lab report review — LOCKED 2026-11-23 (spec and design approved; canvas boards R03L and R03L States)
Change spec: `specs/S-RX-03-v1.1-lab-review.md`. Replaces only the Laboratory Report part of view 3C in the locked S-RX-03 v1.0 and adds the planned-test link sheet after saving; everything else in S-RX-03 stays as locked.

### DOC-03 · Imaging & Diagnostic Report — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-03-imaging-diagnostic-report-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.2 (imaging review in view 3C), which needs its own approval before design.

### S-RX-03 v1.2 · Imaging & diagnostic report review — LOCKED 2026-11-23 (spec and design approved; canvas boards R03I and R03I States)
Change spec: `specs/S-RX-03-v1.2-imaging-review.md`. Replaces only the Imaging & Diagnostic part of view 3C and adds the imaging after-save sheets; everything else in S-RX-03 v1.0/v1.1 stays as locked.

### DOC-04 · Doctor Consultation & Clinical Notes — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-04-consultation-notes-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.3 (consultation review in view 3C), which needs its own approval before design.

### S-RX-03 v1.3 · Consultation & clinical notes review — LOCKED 2026-11-23 (spec and design approved; canvas boards R03C and R03C States)
Change spec: `specs/S-RX-03-v1.3-consultation-review.md`. Replaces only the Consultation part of view 3C and adds the consultation after-save sheets; everything else in S-RX-03 v1.0–v1.2 stays as locked.

### DOC-05 · Hospitalization & Procedure Records — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-05-hospitalization-procedure-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.4 (hospital review) and S-RX-04 v1.1 ("Summary says stop / hold"), each needing its own approval before design.

### S-RX-04 v1.1 · "Summary says stop / hold" — LOCKED 2026-11-23 (spec and design approved; canvas boards R04S and R04S States)
Change spec: `specs/S-RX-04-v1.1-stop-hold.md`. Adds the change-instruction group, matching sheet, Review stop/pause view and 4D groups; everything else in S-RX-04 v1.0 stays as locked.

### S-RX-03 v1.4 · Hospitalization & procedure records review — SPEC APPROVED 2026-11-23 · design APPROVED 2026-11-23 · LOCKED (canvas boards R03H and R03H States)
Change spec: `specs/S-RX-03-v1.4-hospital-review.md`. Replaces only the Hospitalization part of view 3C and adds the hospital after-save sheets; everything else in S-RX-03 v1.0–v1.3 stays as locked.


### DOC-06 · Vaccination & Immunization Record — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-06-vaccination-immunization-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.5 (vaccination review in view 3C), which needs its own approval before design.

### S-RX-03 v1.5 · Vaccination & immunization record review — SPEC APPROVED 2026-11-23 · design APPROVED 2026-11-23 · LOCKED (canvas boards R03V and R03V States)
Change spec: `specs/S-RX-03-v1.5-vaccination-review.md`. Replaces only the Vaccination part of view 3C and adds the vaccination after-save sheets; everything else in S-RX-03 v1.0–v1.4 stays as locked.

### DOC-07 · Medical Bills & Receipts — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations)
Spec: `specs/DOC-07-medical-bills-receipts-spec.md` (functional; no screens). Approving it leads to S-RX-03 v1.6 (bill review in view 3C), which needs its own approval before design.

### S-RX-03 v1.6 · Medical bill & receipt review — SPEC APPROVED 2026-11-23 · design APPROVED 2026-11-23 · LOCKED (canvas boards R03B and R03B States)
Change spec: `specs/S-RX-03-v1.6-bill-review.md`. Replaces only the Bills part of view 3C and adds the bill after-save sheets; everything else in S-RX-03 v1.0–v1.5 stays as locked.

### DOC-08 · Genetic & Genomic Report — SPEC v1.0 APPROVED 2026-11-23 (with all recommendations; release gated on privacy/legal review)
Spec: `specs/DOC-08-genetic-genomic-report-spec.md` (functional; no screens; release gated on privacy/legal review). Approving it leads to S-RX-03 v1.7 (restricted review in view 3C), which needs its own approval before design.

### S-RX-03 v1.7 · Genetic & genomic report restricted review — SPEC APPROVED 2026-11-23 · design APPROVED 2026-11-23 · LOCKED (canvas boards R03G and R03G States)
Change spec: `specs/S-RX-03-v1.7-genetic-restricted-review.md`. Replaces only the Genetic part of view 3C, adds the keep-restricted and kept-restricted sheets; everything else in S-RX-03 v1.0–v1.6 stays as locked. Release gated on privacy/legal review.
