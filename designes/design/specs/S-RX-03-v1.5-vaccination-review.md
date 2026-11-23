# S-RX-03 v1.5 · Vaccination & immunization record review — change specification

**Status:** APPROVED 2026-11-23 (owner: "approve S-RX-03 v1.5 with recommendations"; all PROPOSED items and OPEN-1–3 recommendations accepted) · design REVIEW · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0–v1.4 for **Vaccination & Immunization Records only**.
**Reason:** owner decision DOC06-OD-01 (DOC-06 v1.0, approved 2026-11-23).
**Sources:** DOC-06 v1.0 §3–§11 (APPROVED); S-RX-03 v1.0 (item sheet, save boundary, Not-your-document), v1.2 (recommendations sheet), v1.4 (allergy sheet pattern) — locked; RX-MAT-19 / MAT-AC-19; RX-VER-01–06, 12; CLR-02, 04, 06, 07 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.5 |
|---|---|
| 3A Reading, mixed file (certificate + bill split), Not-your-document | Unchanged |
| 3B type | Unchanged; hint for a vaccination record: "We found a vaccination card with 6 doses filled in. You’ll check each one next." (PROPOSED copy) |
| 3C Prescription, Lab, Imaging, Consultation, Hospital (v1.0–v1.4) | Unchanged |
| **3C Vaccination & Immunization Record** | **Replaced:** basic-details form becomes the vaccination review below |
| 3C for the remaining three types | Unchanged (basic details) |
| Save boundary, statuses, one-record rule | Unchanged |
| Look-alike sheet | Vaccination wording and a **Same Dose** option (§5) |
| **After saving (vaccination):** prescribed-vaccine link; next-due reminder; reactions | Added (DOC-06 §7) |
| S-RX-04 | **Not used** for vaccination records |
| S-RX-05 | Structure unchanged; vaccination lines inside existing groups (§6) |

## 2. View 3C · "Check your vaccination record"
**Header:** title "Check your vaccination record"; **Original** button.
**Progress:** "3 of 6 doses checked · 1 needs attention".
**Disclaimer:** "This is your vaccination record as written. Ayoreni doesn’t check it against any schedule." (APPROVED DOC-06 §6).

Groups, in this order (PROPOSED):
1. **Document details:** Name on document (and date of birth if printed) · Issuer · Certificate ID masked "•••• 4821" with **Show**. One **Confirm Details**. Government IDs never shown (APPROVED DOC-06 §9).
2. **Doses given:** one card per dose, oldest first:
   - Vaccine as written (bold) · dose label as written as a small tag ("Dose 2", "Booster").
   - Date given ("14 Jun 2021"); partial dates as printed ("Mar 2019").
   - Line 2 (if present): brand · batch · centre.
   - Status mark: ✓ Confirmed · ○ Not checked · ! Needs attention.
   - Tap → item sheet (S-RX-03 v1.0 pattern): the cropped source line, fields editable, **Confirm** · **Unable to Verify**.
   - Flags (icon + word, amber): **"Date not written"** (ticked row with no date) · **"Unclear"** (field unreadable; shown "[unclear]", never guessed).
3. **Next dose (as written):** one item ("“Next dose due 12 Jan 2027”") with **Confirm**; only if printed.
4. **Reactions noted:** one item each, verbatim ("“Fever after dose 2”"), labelled "Written on the card". Confirm · Unable to Verify.
5. **Notes** (collapsed, optional): remarks, route/site, vaccinator, stamp/signature seen.

**Printed schedule cards:** a short line above Doses: "Only rows filled in on the card are shown. Empty rows aren’t doses." The original’s empty rows are visible through **Original** only (APPROVED DOC-06 §3.3).

No dose count against a schedule, no "up to date"/"overdue"/"missed" anywhere (APPROVED DOC-06 §5).

## 3. Saving (vaccination)
| Situation | Primary | Secondary |
|---|---|---|
| All review-required items resolved | **Save Record** | — |
| Some unresolved | Sheet P with counts ("4 of 6 doses checked · 1 date not written") and **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
A dose marked Unable to Verify is saved with that status and shown as "Not verified" (APPROVED DOC-06 §5). No "Continue to Medicines" for this type.

## 4. After saving · vaccination sheets
Each only if it applies, before S-RX-05 (APPROVED DOC-06 §10 order):
1. **Prescribed vaccine** (DOC06-OD-02): when a "Prescribed · not given yet" order’s written name matches a confirmed dose: "Is this the vaccine Dr. Rao prescribed on 2 Nov?" — card shows the order ("Hep B vaccine · prescribed 2 Nov 2026") and the dose ("Hep B · Dose 1 · 10 Nov 2026"). **Link** / **Not the Same** / **Not Now**. Several possible orders → a list, none preselected, + **None of These**.
2. **Next dose reminder** (DOC06-OD-03): "The card says the next dose is due 12 Jan 2027. Add a reminder?" Row "Remind me on 12 Jan 2027, 9:00 AM" with time editable, toggle **off**; **Add Reminder** (enabled once on) / **Not Now**. Footnote: "A reminder doesn’t record the dose. You’ll add it when you have the record." Lock-screen text generic.
3. **Reactions** (DOC06-OD-04): "The card notes “fever after dose 2”. Add it to your reactions?" **Add** (labelled "Written on <issuer> card · 14 Jun 2021") / **Not Now**; existing entry → **Link This Record** (v1.4 pattern).

## 5. Look-alike check (vaccination wording; PROPOSED copy)
"This looks like a vaccination record you’ve already saved." Options:
- **It’s an Updated Copy** — "For example, a new photo of your card with more doses." Doses already confirmed are matched by vaccine + date and shown "Already in your record"; only new doses need checking.
- **Same Dose, Different Document** — "For example, a certificate and a card for the same dose." One dose, both documents listed under it.
- **It’s Different** / **Cancel Upload** (unchanged).

## 6. S-RX-05 lines (inside existing groups; PROPOSED copy)
"Vaccination record saved · Verified · 6 doses" · "Linked to Dr. Rao’s prescription · Hep B" · "Reminder set · 12 Jan 2027" · "Added to your reactions · fever after dose 2 (written on the card)".

## 7. States added
| State | What the person sees |
|---|---|
| Vaccination review | Details, doses, next dose, reactions |
| Schedule card | Child card with filled rows only, "Date not written" and "Unclear" flags |
| Dose item sheet | Source crop, fields, Confirm / Unable to Verify |
| Some unresolved at save | Sheet P with counts |
| After save · prescribed vaccine | Link / Not the Same / Not Now |
| After save · next dose reminder | Toggle off; Add Reminder / Not Now |
| Updated copy | Look-alike sheet with "Already in your record" doses |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-035-01 | CoWIN certificate, 2 doses | Stays DOC-06; two dose cards; certificate ID masked; no Aadhaar (VAC-QA-01) |
| AT-035-02 | Child card, 6 rows filled of 20 printed | Six dose cards only (VAC-QA-02) |
| AT-035-03 | Ticked row, no date | "Date not written" flag; not on the timeline (VAC-QA-03) |
| AT-035-04 | Matching prescribed order | Link sheet; order changes only on Link (VAC-QA-04) |
| AT-035-05 | Printed next-due date | Reminder sheet, toggle off; no dose recorded (VAC-QA-05) |
| AT-035-06 | No next-due date | No reminder sheet (VAC-QA-06) |
| AT-035-07 | Same card photographed again with one new dose | Updated Copy; one dose to check (VAC-QA-07) |
| AT-035-08 | Child’s card on the parent’s profile | Not-your-document flow (VAC-QA-08) |
| AT-035-09 | Reaction written on the card | Reactions sheet; added only on Add (VAC-QA-09) |
| AT-035-10 | Any vaccination screen | No schedule or status wording; disclaimer shown (VAC-QA-10) |
| AT-035-11 | Dose Unable to Verify | Saved "Not verified" (VAC-QA-11) |
| AT-035-12 | Save | No S-RX-04; no medicine created; no Taken |
| AT-035-13 | Other document types | Unchanged from v1.0–v1.4 |
| AT-035-14 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Dose order | Oldest first, matching how cards are filled |
| OPEN-2 | Default reminder time for next dose | 9:00 AM on the printed date, editable; off until turned on |
| OPEN-3 | Sensitive vaccines in this review | Not masked now; follow the legal-review outcome (DOC06-OD-06) |
