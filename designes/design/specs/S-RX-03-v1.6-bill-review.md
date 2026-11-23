# S-RX-03 v1.6 · Medical bill & receipt review — change specification

**Status:** APPROVED 2026-11-23 (owner: "approve S-RX-03 v1.6 with recommendations"; all PROPOSED items and OPEN-1–3 recommendations accepted) · design APPROVED 2026-11-23 (canvas boards R03B and R03B States) · LOCKED · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0–v1.5 for **Medical Bills & Receipts only**.
**Reason:** owner decision DOC07-OD-01 (DOC-07 v1.0, approved 2026-11-23).
**Sources:** DOC-07 v1.0 §3–§11 (APPROVED); S-RX-03 v1.0 (item sheet, save boundary, mixed-file split, Not-your-document), v1.5 (link sheet, updated-copy pattern) — locked; RX-VER-01–06, 12; CLR-02, 04, 05, 06, 07 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.6 |
|---|---|
| 3A Reading, mixed file (CLR-05 split), Not-your-document | Unchanged; the bill part of a split file comes here |
| 3B type | Unchanged; hint for a bill: "We found a final bill from Apollo Hospital, 7 Nov 2026, with 42 lines. You’ll check it next." (PROPOSED copy) |
| 3C Prescription … Vaccination (v1.0–v1.5) | Unchanged |
| **3C Medical Bills & Receipts** | **Replaced:** basic-details form becomes the bill review below |
| 3C for Genetic and Other | Unchanged (basic details) |
| Save boundary, statuses, one-record rule | Unchanged |
| Look-alike sheet | Bill wording and an **It’s the Same Bill** option (§5) |
| **After saving (bill):** related-record link; receipt-to-bill link | Added (DOC-07 §7.2–7.3) |
| S-RX-04 | **Not used** for bills |
| S-RX-05 | Structure unchanged; bill lines inside existing groups (§6) |

## 2. View 3C · "Check your bill"
**Header:** title "Check your bill" (receipts: "Check your receipt"; estimates: "Check your estimate"); **Original** button.
**Progress:** "3 of 5 items checked · 1 needs attention" (items = details, total, paid/balance, line list).
**Disclaimer:** "This is a bill as written. It shows charges, not the care you received." (APPROVED DOC-07 §5).

Groups, in this order (PROPOSED):
1. **Bill details:** Provider · Bill date (service dates if printed) · Name on document · Bill number · Bill type as a tag ("Final bill", "Interim", "Receipt", "Estimate"). One **Confirm Details**.
2. **Amounts:** large **Total as printed** ("₹1,23,450.00", tabular figures) with its own **Confirm**; below it, as printed: Paid · Balance due; then, if printed, Discount · GST · Insurer/TPA share · Patient share (each with the bill’s own label). Flags (icon + word, amber):
   - **"Check the total"** — when the printed lines visibly don’t add up: "The lines on this bill don’t seem to add up to the total printed. Compare with the original." with **View Original** · **Total Is Correct** · **Edit Total**. Ayoreni shows no calculated figure (APPROVED DOC-07 §3.2).
   - **"Unclear"** — digits shown "[unclear]"; Confirm disabled until edited or marked Unable to Verify.
3. **Line items** (42): first 5 lines shown (description verbatim · qty · amount), then **Show All 42 Lines**; one **Confirm All Lines**. Tapping a line opens the item sheet (S-RX-03 v1.0 pattern) to correct it. Pharmacy lines show batch and expiry as small text. No medicine icon, no "Track" or "Add to medicines" action anywhere (APPROVED DOC-07 §5).
4. **Payment:** mode as a word ("UPI", "Card", "Cashless — insurer") only. Policy/claim number masked "•••• 7712" with **Show** (APPROVED DOC-07 §9).
5. **Notes** (collapsed, optional): remarks, provider GSTIN/registration, IP/UHID.

Nothing on this screen says "you had", "you took", "completed" or gives price, tax or insurance comments (APPROVED DOC-07 §5–6).

## 3. Saving (bill)
| Situation | Primary | Secondary |
|---|---|---|
| All review-required items resolved | **Save Record** | — |
| Some unresolved | Sheet P with counts ("3 of 5 items checked · total needs checking") and **Save & Verify Later** / **Keep Checking** | — |
| Nothing confirmed yet | **Save & Verify Later** | **Keep Checking** |
No "Continue to Medicines" for this type, even for pharmacy bills.

## 4. After saving · bill sheets
Each only if it applies, before S-RX-05 (APPROVED DOC-07 §10 order):
1. **Related record** (DOC07-OD-02): "Is this the bill for your hospital stay at Apollo Hospital, 3–7 Nov?" — card pairs the bill ("Final bill · ₹1,23,450 · 7 Nov 2026") with the record ("Hospital stay · Apollo Hospital · 3–7 Nov 2026"). **Link** / **Not the Same** / **Not Now**. Several candidates → a list, none preselected, + **None of These**. Pharmacy bill: candidates are prescriptions by date (and doctor if printed). Footnote: "Linking shows the bill with this record. It doesn’t change anything in it."
2. **Receipt to bill** (DOC-07 §7.3): for a receipt matching a saved bill: "Is this a payment for your Apollo Hospital bill of 7 Nov?" **Link** / **Not Now**. No sums or remaining balance shown by Ayoreni.

## 5. Look-alike check (bill wording; PROPOSED copy)
"This looks like a bill you’ve already saved." Options:
- **It’s an Updated Copy** — "For example, a final bill after an interim one." Final shown first; interim kept and labelled.
- **It’s the Same Bill** — "For example, a duplicate or reprinted copy." One record; both files attached.
- **It’s Different** / **Cancel Upload** (unchanged).

## 6. S-RX-05 lines (inside existing groups; PROPOSED copy)
"Bill saved · Verified · ₹1,23,450" · "Linked to your hospital stay · Apollo Hospital" · "Receipt linked to your bill of 7 Nov". No medicine, result or timeline lines for bills.

## 7. States added
| State | What the person sees |
|---|---|
| Bill review | Details, amounts, first line items, payment |
| Check the total | Amber flag on the total with the compare message and three actions |
| Pharmacy bill | Lines with batch/expiry; no medicine actions |
| Line item sheet | Source crop, description/qty/amount, Confirm / Unable to Verify |
| Some unresolved at save | Sheet P with counts |
| After save · related record | Link / Not the Same / Not Now |
| After save · receipt to bill | Link / Not Now |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-036-01 | Hospital final bill, 42 lines | Stays DOC-07; 5 lines then Show All; Confirm All Lines (BIL-QA-02) |
| AT-036-02 | Lines don’t add up | "Check the total"; printed total kept; no calculated figure shown (BIL-QA-03) |
| AT-036-03 | Unclear digit in total | "[unclear]"; Confirm disabled until edited or Unable to Verify (BIL-QA-04) |
| AT-036-04 | Pharmacy bill with 6 medicines | No medicine action or S-RX-04; Save Record only (BIL-QA-01) |
| AT-036-05 | Saved stay at the same hospital and dates | Related-record sheet; linked only on Link (BIL-QA-05) |
| AT-036-06 | Receipt for a saved bill | Receipt sheet; no sums shown (BIL-QA-08) |
| AT-036-07 | Interim then final | Updated Copy; final first (BIL-QA-07) |
| AT-036-08 | "Duplicate copy" reprint | It’s the Same Bill; one record, two files |
| AT-036-09 | Card number / UPI ID on the receipt | Not shown or extracted (BIL-QA-09) |
| AT-036-10 | Policy number printed | Masked with Show |
| AT-036-11 | Any bill screen | Disclaimer; no care, price, tax or insurance wording (BIL-QA-11) |
| AT-036-12 | Other document types | Unchanged from v1.0–v1.5 |
| AT-036-13 | Largest text size, light and dark | Amounts not clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Lines shown before "Show All" | 5 |
| OPEN-2 | Total confirmed separately from Confirm Details | Yes — it is the most important figure |
| OPEN-3 | Sensitive bills in this review | Masked only when linked to a hidden record; otherwise follow the legal-review outcome |
