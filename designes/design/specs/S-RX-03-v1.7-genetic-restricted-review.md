# S-RX-03 v1.7 · Genetic & genomic report — restricted review — change specification

**Status:** APPROVED 2026-11-23 (owner: "approve S-RX-03 v1.7 with recommendations"; all PROPOSED items and OPEN-1–3 recommendations accepted; release still gated on privacy/legal review) · design APPROVED 2026-11-23 (canvas boards R03G and R03G States) · LOCKED · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0–v1.6 for **Genetic & Genomic Reports only**.
**Reason:** owner decision DOC08-OD-01 (DOC-08 v1.0, approved 2026-11-23). Release gated on privacy/legal review (DOC08-OD-08).
**Sources:** DOC-08 v1.0 §2–§11 (APPROVED); S-RX-03 v1.0 (type step, save boundary, Not-your-document, look-alike sheet) — locked; A01 App lock (device authentication) — locked; CLR-08, QA-DOC-08, VER-AC-10.5, VER-E2E-13 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN · LEGAL GATE.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.7 |
|---|---|
| 3A Reading | Unchanged; copy stays generic ("Reading your document…") |
| 3A mixed file (CLR-05) | Unchanged; a genetic part split from another document becomes its own restricted record |
| 3A Not-your-document | Unchanged; name shown only in the sheet, never in a preview |
| **3B type, when DOC-08 is suggested** | Hint never names a gene, test or result: "This looks like a genetic report. It will be kept restricted." (PROPOSED copy). Choosing another type shows the restriction notice (§5) |
| 3C Prescription … Bills (v1.0–v1.6) | Unchanged |
| **3C Genetic & Genomic Report** | **Replaced:** basic-details form becomes the restricted review below |
| 3C Other Medical Document | Unchanged (basic details) |
| Save boundary, statuses, one-record rule | Unchanged |
| Look-alike sheet | Restricted wording (§4); shown only while in this flow |
| **After saving (genetic):** "Kept restricted" sheet | Added (DOC-08 §10) |
| S-RX-04 | **Not used** |
| S-RX-05 | Line "Restricted record saved · details verified"; no test name (§6) |

## 2. View 3C · "Check your report details"
**Header:** title "Check your report details"; lock icon in the title row; **Original** button (opens the original inside the app; app-switcher snapshot blurred while it is open).
**Restricted notice** (top card, lock icon): "**This is a genetic report.** It will be kept restricted: hidden from lists and search, left out of sharing, and opened only with Face ID or your passcode." (PROPOSED copy).
**Disclaimer:** "Ayoreni doesn’t read or explain the results. Only the details below are saved." (APPROVED DOC-08 §5, adapted).

**Report details** (the only group; PROPOSED):
- Name on document · Report date · Laboratory · Test name as printed — each review-required.
- Ordering doctor (if printed) · Report ID masked "•••• 3390" with **Show** · Report type as a tag ("Final", "Amended").
- One **Confirm Details**; tapping a row edits it (item-sheet pattern with the cropped header line only).
- **No findings section**, no "results" count, no summary card. A fixed line under the group: "Results stay only in your original report." (PROPOSED copy).
- Fixed, non-personalised help line (APPROVED DOC-08 §6): "If you have questions about this report, ask the doctor or counsellor who ordered it."

**Prenatal report (LEGAL GATE):** same view; the notice adds "Ayoreni never shows or saves the baby’s sex." No other difference in this release (DOC08-OD-02).

## 3. Saving (genetic)
| Situation | Primary | Secondary |
|---|---|---|
| Details resolved | **Save Restricted Record** | — |
| Some unresolved | Sheet P ("3 of 4 details checked") with **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
Saved unverified records stay restricted; the Pending Verification row says "Restricted record" (APPROVED DOC-08 §4).

## 4. Look-alike check (restricted wording; PROPOSED copy)
"This looks like a restricted record you’ve already saved." **It’s an Updated Copy** ("For example, an amended report") · **It’s Different** · **Cancel Upload**. No test name in the sheet; the existing record is identified by lab and date only.

## 5. Changing the type away from Genetic (PROPOSED; DOC-08 §7.2)
If the person changes the type from Genetic in 3B: sheet "**Keep this record restricted?** It looked like a genetic report. If you remove the restriction, its contents may be read like other records." **Keep Restricted** (primary, default) · **Remove Restriction** · **Cancel**. Keep Restricted saves under the chosen type with the restriction on.

## 6. After saving · "Kept restricted" sheet
Title "Kept restricted"; three plain rows with icons:
- "Hidden from your records list and search" 
- "Opens only with Face ID or your passcode"
- "Left out of sharing, exports and your emergency card"
**Done**. No toggles in this release (DOC08-OD-03). Then S-RX-05 with the line "Restricted record saved · details verified".

## 7. States added
| State | What the person sees |
|---|---|
| Type hint (3B) | Genetic suggested, generic hint, lock icon |
| Restricted review | Notice, disclaimer, report details, no findings |
| Detail item sheet | Cropped header line, field edit, Confirm / Unable to Verify |
| Some unresolved at save | Sheet P with counts |
| Keep restricted? | Type changed away from Genetic |
| After save · kept restricted | Three rows and Done |
| Prenatal | Notice with the fetal-sex line |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-037-01 | PGx report | Restricted review; details only; no medicine step or warning (GEN-QA-01) |
| AT-037-02 | Panel with a variant | No variant text on any screen (GEN-QA-02) |
| AT-037-03 | 3B hint | Never names a gene, test or result |
| AT-037-04 | Original opened, then app switched | Snapshot blurred (GEN-QA-12) |
| AT-037-05 | Type changed to Lab | Keep restricted? sheet; Keep Restricted default (GEN-QA-08) |
| AT-037-06 | Amended report | Restricted look-alike sheet; Updated Copy (GEN-QA-09) |
| AT-037-07 | Save & Verify Later | Pending row "Restricted record"; generic reminder (GEN-QA-05) |
| AT-037-08 | Prenatal report | Fetal-sex line; nothing beyond details (GEN-QA-10) |
| AT-037-09 | S-RX-05 | No test name |
| AT-037-10 | Other document types | Unchanged from v1.0–v1.6 |
| AT-037-11 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Show the test name on this review screen | Yes — the person is already in the flow; it is hidden everywhere after saving |
| OPEN-2 | Ask for device authentication before this review | No — the person just uploaded it; authentication applies from the next opening |
| OPEN-3 | Thumbnails from S-RX-02 for this file | Cleared from the device after saving (DOC-08 §10) |
