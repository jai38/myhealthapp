# S-RX-03 v1.1 · Lab report review — change specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-23 · **Changes:** the locked `specs/S-RX-03-confirm-and-verify.md` (v1.0, 2026-11-22) for **Laboratory Reports only**.
**Reason:** owner decision LAB-OD-01 (DOC-02 v1.0, approved 2026-11-23).
**Sources:** DOC-02 v1.0 §3–§13 (APPROVED); S-RX-03 v1.0 (locked); RX-VER-01–06, 12 (APPROVED); CLR-03, 05, 06, 07 (APPROVED).
**Labels:** APPROVED (in DOC-02 or S-RX-03 v1.0) · PROPOSED (new here, needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.1 |
|---|---|
| 3A Reading, failed reading, Save and Check Later | Unchanged |
| 3B Confirm document type, type sheet, mixed file | Unchanged; the hint for a lab report reads "We found 18 results. You’ll check them next." (PROPOSED copy) |
| 3C for Prescription | Unchanged |
| **3C for Laboratory Report** | **Replaced:** the v1.0 basic-details form (§7) becomes the lab review below |
| 3C for the other seven types | Unchanged (basic details) |
| Look-alike sheet, Not-your-document sheet | Unchanged; look-alike copy for labs mentions provisional/final reports |
| Save boundary, statuses, one-record rule | Unchanged |
| **New:** planned-test link sheet after saving a lab report | Added (DOC-02 §10.3) |
| S-RX-04 | Still bypassed for lab reports |
| S-RX-05 | Structure unchanged; lab lines inside the existing groups (§8) |

## 2. View 3C · "Check your results" (Laboratory Report)
**Header:** title "Check your results"; **Original** button (as v1.0).
**Progress:** "4 of 18 results checked · 2 need attention" (counts results, not fields).
**Disclaimer line** under the progress: "These are your lab’s results and ranges. Ayoreni doesn’t interpret them." (APPROVED DOC-02 §8).

### 2.1 Report details (group)
Lab · Name on report · Collected (date and time) · Reported · Referred by. One **Confirm Details**; unclear fields flagged on their own (APPROVED DOC-02 §5, S-RX-03 v1.0 pattern). The name feeds the existing Not-your-document check.

### 2.2 Results, grouped by the report’s own sections
- Section header as printed (e.g. "Lipid Profile · 6 results").
- **Row:** test name as written · result and unit (right-aligned, tabular figures) · "Range 12.0–15.5" in small text as printed · **lab flag chip only when printed**: icon + word, e.g. "↑ H · from the lab" (neutral colour, not red; PROPOSED) · row status icon (Needs check / Confirmed / Edited / Unable to Verify / Not on report).
- **Unclear row:** amber background and "We couldn’t read this clearly"; it opens the result sheet.
- **Section action:** **Confirm 5 Clear Results** — confirms only rows Ayoreni read clearly in that section; unclear rows are left out of it and stay "Needs check" until checked one by one. The button names the count, so nothing is confirmed silently (APPROVED LAB-OD-02).
- **Printed critical note:** the row shows "Marked critical by the lab"; the sheet shows the lab’s note verbatim and the line "The lab marked this result as critical. Contact your doctor if you haven’t already." (APPROVED LAB-OD-05; wording pending clinical review). No notification.
- **Sensitive result** (approved list, LAB-OD-06): row shows "Sensitive result · Show" instead of name and value until tapped (PROPOSED: applies in this review list too, for privacy when others can see the screen).
- **Previous value printed** (cumulative reports): small text under the row, "Previous (printed): 7.8 %". Not a result unless added in the sheet (APPROVED LAB-OD-07).

### 2.3 Narrative and table sections
- Narrative findings (e.g. histopathology, "Impression") show as a text block with its source crop and **Confirm Text** / **Unable to Verify**.
- Culture and sensitivity: organism and antibiotic table kept as a table, confirmed as one block; no medicine suggestions (APPROVED DOC-02 §7).

### 2.4 Add a result we missed
"+ Add a result we missed" per section; typed from the original; marked as added by the person (S-RX-03 v1.0 pattern).

## 3. Sheet · Check one result
1. **Source crop** of that line, zoomable, page number.
2. **As printed:** the full line verbatim.
3. **Fields:** Test name · Result (shows the parsed number and comparator, e.g. "< 0.5", next to the literal) · Unit · Reference range · Flag from the lab · Date (only if the report prints one per test). Unit, range and flag each offer **Not on report**.
4. **Previous (printed)** when present, with **Add as Separate Result** (opens a short form for its own date; checked like any result).
5. **Actions:** **Confirm** · **Unable to Verify** · **Remove from This Record**.
6. Never: invent a flag, convert a unit, round a number, or read "1,50,000" as anything but 150000 after the person confirms it (APPROVED DOC-02 §8–§9).

## 4. Saving (lab report)
| Situation | Primary | Secondary |
|---|---|---|
| All results that need checking are confirmed | **Save Record** | — |
| Some unresolved | **Save Record** → Sheet P ("16 of 18 results checked · 2 still to check") with **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
Saving follows v1.0 §10 unchanged. In addition (APPROVED DOC-02 §10.1): only **Verified results** become entries in Records → Health Measurements, each linked to its record, page and line; unverified rows stay on the record only.

## 5. Look-alike check (lab wording; PROPOSED copy)
Same sheet as v1.0, with: "This looks like a report you’ve already saved" and, under **It’s an Updated Copy**, "For example, a final report that replaces a provisional one." Matching uses lab, report ID, collection date and tests (APPROVED DOC-02 §11).

**Same test, same time, from another document** (e.g. a discharge summary already saved): not a duplicate document. After saving, the measurement shows 2 sources; if the values differ, a one-time question on the record asks which is right, or keeps both — never merged silently (APPROVED DOC-02 §11). Designed with Health Measurements (Records), not here.

## 6. New sheet · Link to a planned test (PROPOSED placement)
Shown **after the save succeeds**, only when a planned test may match (same test name, planned before the collection date):
- "Is this the result for your HbA1c test?" / "Planned from your 12 Oct prescription."
- **Yes, Link Result** — the plan item is marked done with this result (APPROVED D27, DOC-02 §10.3).
- **No** — nothing changes.
- One sheet lists several matches if there are more than one, each with its own Yes/No.
- Then S-RX-05.

## 7. States added for lab reports
| State | What the person sees |
|---|---|
| Lab review, mixed | Progress, details, sections with confirmed, needs-check and unclear rows |
| Section confirm | "Confirm 5 Clear Results" with one unclear row left out |
| Result sheet, unclear | Crop with the unclear value highlighted; Confirm off until fixed or marked |
| Result sheet, previous value | Previous (printed) with Add as Separate Result |
| Critical note | Row label and the verbatim note in the sheet |
| Sensitive row | "Sensitive result · Show" |
| Narrative / culture block | Text or table block with Confirm Text |
| Some unresolved at save | Sheet P with result counts |
| Planned-test link | The link sheet after saving |

## 8. S-RX-05 lines for lab reports (inside existing groups; PROPOSED copy)
Record group: "Lab report saved · Partially Verified" · "18 results · 16 checked · 2 still to check". Measurements line: "16 results added to Health Measurements". Plan line (if linked): "Linked · HbA1c test from your 12 Oct prescription — marked done".

## 9. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-031-01 | 18-result report | One record; 18 rows in their printed sections (LAB-QA-01) |
| AT-031-02 | Section with 1 unclear row | Button reads "Confirm 5 Clear Results"; unclear row stays Needs check |
| AT-031-03 | Value outside range, no printed flag | No flag chip (LAB-QA-06) |
| AT-031-04 | Printed "H" | Chip "↑ H · from the lab" with icon and word (LAB-QA-07) |
| AT-031-05 | "1,50,000 /µL" | Shown literally; number 150000 only after Confirm (LAB-QA-03) |
| AT-031-06 | "<0.5 mg/dL" | Comparator kept (LAB-QA-04) |
| AT-031-07 | "Positive", no unit | Unit "Not on report"; row can be Verified (LAB-QA-05) |
| AT-031-08 | 2 unreadable rows, Save | Sheet P with result counts; Partially Verified; 16 measurements created, 2 not (LAB-QA-08) |
| AT-031-09 | Cumulative report | Previous value text only; Add as Separate Result needs its own date and check (LAB-QA-10) |
| AT-031-10 | Printed critical note | Row label + verbatim note; no notification (LAB-QA-15) |
| AT-031-11 | Culture and sensitivity | Table block; no medicine suggestion (LAB-QA-16) |
| AT-031-12 | Sensitive row | Masked until Show (LAB-QA-17) |
| AT-031-13 | Final report after provisional | Look-alike sheet; Updated Copy links versions (LAB-QA-11) |
| AT-031-14 | Planned HbA1c test exists | Link sheet after save; plan done only on Yes (LAB-QA-13) |
| AT-031-15 | No dates on report | "Date unknown"; upload date not used (LAB-QA-14) |
| AT-031-16 | Prescription screens and other types | Unchanged from v1.0 |
| AT-031-17 | Largest text size, light and dark | Values and units don’t clip; rows wrap; contrast passes |

## 10. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Lab flag chip colour | Neutral (grey/blue), never red, so the app doesn’t look like it is judging the result |
| OPEN-2 | Mask sensitive rows in this review list too | Yes, with one-tap Show |
| OPEN-3 | Planned-test link sheet placement | After the save succeeds, before S-RX-05 (not inside the review) |
