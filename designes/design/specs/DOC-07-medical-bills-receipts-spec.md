# DOC-07 · Medical Bills & Receipts — Extraction & Verification Specification v1.0

**Status:** APPROVED v1.0 2026-11-23 (owner: "approve DOC-07 with recommendations"; all PROPOSED items and the recommendations for DOC07-OD-01–08 accepted; sensitive-content rule in §9 still follows the pending legal review) (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-07 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-07: hospital, consultation, pharmacy and laboratory bills/receipts; "a financial document is not proof that the billed treatment was administered or a medicine taken"; "treat medical bills as evidence of charges/payments, not of ingestion, administration, or completed care"; CLR-05 mixed-PDF split; QA-DOC-05, QA-DOC-07); Verification & Recovery v1.0 (DOC-07 items: "provider, invoice date, billed service, amount"); MF-D01–08, B1–B5; RX-MAT-19 principle; locked S-RX-01–05, S-RX-03 v1.1–v1.5, S-RX-04 v1.1; DOC-02–06 v1.0 patterns.
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only; no tax, insurance-claim or financial advice.

---

## 1. Scope
| Document | Category | Status |
|---|---|---|
| Hospital bill (interim or final), consultation receipt, lab or scan bill | **DOC-07** | APPROVED |
| Pharmacy / chemist bill or cash memo | **DOC-07** | APPROVED |
| Payment receipt or advance/deposit receipt | **DOC-07** | PROPOSED |
| Refund note or credit note | **DOC-07** | PROPOSED |
| Bill and clinical document in one PDF (e.g. prescription + invoice, discharge summary + bill) | CLR-05 split; each part its own category | APPROVED |
| Insurance pre-authorization, claim form, claim settlement letter, policy card | **DOC-09** Other (insurance-related medical document) | APPROVED |
| Estimate / quotation for a procedure | **DOC-07**, labelled "Estimate" | PROPOSED (DOC07-OD-07) |

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence · Ayoreni’s reading · patient context · the person’s decisions · system metadata. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Bill details
| ID | Field | Tier |
|---|---|---|
| BIL-D01 | **Provider** (hospital, clinic, pharmacy, lab) as printed | Review-required |
| BIL-D02 | **Bill date** (and service dates if printed separately) | Review-required |
| BIL-D03 | **Name on document** (patient; also "billed to" if different) | Review-required (patient check) |
| BIL-D04 | Bill / invoice / receipt number | Review, not blocking; used for duplicates |
| BIL-D05 | Bill type as printed (interim, final, receipt, refund, estimate) | Review, not blocking |
| BIL-D06 | Provider registration / GSTIN | Optional |
| BIL-D07 | IP / UHID / visit number | Optional; used to link (§7.2) |

### 3.2 Amounts
| ID | Field | Handling | Tier |
|---|---|---|---|
| BIL-A01 | **Total as printed** | Exactly as printed, in ₹ with Indian grouping (₹1,23,450.00) | Review-required |
| BIL-A02 | Amount paid / balance due as printed | As printed | Review-required if present |
| BIL-A03 | Discount, tax (GST), deposit adjusted, insurer/TPA share, patient share | As printed, each labelled as the bill labels it | Optional |
| BIL-A04 | Payment mode (cash, card, UPI, insurance/cashless) | Word only; card and UPI identifiers **not extracted** (§9) | Optional |

**Amount rule (PROPOSED; safety core for money):** Ayoreni never calculates, corrects or rounds an amount. If the printed lines visibly don’t add up to the printed total, the total is flagged **"Check the total"** so the person compares it with the original; the printed figure is kept (rule 13 principle). Unreadable digits are "[unclear]", never guessed.

### 3.3 Line items
| ID | Field | Handling | Tier |
|---|---|---|---|
| BIL-L01 | Description as written ("Consultation — Dr. Rao", "CBC", "Room rent — 4 days", "Dolo 650 Tab ×15") | Verbatim | Optional (one **Confirm All Lines** for the list) |
| BIL-L02 | Quantity, rate, amount | As printed | Optional |
| BIL-L03 | Pharmacy extras: batch, expiry, MRP | As printed | Optional |
| BIL-L04 | Package names ("Angioplasty package") | Verbatim; contents never assumed | Optional |

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items |
|---|---|
| Required to save | Confirmed type and profile (APPROVED RX-VER-02) |
| Review-required for **Verified** | Name on document, provider, bill date, total, and paid/balance when printed |
| Optional | Line items (as a list), bill number, tax and discount, payment mode, IDs |
Lines are not checked one by one by default: a bill can have 80 lines. One **Confirm All Lines** or open a line to correct it (PROPOSED, DOC07-OD-03).

## 5. Charges are not care (APPROVED principle; PROPOSED behaviour — the safety core of this category)
- A billed medicine is **not** a prescription, a tracked medicine or a dose taken. Pharmacy bill lines **never** create, start, change or match medicines, and never go to S-RX-04 (APPROVED DOC-07 rule; rule 14–15 principles).
- A billed test, scan, procedure, vaccine or room stay is **not** a result, a procedure record, an immunization or a hospital stay. Nothing is added to the timeline as care from a bill.
- A bill **can be linked** to the clinical record it belongs to, only by explicit choice (§7.2). Linking adds the bill under that record; it changes nothing in it.
- No wording such as "you had", "you took", "completed", "treatment received" on any bill screen.
- Disclaimer: "This is a bill as written. It shows charges, not the care you received."

## 6. Interpretation boundary (PROPOSED)
- No price comparison, overcharging, reasonableness or "you could save" statements.
- No tax-deduction (e.g. Section 80D), reimbursement or claim-eligibility statements.
- No insurer coverage interpretation; insurer/TPA amounts shown only as printed.

## 7. Downstream use
### 7.1 Records
Bills appear in Records with a **Bills** filter, dated by the bill date, showing provider and total ("Apollo Hospital · ₹1,23,450 · Final bill"). Not on the health timeline as care events (DOC07-OD-04). Never the upload date.

### 7.2 Link to the related record (PROPOSED; DOC07-OD-02)
After saving, when a saved clinical record matches by provider + date, or by IP/UHID: "Is this the bill for your hospital stay at Apollo Hospital, 3–7 Nov?" **Link** / **Not the Same** / **Not Now**. Several candidates → a list, none preselected, + **None of These**. Never linked automatically. Works for prescriptions (pharmacy bill), lab and imaging reports, consultations and stays.

### 7.3 Receipts and bills (PROPOSED)
A payment, advance or refund receipt with the same provider and bill number as a saved bill: "Is this a payment for your Apollo Hospital bill of 7 Nov?" **Link** / **Not Now**. Linked receipts are listed under the bill; amounts are never netted or summed by Ayoreni.

### 7.4 Spending totals (OPEN; DOC07-OD-05)
No totals, yearly spend or charts in this release. A future expense view needs its own spec.

### 7.5 Sharing
A bill can be shared or exported like any record (existing behaviour); no claim-filing flow.

## 8. Duplicates and versions (PROPOSED)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet |
| Same provider + bill number | S-RX-03 look-alike sheet |
| Interim bill, then final bill | **It’s an Updated Copy**: final shown first, interim kept, labelled |
| Duplicate / reprinted copy ("Duplicate copy" printed) | Look-alike sheet; **It’s the Same Bill** keeps one record, both files attached |
| Bill and its payment receipt | Not duplicates; receipt link (§7.3) |
| Estimate, then bill | Not duplicates; estimate stays labelled "Estimate" |

## 9. Privacy (PROPOSED; DOC07-OD-06)
- Card numbers, UPI IDs, bank account details, and Aadhaar/PAN printed on bills are **not extracted**; they stay only in the private original (rules 5–6).
- Policy and claim numbers are masked on screen ("•••• 7712") with **Show**.
- Bill lines can reveal a diagnosis or test: if the bill is linked to a hidden (sensitive) record, the bill is hidden the same way; otherwise the existing sensitive-content rule applies (legal review, as DOC-05/06).
- Notifications never name a provider, item or amount.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03:** v1.6 bill review in view 3C (DOC07-OD-01): Bill details · **Amounts** (total, paid, balance; tax and discount if printed) · **Line items** (list, **Confirm All Lines**) · Payment (mode word only) · Notes collapsed. Save button **Save Record** (no S-RX-04).
- **CLR-05 split (locked S-RX-03 mixed-file view):** unchanged; the bill part comes here.
- **S-RX-04:** not used for DOC-07.
- **After save:** related-record link → receipt link; then S-RX-05.
- **S-RX-05:** lines inside existing groups ("Bill saved · Verified · ₹1,23,450", "Linked to your hospital stay · Apollo Hospital").

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| BIL-QA-01 | Pharmacy bill with 6 medicines | Stays DOC-07; no medicine created, changed or matched; no S-RX-04 |
| BIL-QA-02 | Hospital final bill with 80 lines | Lines as one list; Confirm All Lines; total required |
| BIL-QA-03 | Lines don’t add up to the printed total | "Check the total" flag; printed total kept; nothing recalculated |
| BIL-QA-04 | Unreadable digit in total | "[unclear]"; total Unable to Verify possible; never guessed |
| BIL-QA-05 | Bill from the same stay as a saved discharge summary | Link sheet; linked only on Link |
| BIL-QA-06 | Prescription + bill in one PDF | CLR-05 split; original kept (QA-DOC-05) |
| BIL-QA-07 | Interim then final bill | Updated Copy; final first |
| BIL-QA-08 | Payment receipt for a saved bill | Receipt link offered; amounts not summed |
| BIL-QA-09 | Card number and UPI ID on receipt | Not extracted; original only |
| BIL-QA-10 | Billed vaccine or test | No immunization, no result, nothing on the timeline |
| BIL-QA-11 | Any bill screen | No "you took/had", no tax or price advice; disclaimer shown |
| BIL-QA-12 | Exact duplicate upload | S-RX-02 exact-copy sheet (QA-DOC-07) |
| BIL-QA-13 | Lock screen | Generic text only |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| DOC07-OD-01 | Update the locked S-RX-03 to v1.6 with the bill review | Yes — specify and design next |
| DOC07-OD-02 | Link a bill to its clinical record | Only by explicit Link; never automatic |
| DOC07-OD-03 | Line items | One list with Confirm All Lines; open a line to correct it |
| DOC07-OD-04 | Bills on the health timeline | No — Records with a Bills filter only |
| DOC07-OD-05 | Spending totals or charts | Not in this release |
| DOC07-OD-06 | Payment identifiers and policy numbers | Payment identifiers not extracted; policy/claim numbers masked with Show |
| DOC07-OD-07 | Estimates / quotations | DOC-07, labelled "Estimate"; never treated as a bill |
| DOC07-OD-08 | Insurance claim filing or tracking | Out of scope for this release |
