# AYORENI — Screen Register

Status: LOCKED = approved by the user; REVIEW = shown, awaiting approval.
Design system: `colour-shape-spec.md` (Calm Glass v4 + Apple-style type, locked 2026-11-16).

## Flow 1 · Sign in / Sign up
Mobile Number → OTP → (existing user: Today) / (new user: Create Your Account → Your Health Profile incl. allergies → Welcome/first-time Today)

### S01 · Mobile Number — LOCKED 2026-11-16
Mockup: `mockups/s01-mobile-number.html` (#light|#dark - default|ready|error|sending), PNGs `mockups/s01-*.png`.
- Content: logo 92pt + wordmark + "Your Personal Health Companion"; compact 3D illustration; "Your health, *beautifully organized.*" (2nd line gradient); "Keep your medical records, medications and health history in one place." (no "secure"); glass form card: "Continue with mobile number" / "We'll send you a 6-digit verification code." / +91 picker + number field / unticked checkbox "I agree to the Terms of Service and Privacy Policy."; Continue pinned bottom.
- Continue enabled only with valid number + ticked box.
- Valid number: 10 digits starting 6–9; strip pasted +91 / leading 0 / spaces. Display as "98765 43210".
- Country picker visible; launch India (+91) only.
- States: default, ready, invalid ("Enter a valid 10-digit mobile number."), sending ("Sending code…"), no internet ("No internet connection. Check your connection and try again."), rate limit ("Too many attempts. Please try again in 10 minutes."), keyboard open (illustration hides, logo shrinks; not yet drawn).

### S02 · OTP Verification — LOCKED 2026-11-16
Mockup: `mockups/s02-otp.html` (#light|#dark - default|filled|wrong|verifying|resend|expired), PNGs `mockups/s02-*.png`.
- Back button + small logo lockup; gradient phone icon; "Enter verification code"; "We sent a 6-digit code to +91 98765 43210"; "Change number"; six boxes (3+3); resend timer; Verify pinned above keyboard.
- iOS SMS autofill ("From Messages") / Android SMS Retriever; paste fills all boxes.
- Rules: auto-verify when 6 digits arrive by autofill/paste; 30 s resend timer; 3 attempts per code; code valid 10 min; max 3 resends then 10-min cool-down.
- Success: brief "Mobile number verified" tick (~0.6 s), no separate screen. Wrong: "That code isn't right. N attempts left." Expired: "This code has expired. Send a new code". Resend only after countdown.

### S03 · Create Your Account — LOCKED 2026-11-16
Mockup: `mockups/s03-create-account.html` (#light|#dark - default|filled|errors|dob|selfdescribe), PNGs `mockups/s03-*.png`.
- Step bar "Step 1 of 2"; "Create Your Account"; "Just a few details to get started with your personal health companion."; masked verified mobile pill.
- Glass form: Full Name, Date of Birth (wheel picker sheet), Gender chips (Male / Female / Other / Self-describe [optional text] / Prefer not to say, none preselected), Email Address (Optional).
- Separate health-data consent checkbox (unticked); Terms already accepted on S01. Continue enabled when name, DOB, gender and consent are valid.
- Decisions: no Terms repeat (done on S01); under-18 DOB shows guardian note (age/wording pending legal review); DOB shown DD / MM / YYYY via wheel, no future dates. Errors: "Please enter your full name." / "Please enter your date of birth." / "Please choose an option."

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

### S07 · Dose update sheet + Mark as Taken confirmation — REVIEW
Mockups: `mockups/s07-dose-update.html` (#light|#dark - ask|taken|other|skipped) over Today; `today-calm-glass.html#toast` / `#dark-toast` for the Mark as Taken toast. PNGs `mockups/s07-*.png`.
- Sheet "Update dose": Cancel / Save (Save disabled until a choice); medicine card (name, dose, scheduled time).
- "Did you take this dose?": Yes, I took it → when: As scheduled / Just now / Other time (wheel, can't be in the future); No, I skipped it (optional reason chips: Felt unwell, Doctor advised, Ran out, Side effects, Other); No, I missed it.
- Footnote: "This only updates your log. It doesn't change your schedule or reminders."
- Mark as Taken on Today logs the current time instantly; dark toast "<Medicine> marked as taken at <time>" with Undo (~5 s); hero count and ring update.
