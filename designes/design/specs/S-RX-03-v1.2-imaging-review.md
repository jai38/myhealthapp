# S-RX-03 v1.2 · Imaging & diagnostic report review — change specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0 (2026-11-22) and v1.1 (2026-11-23) for **Imaging & Diagnostic Reports only**.
**Reason:** owner decision IMG-OD-01 (DOC-03 v1.0, approved 2026-11-23).
**Sources:** DOC-03 v1.0 §3–§10 (APPROVED); S-RX-03 v1.0 and v1.1 (locked); RX-VER-01–06, 12 (APPROVED); CLR-04, 05, 06, 07 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.2 |
|---|---|
| 3A Reading, 3B type, mixed file, Not-your-document | Unchanged; the 3B hint for imaging reads "We found an MRI report of the lumbar spine. You’ll check it next." (PROPOSED copy, uses only what was read) |
| 3C Prescription (v1.0), 3C Laboratory Report (v1.1) | Unchanged |
| **3C Imaging & Diagnostic Report** | **Replaced:** the v1.0 basic-details form becomes the imaging review below |
| 3C for the other six types | Unchanged (basic details) |
| Look-alike sheet | Unchanged; imaging copy mentions addenda and revised reports |
| Save boundary, statuses, one-record rule | Unchanged |
| **New after saving (imaging):** recommendations sheet, planned-test link | Added (DOC-03 §7.3–§7.4) |
| S-RX-04 | Bypassed |
| S-RX-05 | Structure unchanged; imaging lines inside existing groups (§7) |

## 2. View 3C · "Check your report" (Imaging & Diagnostic)
**Header:** title "Check your report"; **Original** button.
**Progress:** "2 of 4 checks done · Impression still to check" (counts the review-required items).
**Disclaimer** under the progress: "This is your report as written. Ayoreni doesn’t interpret it." (APPROVED DOC-03 §5).

### 2.1 Report details (group)
Test type (as printed, with its group, e.g. "MRI · Lumbar spine (plain)") · Body part · Side · Study date · Report date · Centre · Name on report · Reported by. One **Confirm Details**; unclear fields flagged individually.
- **Side conflict** (header says left, text says right) or unclear body part: the field is amber "Needs check — the report isn’t consistent", opens a small sheet showing both places it appears; the person chooses what the report says or **Unable to Verify**. Never auto-filled (APPROVED DOC-03 §4).

### 2.2 Impression (shown first; required)
- Card titled "**Impression**" with the label "As written by the reporting doctor"; the text verbatim with its page link.
- **Confirm Text** · **Edit** (corrects the transcription from the original; the AI text is kept in history) · **Unable to Verify**.
- No Impression printed (e.g. plain ECG printout): the card reads "No impression on this report" with **That’s Right** / **There Is One** (APPROVED "not on report" distinction).
- ECG machine text: a separate card "**Printed by the ECG machine**", verbatim, optional confirm.

### 2.3 Findings (collapsed; optional)
- "Findings · 3 paragraphs" collapsed by default; expanding shows the verbatim text, each paragraph with its page link.
- **Confirm Text** is optional; leaving it unchecked does not keep the record pending (APPROVED IMG-OD-02).
- Clinical history, technique and comparison appear in the same collapsed area, verbatim, optional.

### 2.4 Recommendations (required when printed)
Each printed recommendation as its own row, verbatim: "‘Follow-up MRI in 6 months’" with **Confirm** · **Unable to Verify**. Whether to add it to the plan is asked after saving (§4), not here.

### 2.5 Pictures and handwriting
- Pictures inside the report (key images, ECG strip): a "Pictures in this report · 2" row that opens the original at those pages. No analysis, no captions by Ayoreni (APPROVED).
- Handwritten additions: amber rows with their crop, "Needs check".

## 3. Saving (imaging)
| Situation | Primary | Secondary |
|---|---|---|
| All review-required items confirmed | **Save Record** | — |
| Some unresolved | **Save Record** → Sheet P ("3 of 4 checks done · Impression still to check") with **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
Saving follows v1.0 §10. Nothing goes to Health Measurements (APPROVED IMG-OD-03).

## 4. After saving · new sheets (imaging)
Shown one after another, only when they apply, then S-RX-05.
1. **Recommendations** (APPROVED DOC-03 §7.3): "The report recommends" with each confirmed recommendation. Per item: **Add to My Plan** (optional date and reminder; one task; if a matching plan item exists it says "Already in your plan · 12 Apr 2027" and offers **Link** instead) · **Record Only**. Never "booked".
2. **Planned test link** (APPROVED DOC-03 §7.4, same as v1.1 §6): "Is this the report for your MRI?" **Yes, Link Report** / **No**.
3. **Condition link** (APPROVED IMG-OD-06; PROPOSED placement): only when the report names a condition the person already has: "This report mentions back pain. Link it to your condition ‘Back pain’?" **Link** / **Not Now**. Never creates a condition.

## 5. Look-alike check (imaging wording; PROPOSED copy)
"This looks like a report you’ve already saved"; under **It’s an Updated Copy**: "For example, an addendum or a revised report." The newer version is labelled "Revised report" on the record, both kept (APPROVED DOC-03 §8).

## 6. States added for imaging
| State | What the person sees |
|---|---|
| Imaging review, mixed | Details, Impression card, collapsed Findings, recommendation row |
| Side conflict | Amber Side field and the two-place sheet |
| Impression unclear | Amber Impression with crop; Confirm off until fixed or marked |
| No impression (ECG) | "No impression on this report" + machine-text card + picture row |
| Findings expanded | Verbatim paragraphs with page links |
| Some unresolved at save | Sheet P with check counts |
| After save · recommendations | Add to My Plan / Link / Record Only |
| After save · condition link | Link / Not Now |

## 7. S-RX-05 lines for imaging (inside existing groups; PROPOSED copy)
"MRI report saved · Verified" · "Added to your plan · Follow-up MRI, around May 2027" · "Linked · MRI from your 12 Oct prescription — marked done" · "Linked to your condition · Back pain".

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-032-01 | MRI report | Details, Impression first, Findings collapsed, recommendation row (IMG-QA-01) |
| AT-032-02 | Left in header, right in text | Side amber; two-place sheet; never auto-chosen (IMG-QA-03) |
| AT-032-03 | Impression confirmed, Findings unchecked | Can save as Verified (IMG-QA-04) |
| AT-032-04 | Impression unreadable | Partially Verified via Sheet P (IMG-QA-05) |
| AT-032-05 | ECG printout | "No impression" choice; machine text card; strip in pictures row; no analysis (IMG-QA-06) |
| AT-032-06 | Handwritten note on ECG | Amber row with crop (IMG-QA-07) |
| AT-032-07 | "EF 55%" in text | Stays in text; no measurement (IMG-QA-08) |
| AT-032-08 | Recommendation already planned | Recommendations sheet offers Link, not a second task (IMG-QA-09) |
| AT-032-09 | Planned MRI exists | Link sheet; plan done only on Yes (IMG-QA-10) |
| AT-032-10 | Addendum | Look-alike sheet; Updated Copy; "Revised report" label (IMG-QA-11) |
| AT-032-11 | Report names an existing condition | Condition sheet; link only on Link (IMG-QA-12) |
| AT-032-12 | Report names a condition the person doesn’t have | No condition sheet (IMG-QA-13) |
| AT-032-13 | No dates | "Date unknown" (IMG-QA-14) |
| AT-032-14 | Any imaging screen | No summary, explanation or severity wording; disclaimer shown (IMG-QA-18) |
| AT-032-15 | Prescription, lab and other types | Unchanged from v1.0 / v1.1 |
| AT-032-16 | Largest text size, light and dark | Long text wraps; nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Edit on the Impression | Allowed, to fix a misread transcription; the AI text and the edit are both kept; the original page is always one tap away |
| OPEN-2 | Order of the after-save sheets | Recommendations → planned test → condition, each only if it applies |
| OPEN-3 | Sensitive reports in this review | Masked until Show, the same as v1.1 lab rows (IMG-OD-05) |
