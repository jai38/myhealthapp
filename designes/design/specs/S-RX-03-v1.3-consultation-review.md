# S-RX-03 v1.3 · Consultation & clinical notes review — change specification

**Status:** APPROVED 2026-11-23 (owner: "approve S-RX-03 v1.3 with recommendations"; all PROPOSED items and OPEN-1–3 recommendations accepted) · design APPROVED 2026-11-23 (canvas boards R03C and R03C States) · LOCKED · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0, v1.1 and v1.2 for **Doctor Consultation & Clinical Notes only**.
**Reason:** owner decision DOC04-OD-02 (DOC-04 v1.0, approved 2026-11-23).
**Sources:** DOC-04 v1.0 §1–§10 (APPROVED); S-RX-03 v1.0 (medicine cards, eligibility §11, save §10), v1.2 (recommendations sheet) — locked; S-RX-04 (locked); RX-VER-01–06, 12; CLR-02, 04, 06, 07 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.3 |
|---|---|
| 3A Reading, mixed file, Not-your-document | Unchanged |
| 3B type | Unchanged; the suggestion follows DOC-04 §1 (mainly medicines → Prescription; records the visit → Consultation). Hint for a consultation: "We found a visit note from Dr. Meera Iyer with 2 medicines. You’ll check it next." (PROPOSED copy) |
| 3C Prescription (v1.0), Lab (v1.1), Imaging (v1.2) | Unchanged |
| **3C Doctor Consultation & Clinical Notes** | **Replaced:** basic-details form becomes the consultation review below |
| 3C for the remaining five types | Unchanged (basic details) |
| Save boundary, statuses, one-record rule, look-alike sheet | Unchanged; look-alike copy mentions typed copies of handwritten notes |
| **After saving (consultation):** vitals sheet, condition link, same-visit link; recommendations sheet when there is no S-RX-04 | Added (DOC-04 §7) |
| S-RX-04 | Used unchanged when there are eligible medicines |
| S-RX-05 | Structure unchanged; consultation lines inside existing groups (§6) |

## 2. View 3C · "Check your visit notes"
**Header:** title "Check your visit notes"; **Original** button.
**Progress:** "3 of 7 items checked · 1 needs attention".
**Disclaimer:** "These are your doctor’s notes as written. Ayoreni doesn’t interpret them." (APPROVED DOC-04 §5).

Groups, in this order (PROPOSED order: what matters most first):
1. **Visit details:** Doctor and specialty · Visit date · Clinic · Name on document · Visit type · Referral (if any). One **Confirm Details**; unclear fields flagged.
2. **Diagnosis:** one item per diagnosis, verbatim, labelled "Written by Dr. Meera Iyer · 12 Oct 2026". Abbreviations as written ("k/c/o HTN"). Each: **Confirm** · **Unable to Verify**. No "Add condition" here (APPROVED DOC04-OD-03).
3. **Medicines:** the **same medicine cards and item sheet as S-RX-03 v1.0 §6**, each confirmed individually; same badges ("Already in your medicines", "Reaction recorded"); same eligibility rules (v1.0 §11, RX-VER-03).
4. **Tests, follow-up & referral:** one item each, verbatim ("HbA1c after 3 months", "Review in 4 weeks", "Refer to cardiology for chest pain evaluation"). Confirm · Unable to Verify. Adding to the plan is decided later (§4).
5. **Vitals written by the doctor** (optional): one row each, as written ("BP 150/90", "Wt 72 kg", "Pulse 84"), with Confirm. No judgement words, no colours for "high/low" (APPROVED DOC-04 §5).
6. **Notes** (collapsed, optional): Complaints · History · Examination · Advice, verbatim with page links; optional **Confirm Text**.

**Handwriting:** unclear words show as amber with their crop; Unable to Verify always available (APPROVED).

## 3. Saving (consultation)
| Situation | Primary | Secondary |
|---|---|---|
| At least one eligible confirmed medicine | **Save & Continue to Medicines** (→ S-RX-04, which also handles tests/follow-ups in 4C) | **Save Record Only** |
| No eligible medicines; confirmed tests/follow-up/referral | **Save Record** (→ recommendations sheet) | — |
| Everything required confirmed, nothing to plan | **Save Record** | — |
| Some unresolved | Same buttons; Sheet P lists what’s left ("5 of 7 items checked · 1 medicine strength unclear") with **Continue with Confirmed Medicines** (if eligible) / **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |

## 4. After saving · consultation sheets
Shown one after another, only when they apply, after S-RX-04 if it ran, before S-RX-05 (PROPOSED order):
1. **Recommendations** (only when S-RX-04 did not run): the S-RX-03 v1.2 §4 sheet — Add to My Plan / Link / Record Only. A referral reads "See a cardiologist · referred by Dr. Meera Iyer". Never booked (APPROVED DOC-04 §7.5).
2. **Vitals:** "Add these readings to Health Measurements?" Each confirmed vital: **Add** / **Skip**; nothing preselected; added readings labelled "Recorded by Dr. Meera Iyer · 12 Oct 2026" and dated at the visit (APPROVED DOC04-OD-04).
3. **Condition link:** only when a confirmed diagnosis matches a condition the person already has: "Link ‘HTN’ to your condition ‘High blood pressure’?" **Link** / **Not Now** (APPROVED DOC04-OD-03; the person decides whether the abbreviation means their condition — Ayoreni does not expand it).
4. **Same visit:** only when a saved prescription exists from the same doctor and date: "You saved a prescription from Dr. Meera Iyer on 12 Oct. Show them together as one visit?" **Link as Same Visit** / **Not Now** (APPROVED DOC04-OD-06). Medicines are never doubled (S-RX-04 Link Existing already handled them).

## 5. Look-alike check (consultation wording; PROPOSED copy)
"This looks like a visit note you’ve already saved"; under **It’s an Updated Copy**: "For example, a typed copy of a handwritten note." A prescription from the same visit is **not** shown here (§4.4).

## 6. S-RX-05 lines (inside existing groups; PROPOSED copy)
"Visit note saved · Verified" · medicine lines as S-RX-05 · "Added to your plan · See a cardiologist" · "2 readings added to Health Measurements · recorded by Dr. Meera Iyer" · "Linked to your condition · High blood pressure" · "Shown with your 12 Oct prescription as one visit".

## 7. States added
| State | What the person sees |
|---|---|
| Consultation review, mixed | All six groups; one medicine needing attention; notes collapsed |
| Diagnosis items | Verbatim, "Written by Dr. …", abbreviations kept |
| Handwriting unclear | Amber item with crop |
| Notes expanded | Complaints, history, examination, advice verbatim |
| Some unresolved at save | Sheet P with item counts |
| After save · vitals | Add / Skip per reading |
| After save · condition link | Link / Not Now |
| After save · same visit | Link as Same Visit / Not Now |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-033-01 | Specialist note with diagnosis, 2 medicines, follow-up | Groups in order; medicines use prescription cards (CON-QA-02) |
| AT-033-02 | "k/c/o HTN, T2DM" | Two items as written; no expansion; no condition created (CON-QA-04) |
| AT-033-03 | Eligible medicines confirmed | Save & Continue to Medicines → S-RX-04 unchanged |
| AT-033-04 | No medicines, follow-up only | Save Record → recommendations sheet (CON-QA-03) |
| AT-033-05 | Vitals confirmed | Vitals sheet after save; nothing added without Add; labelled as recorded by the doctor (CON-QA-06) |
| AT-033-06 | Diagnosis matches an existing condition | Condition sheet; link only on Link (CON-QA-05) |
| AT-033-07 | Prescription from the same visit already saved | Same-visit sheet; documents not merged; medicines not doubled (CON-QA-09) |
| AT-033-08 | Illegible words | Amber items with crops; save still works (CON-QA-07) |
| AT-033-09 | Referral confirmed | Plan item only on Add to My Plan; never booked (CON-QA-08) |
| AT-033-10 | Typed copy of a saved handwritten note | Look-alike sheet; Updated Copy |
| AT-033-11 | Any consultation screen | No summary, explanation or severity wording; disclaimer shown (CON-QA-14) |
| AT-033-12 | Prescription, lab, imaging and other types | Unchanged from v1.0–v1.2 |
| AT-033-13 | Largest text size, light and dark | Long notes wrap; nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Group order in 3C | Visit details → Diagnosis → Medicines → Tests/follow-up/referral → Vitals → Notes |
| OPEN-2 | Order of after-save sheets | Recommendations (if no S-RX-04) → Vitals → Condition → Same visit |
| OPEN-3 | Sensitive visits in this review | Masked until Show, same as lab and imaging (DOC04-OD-05) |
