# S-RX-03 v1.4 · Hospitalization & procedure records review — change specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0–v1.3 for **Hospitalization & Procedure Records only**.
**Reason:** owner decision DOC05-OD-01 (DOC-05 v1.0, approved 2026-11-23).
**Sources:** DOC-05 v1.0 §3–§10 (APPROVED); S-RX-03 v1.0 (medicine cards, eligibility, save), v1.2 (recommendations sheet), v1.3 (condition and same-visit sheets) — locked; S-RX-04 v1.0 and v1.1 (stop/hold) — locked; RX-VER-01–06, 12; CLR-02, 04, 06, 07 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.4 |
|---|---|
| 3A Reading, mixed file (summary + bill split), Not-your-document | Unchanged |
| 3B type | Unchanged; hint for a hospital record: "We found a discharge summary from Apollo Hospital, 3–7 Nov 2026, with 4 medicines. You’ll check it next." (PROPOSED copy) |
| 3C Prescription, Lab, Imaging, Consultation (v1.0–v1.3) | Unchanged |
| **3C Hospitalization & Procedure Records** | **Replaced:** basic-details form becomes the hospital review below |
| 3C for the remaining four types | Unchanged (basic details) |
| Save boundary, statuses, one-record rule, look-alike sheet | Unchanged; look-alike copy mentions interim and final summaries |
| **After saving (hospital):** allergies sheet; condition link (v1.3 pattern); same-stay link; recommendations (v1.2 pattern) when there is no S-RX-04 | Added (DOC-05 §7) |
| S-RX-04 | Used with v1.1 (stop/hold) when there are discharge medicines or change instructions |
| S-RX-05 | Structure unchanged; hospital lines inside existing groups (§6) |

## 2. View 3C · "Check your hospital summary"
**Header:** title "Check your hospital summary" (operation notes: "Check your procedure note"); **Original** button.
**Progress:** "4 of 9 items checked · 1 needs attention".
**Disclaimer:** "This is your hospital’s summary as written. Ayoreni doesn’t interpret it." (APPROVED DOC-05 §6).

Groups, in this order (PROPOSED):
1. **Stay details:** Hospital and department · Admitted · Discharged (or "Interim summary") · Treating doctor(s) · Name on document · IP/UHID number. One **Confirm Details**.
2. **Diagnoses:** one item each, verbatim, with "Final" / "Provisional" / "Secondary" kept as written; labelled "Written by Apollo Hospital · 7 Nov 2026". Confirm · Unable to Verify.
3. **Procedures:** one item each: name as written, date, surgeon. Confirm · Unable to Verify.
4. **Discharge medicines:** the same medicine cards and item sheet as S-RX-03 v1.0 §6; same badges and eligibility.
5. **Medicine changes:** one item per instruction, verbatim ("Stop Aspirin", "Hold Metformin until review"), with a small "Changes your current medicines — you’ll decide next" note. Confirm · Unable to Verify. Deciding happens in S-RX-04 v1.1 (APPROVED DOC-05 §5).
6. **Allergies recorded in hospital:** one item each, verbatim ("Allergic to Penicillin — rash"), labelled "Documented by Apollo Hospital". Confirm · Unable to Verify. Adding to the person’s allergies is asked after saving.
7. **Follow-ups:** items ("Review in surgery OPD after 1 week", "Suture removal on day 10"). Confirm.
8. **Warning signs** (optional): a card with the hospital’s text verbatim ("Come back immediately if fever, bleeding…"), titled "Warning signs, as written by the hospital". No alerts by Ayoreni.
9. **Notes** (collapsed, optional): Course in hospital · Investigations (text only) · Advice · Operation details · Implants (items: type, brand, size, serial, verbatim).

Medicines given only in hospital stay inside the course text; they never appear as discharge medicines (APPROVED).

## 3. Saving (hospital)
| Situation | Primary | Secondary |
|---|---|---|
| Eligible discharge medicines or confirmed change instructions | **Save & Continue to Medicines** (→ S-RX-04 with v1.1) | **Save Record Only** |
| None, but confirmed follow-ups | **Save Record** (→ recommendations sheet) | — |
| Nothing to plan | **Save Record** | — |
| Some unresolved | Sheet P with counts ("7 of 9 items checked · 1 medicine strength unclear") and **Continue with Confirmed Medicines** (if eligible) / **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
"Save Record Only" keeps change instructions in the record and changes nothing (APPROVED B4).

## 4. After saving · hospital sheets
Each only if it applies, after S-RX-04 if it ran, before S-RX-05 (PROPOSED order):
1. **Recommendations** (only when S-RX-04 did not run): v1.2 sheet.
2. **Allergies** (APPROVED DOC05-OD-03): "The hospital recorded an allergy to Penicillin. Add it to your allergies?" **Add** (labelled "Documented by Apollo Hospital · 5 Nov 2026") / **Not Now**. If the allergy is already in the person’s list: "Penicillin is already in your allergies" with **Link This Record** / **Not Now** (no duplicate).
3. **Condition link:** v1.3 pattern, only for conditions the person already has.
4. **Same stay** (APPROVED DOC05-OD-07): when other saved documents fall within the stay dates: "Link these to your hospital stay 3–7 Nov?" listing them (e.g. "Lab report · 4 Nov", "Operation note · 5 Nov"), each with a checkbox **unticked**; **Link Selected** / **Not Now**. Documents stay separate.

## 5. Look-alike check (hospital wording; PROPOSED copy)
"This looks like a summary you’ve already saved"; under **It’s an Updated Copy**: "For example, a final summary after an interim one." The final is shown first, the interim kept and labelled (APPROVED DOC-05 §8).

## 6. S-RX-05 lines (inside existing groups; PROPOSED copy)
"Discharge summary saved · Verified" · medicine lines (incl. "Stopped · Aspirin from 23 Nov") · "Added to your allergies · Penicillin (documented by Apollo Hospital)" · "Linked to your hospital stay · 2 documents" · plan lines as usual.

## 7. States added
| State | What the person sees |
|---|---|
| Hospital review, mixed | Stay details, diagnoses, procedures, medicines, changes, allergies, follow-ups, warning signs, notes |
| Medicine change items | Verbatim stop/hold items with the "you’ll decide next" note |
| Notes expanded | Course, investigations text, implants |
| Some unresolved at save | Sheet P with counts |
| After save · allergies | Add / Not Now; or Link This Record when it already exists |
| After save · same stay | Unticked list of documents within the stay |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-034-01 | Discharge summary with diagnoses and 4 medicines | Stays DOC-05; groups in order; medicine cards; nothing tracked until S-RX-04 (HOS-QA-01) |
| AT-034-02 | "Stop Aspirin" confirmed | Item in Medicine changes; decided only in S-RX-04 v1.1 (HOS-QA-02) |
| AT-034-03 | Save Record Only with change instructions | Instructions saved; no medicine changed |
| AT-034-04 | IV antibiotics in the course | Course text only (HOS-QA-05) |
| AT-034-05 | Provisional diagnosis | Kept as written (HOS-QA-07) |
| AT-034-06 | Two procedures | Two dated items (HOS-QA-08) |
| AT-034-07 | Allergy recorded | Allergies sheet; added only on Add; existing allergy linked, not duplicated (HOS-QA-06) |
| AT-034-08 | Warning signs printed | Verbatim card; no alert (HOS-QA-11) |
| AT-034-09 | Lab report from the stay already saved | Same-stay sheet with unticked item; linked only on Link Selected (HOS-QA-10) |
| AT-034-10 | Interim then final | Look-alike sheet; Updated Copy; final first (HOS-QA-09) |
| AT-034-11 | Implant serial | Item in notes, verbatim (HOS-QA-13) |
| AT-034-12 | No discharge date | "Discharge date unknown" (HOS-QA-14) |
| AT-034-13 | Any hospital screen | No summary or severity wording; disclaimer shown (HOS-QA-16) |
| AT-034-14 | Other document types | Unchanged from v1.0–v1.3 |
| AT-034-15 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Group order | As §2: stay → diagnoses → procedures → medicines → changes → allergies → follow-ups → warning signs → notes |
| OPEN-2 | Order of after-save sheets | Recommendations (if no S-RX-04) → allergies → condition → same stay |
| OPEN-3 | Sensitive stays in this review | Masked until Show, same as other categories (DOC05-OD-05) |
