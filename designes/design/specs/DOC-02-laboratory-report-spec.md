# DOC-02 · Laboratory Report — Extraction & Verification Specification v0.1

**Status:** REVIEW DRAFT v0.1 (functional specification; no screens, no code) · **Date:** 2026-11-22 · **Category:** DOC-02 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-02, CLR-01, 03, 04, 05, 06, 07, 09); Verification & Recovery v1.0 (RX-VER-01–14, universal across categories); the five-layer data principle (MF-D01, applied here by analogy); B1, B2, B5; the locked S-RX-01–05 journey. Roadmap (`ayoreni-docs`): Phase 19 "Lab results and trends", Phase 11 measurements, Phase 18 tests and follow-ups, D11 (file limits), D13 (trend analytes by allow-list), D20 (data location), D21 (values, units and dates always confirmed), D27 (test completion with or without result).
**Labels:** APPROVED = already approved elsewhere and applied here · PROPOSED = new in this draft, needs your approval · OPEN = needs your decision or specialist/legal/technical input.
**Approval boundary:** approving this draft approves product behaviour, not a clinical rule set, an analyte catalogue, a vendor or thresholds.

---

## 1. Scope and classification boundary
| Situation | Classification | Status |
|---|---|---|
| A completed results report from a lab (blood, urine, stool, thyroid, lipids, HbA1c, CBC, culture, pathology) | **DOC-02 Laboratory Report**; one record however many tests (CLR-03) | APPROVED |
| A prescription that **orders** a test | DOC-01 Prescription; the test is a recommendation, never a result (CLR-01) | APPROVED |
| A discharge summary listing lab values | DOC-05 Hospitalization; values may be offered for review, still DOC-05 (CLR-02) | APPROVED |
| X-ray, MRI, CT, ultrasound, ECG, echo reports | DOC-03 Imaging & Diagnostic | APPROVED |
| Genetic or pharmacogenomic tests | DOC-08 Genetic & Genomic (restricted; CLR-08) | APPROVED |
| A lab bill or receipt | DOC-07 Bills; not proof a test was done | APPROVED |
| One PDF with a lab report and a bill | Split suggestion with page ranges (CLR-05) | APPROVED |
| A home device printout or a reading typed by the person | Not a document: Health Measurements → Add Reading (Quick Add) | APPROVED (brief §4) |

## 2. Five information layers (PROPOSED; mirrors MF-D01)
Every extracted lab value keeps these apart:
1. **Source evidence** — page, crop region, the exact printed text ("Haemoglobin 11.2 g/dL 12.0–15.5 L").
2. **Ayoreni’s reading** — parsed test name, value, unit, range, flag; candidate standard test name; each marked as AI-read.
3. **Patient context** — earlier verified results for the same test, a linked planned test, linked conditions.
4. **The person’s decisions** — confirmed / corrected / Unable to Verify / Not on report; links they chose.
5. **System metadata** — record and result IDs, extraction run and model version, timestamps, who confirmed, version history.

No layer overwrites another; a correction adds a version (APPROVED RX-VER-06).

## 3. Report-level fields (PROPOSED)
| ID | Field | Notes | Review tier |
|---|---|---|---|
| LAB-D01 | Lab / diagnostic centre name | As printed | Review, not blocking |
| LAB-D02 | Report ID / accession number | As printed; used for duplicate checks | Optional |
| LAB-D03 | Name on report | Patient check (S-RX-03 Sheet M) | Review-required |
| LAB-D04 | Age and sex as printed | Shown as printed; never overwrites the profile | Optional |
| LAB-D05 | Referred by (doctor) | As printed | Optional |
| LAB-D06 | **Sample collected** date and time | Preferred clinical date for the results | Review-required if present |
| LAB-D07 | Reported / authorised date | Separate from collection | Review-required if present |
| LAB-D08 | Upload date | System; never used as the clinical date | System |
| LAB-D09 | Specimen | Blood, serum, urine, stool… where printed | Optional |
| LAB-D10 | Report-level comments, signatures, disclaimers | Kept as text | Optional |

**Date rule (PROPOSED):** results are placed on the timeline at the **collection date**; if absent, the report date; if both are absent, "Date unknown" — never the upload date (APPROVED RX-MAT-10 principle, Classification §5).

## 4. Result-level fields (PROPOSED) — one row per test
| ID | Field | Notes |
|---|---|---|
| LAB-R01 | Section / panel as printed | e.g. "Lipid Profile", "Complete Blood Count"; keeps the report’s grouping |
| LAB-R02 | **Test name as written** | Literal, e.g. "S. Creatinine" |
| LAB-R03 | Standard test name (candidate) | Only from a validated catalogue; otherwise left empty, never invented (OPEN LAB-OD-03) |
| LAB-R04 | **Result as written** | Literal, e.g. "<0.5", "1,50,000", "Positive", "Nil" |
| LAB-R05 | Result type | Number · number with comparator (<, >, ≤, ≥) · text/qualitative (Positive, Reactive, Nil, 1+) · narrative |
| LAB-R06 | Number and comparator | Parsed only when unambiguous; Indian digit grouping (1,50,000 = 150000) and decimal points handled; ambiguous → Needs check |
| LAB-R07 | **Unit as written** | Literal, e.g. "mg/dL", "x10³/µL", "%" |
| LAB-R08 | Unit (candidate) | Recognised unit text; **no conversion**, ever |
| LAB-R09 | **Reference range as printed** | Literal, e.g. "12.0 – 15.5", "< 200", "Negative"; specific to this lab and report |
| LAB-R10 | Reference range parsed | Low/high/comparator only when unambiguous; may differ by age/sex as printed |
| LAB-R11 | **Flag from the lab** | Only what the report prints: H, L, High, Low, *, Critical, Abnormal. Absent → no flag |
| LAB-R12 | Method | Optional, as printed |
| LAB-R13 | Per-test date/time | Only if the report prints different times per test |
| LAB-R14 | Previous result printed on the report | Many Indian reports print a "previous value" column; kept as text only (see §9) |
| LAB-R15 | Notes / interpretation text printed by the lab | Kept verbatim; never summarised by Ayoreni |

## 5. What must be checked (review tiers; PROPOSED, extends RX-VER-01)
| Tier | Fields | Effect |
|---|---|---|
| Required to save the original | None beyond the confirmed type and the profile | Save always possible (APPROVED RX-VER-02) |
| Review-required for a result to be **Verified** | Test name (R02), result (R04), unit (R07) where one is printed | Unconfirmed → result pending; record Partially Verified |
| Review-required if present | Collection date (D06), report date (D07), name on report (D03) | As above |
| Shown, not blocking | Reference range (R09), lab flag (R11), section (R01) | Confirmed with the row; never by themselves keep a record pending |
| Optional | Method, specimen, comments, previous result, accession number | Never block |
| Not on report / not applicable | e.g. no unit for "Positive" | Recorded as such; does not block (APPROVED RX-VER-01 rule 4) |

Values, units and dates are always confirmed by the person (roadmap D21).

## 6. How it fits the locked journey
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03 (locked v1.0) currently** handles the eight other types with basic details only (its §7). Approving this draft means a **S-RX-03 v1.1** that adds a lab review in view 3C (§7 below). That is a change to a locked screen and needs its own approval before design (OPEN LAB-OD-01).
- **S-RX-04:** bypassed for lab reports (no medicines). If a planned test exists that this report may complete, a small step offers the link (§10.3).
- **S-RX-05:** unchanged structure; the Record group says "Lab report saved · 18 results · 2 still to check".

## 7. Lab review in S-RX-03 view 3C (PROPOSED, for S-RX-03 v1.1)
- **Report details** card: lab, name on report, collected, reported, referred by — one **Confirm Details** with unclear fields flagged.
- **Results**, grouped by the report’s own sections (Lipid Profile, CBC…). Each row: test name, result + unit, reference range as printed, and the **lab’s flag** if printed ("H · High, from the lab"). Row status chips as in S-RX-03.
- **Confirm by section** allowed: "Confirm 6 results in Lipid Profile" — only for rows Ayoreni read clearly; any unclear row in the section must be checked on its own first (PROPOSED; RX-OD-02 group approval). Different from medicines, which stay one by one.
- **Check one result** sheet: source crop of that line, the line as printed, then fields (test name, result, unit, range, flag, per-test date if any); Confirm · Unable to Verify · Not on Report · Remove from This Record.
- **Narrative or table reports** (histopathology, culture and sensitivity): the findings are kept as checked text blocks; organism/antibiotic tables kept as a table; no structured numbers, no medicine suggestions.
- **Save:** **Save Record** (single primary) and **Save & Verify Later** when rows are unresolved (Sheet P wording adapted: "16 of 18 results checked").

## 8. Interpretation boundary (PROPOSED; follows the brief’s "no automatic lab interpretations")
- Ayoreni **never** decides a result is normal, abnormal, high, low or worrying. It shows only the **lab’s printed flag** and the **lab’s printed range**, labelled as coming from the lab.
- No colour-only meaning: a printed flag shows icon + word ("H · High, from the lab"); results without a printed flag show no flag, even if outside the printed range.
- No explanations, diagnoses, "you may have…", risk scores, or suggestions to change medicines.
- **Critical values:** if the report prints a critical/panic note, it is shown verbatim on the result and on the record ("The lab marked this result as critical. Contact your doctor if you haven’t already.") — copy subject to clinical review; Ayoreni sends **no** alert or notification of its own (OPEN LAB-OD-05).
- Disclaimer on the record: "These are your lab’s results and ranges. Ayoreni doesn’t interpret them."

## 9. Numbers, units and special formats (PROPOSED)
- Keep the literal text; parse a number only when unambiguous. Handle Indian digit grouping (1,50,000), decimals, "<0.5", ">1000", ranges written "12.0-15.5" or "12.0 to 15.5".
- **No unit conversion** and no "equivalent" units (mg/dL vs mmol/L stay as written).
- Qualitative results ("Positive", "Reactive", "Nil", "Trace", "1+") stay text.
- **Cumulative reports** that print previous values: imported only as text on that row by default; the person can choose **Add as Separate Result** with its own date, which is then checked like any other result (prevents silently importing history).
- Handwritten values on a printed report: always Needs check.
- Hindi or mixed-language reports: literal text kept; parsing only where tested (roadmap D12).

## 10. Downstream use
### 10.1 Health Measurements (Records)
- Only **Verified results** become measurements in Records → Health Measurements; unverified rows are visible only on the record (APPROVED RX-VER-02 rule 5).
- Each measurement links back to its record, page and line; opening it shows the source (roadmap Phase 19).

### 10.2 Trends (Phase 19)
- A trend line joins results only when the **same test** (same standard name, or the same test name the person linked) has the **same unit**; mixed units are shown in a table, not joined (roadmap R18 "mixed units blocked").
- Each lab’s own reference range is shown per point, never one merged "normal" band.
- Trends only for an allow-list of common tests at first (roadmap D13; OPEN LAB-OD-04).

### 10.3 Planned tests
- If a planned test (from a prescription, S-RX-04 4C) may match this report: "Is this the result for your HbA1c test?" **Yes, Link Result** / **No**. Linking marks the plan item done with this result (roadmap D27); never automatic.

### 10.4 Conditions
- The person can link the report to one or more conditions; one original, many links (APPROVED CLR-04). Ayoreni may suggest a link only from a condition already named on the report, as a suggestion to confirm.

## 11. Duplicates (PROPOSED, extends B2 and CLR-07)
| Signal | Behaviour |
|---|---|
| Same file again | S-RX-02 exact-copy sheet (APPROVED, locked) |
| Same lab + report ID, or same lab + same collection date and the same tests | S-RX-03 look-alike sheet: Open Saved Record / It’s an Updated Copy (e.g. a final report replacing a provisional one) / It’s a Different Document |
| Same test, same collection date-time, from two different documents (e.g. lab report and discharge summary) | Both sources kept; one measurement shown with **2 sources**; the person is asked once if the values differ — never merged silently |
| Same test, different dates | Not a duplicate; separate results |

## 12. Status and recovery (APPROVED RX-VER, applied)
- Verified / Partially Verified / Unverified as in RX-VER-01, using the tiers in §5.
- Pending Verification, Records to Review, Continue Verification, optional verification reminder: exactly as for prescriptions (RX-VER-04–14).
- Editing a confirmed result reopens it, keeps the earlier value, and updates the measurement only after the person confirms (RX-VER-06).

## 13. Privacy and sensitive tests (OPEN LAB-OD-06)
- Some results are especially sensitive (e.g. HIV, hepatitis, sexually transmitted infections, pregnancy, drug screens). Proposal: these rows are **hidden in previews and lists by default** ("Sensitive result · tap to view"), excluded from notifications and from the doctor PDF unless the person includes them. Exact list and rules need legal review.
- Lock-screen and notification text never names a test or value (APPROVED RX-VER-14 rule 9, roadmap D26).

## 14. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| LAB-QA-01 | One PDF with 18 results | One record; 18 result rows linked to their lines (QA-DOC-03) |
| LAB-QA-02 | Prescription ordering an HbA1c test | Stays a prescription; no result created |
| LAB-QA-03 | Result "1,50,000 /µL" | Parsed as 150000 only after confirmation; literal kept |
| LAB-QA-04 | Result "<0.5 mg/dL" | Comparator kept; not stored as 0.5 |
| LAB-QA-05 | Result "Positive", no unit | Text result; unit "Not on report"; can be Verified |
| LAB-QA-06 | Value outside printed range, no printed flag | No flag shown; no Ayoreni judgement |
| LAB-QA-07 | Printed "H" flag | Shown as "H · High, from the lab" with icon and word |
| LAB-QA-08 | Two results unreadable | Saved Partially Verified; 16 measurements available; 2 pending |
| LAB-QA-09 | Glucose in mg/dL now, mmol/L last year | Not joined in a trend; shown in a table with units |
| LAB-QA-10 | Cumulative report with previous values | Previous values stay text unless Add as Separate Result |
| LAB-QA-11 | Final report replacing provisional | Look-alike sheet; Updated Copy keeps both versions linked |
| LAB-QA-12 | Same HbA1c in lab report and discharge summary | One measurement, two sources; asked once if values differ |
| LAB-QA-13 | Planned HbA1c test exists | Link offered; plan marked done only on Yes |
| LAB-QA-14 | No collection or report date | "Date unknown"; upload date not used |
| LAB-QA-15 | Printed critical note | Shown verbatim; no Ayoreni notification |
| LAB-QA-16 | Culture and sensitivity report | Organism/antibiotic table kept as text; no medicine suggestion |
| LAB-QA-17 | Sensitive test row | Hidden in previews by default (if LAB-OD-06 approved) |
| LAB-QA-18 | Change type from Prescription to Lab Report | Prescription reading marked out of date; lab review starts (CLR-06) |
| LAB-QA-19 | Edit a confirmed value | Earlier value kept; measurement updated only after confirmation |
| LAB-QA-20 | Lock-screen reminder | No test name or value |

## 15. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| LAB-OD-01 | Update the locked S-RX-03 to v1.1 with the lab review (§7) | Yes — specify and design it as the next screen once this draft is approved |
| LAB-OD-02 | Confirm results by section | Yes for clearly read rows; unclear rows one by one (§7) |
| LAB-OD-03 | Standard test names (e.g. LOINC-style) | Not now; keep the lab’s names, let the person link the same test across labs; add a validated catalogue later |
| LAB-OD-04 | Which tests get trends first | A short allow-list (e.g. HbA1c, fasting glucose, lipids, creatinine, haemoglobin, TSH), to be confirmed by a clinician |
| LAB-OD-05 | Critical-value wording | Show the lab’s note verbatim plus one neutral line (§8); clinical review of the line |
| LAB-OD-06 | Sensitive tests | Hide by default as in §13; legal review of the list |
| LAB-OD-07 | Previous values on cumulative reports | Text only unless the person adds them (§9) |
| LAB-OD-08 | Backend timing | Lab extraction and measurements in Phase 19 per the roadmap; the verification statuses and basic-details save already planned for Phase 9 cover the interim |
