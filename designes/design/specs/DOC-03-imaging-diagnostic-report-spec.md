# DOC-03 · Imaging & Diagnostic Report — Extraction & Verification Specification v0.1

**Status:** REVIEW DRAFT v0.1 (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-03 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-03 scope: "diagnostic report or interpretation; any underlying imaging files require separate implementation scope validation"; CLR-04 one report, many conditions; CLR-05, 06, 07, 09; open item 3 on image-only files); Verification & Recovery v1.0 (RX-VER-01–14; DOC-03 items are "investigation metadata, documented findings or impression"); five-layer principle (MF-D01, by analogy); B1, B2, B5; locked S-RX-01–05 and S-RX-03 v1.1; DOC-02 v1.0 patterns (no interpretation, verbatim text, dates, sensitive results, planned-test link).
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only; no clinical rule set, vendor or thresholds.

---

## 1. Scope and boundaries
| Document | Category | Status |
|---|---|---|
| X-ray, CT, MRI, ultrasound, mammogram, DEXA, PET reports | **DOC-03** | APPROVED (examples) |
| ECG, echocardiogram, stress test (TMT), Holter reports | **DOC-03** | APPROVED (ECG, echo); others PROPOSED |
| Endoscopy, colonoscopy reports | **DOC-03** | APPROVED |
| EEG, nerve conduction (NCV/EMG), lung function (spirometry), hearing (audiometry) reports | **DOC-03** | PROPOSED |
| Biopsy or histopathology results from an endoscopy | **DOC-02** Laboratory Report (narrative block) | APPROVED via DOC-02 |
| A prescription ordering an MRI | **DOC-01**; the MRI is a recommendation (CLR-01) | APPROVED |
| A discharge summary quoting a scan result | **DOC-05** (CLR-02) | APPROVED |
| One PDF with a scan report and a bill | Split suggestion (CLR-05) | APPROVED |
| **Image files themselves** (DICOM, CD/DVD, film) | **Not supported in this release** — only photos or PDFs of the written report, and any pictures printed inside that report (OPEN IMG-OD-04) | OPEN (classification open item 3) |

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence (page, region, exact text) · Ayoreni’s reading (AI-read, marked) · patient context (earlier reports, planned tests, conditions) · the person’s decisions · system metadata and versions. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Report details
| ID | Field | Notes | Tier |
|---|---|---|---|
| IMG-D01 | **Test type** as printed | e.g. "MRI Lumbar Spine (Plain)"; plus a candidate from a short list (X-ray, CT, MRI, Ultrasound, Mammogram, DEXA, PET, ECG, Echo, Stress test, Holter, Endoscopy, Colonoscopy, EEG, NCV/EMG, Lung function, Hearing, Other) | Review-required |
| IMG-D02 | **Body part / region** as printed | e.g. "Lumbar spine", "Abdomen and pelvis" | Review-required if present |
| IMG-D03 | **Side** (left / right / both) as printed | Never inferred | Review-required if present |
| IMG-D04 | Contrast used, as printed | e.g. "With IV contrast" | Optional |
| IMG-D05 | **Study date** (when the test was done) | Preferred clinical date | Review-required if present |
| IMG-D06 | Report date | Separate from study date | Review-required if present |
| IMG-D07 | Upload date | System only; never the clinical date | System |
| IMG-D08 | Centre / hospital | As printed | Review, not blocking |
| IMG-D09 | **Name on report** | Patient check (S-RX-03 Sheet M) | Review-required |
| IMG-D10 | Age and sex as printed | Never overwrites the profile | Optional |
| IMG-D11 | Referred by | As printed | Optional |
| IMG-D12 | Reported by (doctor) and qualification as printed | As printed; no verification of credentials | Optional |
| IMG-D13 | Report ID / accession number | Used for duplicates | Optional |

### 3.2 Report content (kept as text blocks, verbatim)
| ID | Block | Notes | Tier |
|---|---|---|---|
| IMG-C01 | Clinical history / reason for the test | As printed | Optional |
| IMG-C02 | Technique | As printed | Optional |
| IMG-C03 | **Findings** | Verbatim; long | Optional review (does not block Verified; original always available) |
| IMG-C04 | **Impression / Conclusion** | Verbatim; the reporting doctor’s summary | **Review-required** |
| IMG-C05 | Recommendations as printed | e.g. "Follow-up MRI in 6 months"; each becomes a candidate (§7.3) | Review-required if present |
| IMG-C06 | Comparison with earlier studies, as printed | Text only (§8) | Optional |
| IMG-C07 | Numbers printed inside the text | e.g. "EF 55%", "8 mm nodule", "T-score −2.6": kept inside the text; **not** turned into measurements in this release (OPEN IMG-OD-03) | Optional |
| IMG-C08 | Pictures inside the report | Key images, ECG strips: kept as part of the original; never analysed | — |

**Date rule (PROPOSED, as DOC-02):** study date → report date → "Date unknown"; never the upload date.

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items | Effect |
|---|---|---|
| Required to save the original | Confirmed type and profile | Save always possible (APPROVED RX-VER-02) |
| Review-required for **Verified** | Test type, name on report, Impression, and — when printed — body part, side, study date, report date, recommendations | Unconfirmed → Partially Verified |
| Optional review | Findings, history, technique, comparison, contrast, doctors, IDs | Confirming is welcome; leaving them does not keep the record pending |
| Not on report | e.g. no side for an ECG, no Impression on a plain ECG printout | Recorded as such; does not block |

**Side and body part safety (PROPOSED):** if left/right or the body part is unclear or differs between the header and the text, the item is "Needs check" and is never auto-filled.

## 5. Interpretation boundary (PROPOSED; follows "no automatic interpretation" and CLR-08 spirit)
- Ayoreni **never** summarises, simplifies, explains or grades a report, and never highlights words as abnormal or serious.
- The Impression is shown as "**Impression, as written by the reporting doctor**"; machine-printed ECG text ("Sinus rhythm", "Abnormal ECG") as "**Printed by the ECG machine**" — both verbatim.
- No AI reading of images (X-ray, ECG strips, scans) of any kind.
- No condition is created from a report; no diagnosis is suggested.
- Disclaimer on the record: "This is your report as written. Ayoreni doesn’t interpret it."
- A future explanation feature, if any, belongs to the assistant phase with its own approval (roadmap D30), not here.

## 6. Text handling (PROPOSED)
- Long findings are kept as paragraphs exactly as printed, with page links; no reflowing that changes meaning.
- Hindi or mixed-language reports: literal text kept (roadmap D12).
- Handwritten additions (common on ECGs and endoscopy reports): always "Needs check", shown with their crop.
- Abbreviations stay as printed; no expansions.

## 7. Downstream use
### 7.1 Timeline
One entry per report: "MRI Lumbar Spine · 12 Oct 2026", status chip, opens the record.

### 7.2 Conditions (APPROVED CLR-04)
The person can link the report to one or more of their **existing** conditions; one original, many links. Ayoreni may suggest a link only when the report names a condition the person **already has** in Medical Conditions (e.g. existing "Back pain" and the report’s indication says "back pain"), as a suggestion to confirm. It never creates a condition (PROPOSED).

### 7.3 Recommendations (PROPOSED)
After saving, a sheet lists the report’s printed recommendations: "The report recommends: ‘Follow-up MRI in 6 months’." **Add to My Plan** (optional date and reminder; one task, deduplicated with existing plans) · **Record Only**. Never shown as booked (APPROVED B2 task dedupe; same pattern as S-RX-04 4C).

### 7.4 Planned tests (as DOC-02 §10.3)
If a planned test matches (e.g. an MRI ordered on an earlier prescription): "Is this the report for your MRI?" **Yes, Link Report** marks the plan done; **No** changes nothing.

### 7.5 Health Measurements
Nothing from imaging reports goes to Health Measurements in this release (IMG-OD-03).

## 8. Duplicates and versions (PROPOSED, extends B2 and CLR-07)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet (locked) |
| Same centre + report ID, or same test type + body part + study date | S-RX-03 look-alike sheet |
| **Addendum or revised report** | "It’s an Updated Copy": saved as a linked version; both kept; the newest shown first with "Revised report" label |
| Report mentions an earlier study ("compared with 2024 MRI") | Text only; the person may link the earlier report themselves; no automatic link |
| Same test type and body part on different dates | Not duplicates; separate reports |

## 9. Privacy and sensitive reports (OPEN IMG-OD-05)
Same mechanism as DOC-02 LAB-OD-06: certain reports (e.g. pregnancy and fertility ultrasounds) hidden in previews and lists by default ("Sensitive report · tap to view"), excluded from notifications and from the doctor PDF unless included. List needs legal review. Notifications never name a test, body part or finding.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03:** currently basic details for DOC-03. Approving this draft leads to **S-RX-03 v1.2** (imaging review in view 3C), a change to a locked screen needing its own approval (OPEN IMG-OD-01). Outline: Report details group (Confirm Details) · **Impression** block shown first, verbatim, with **Confirm Text** · **Findings** collapsed, verbatim, optional confirm · Recommendations as items · Save Record / Save & Verify Later.
- **S-RX-04:** bypassed.
- **After save:** the recommendations sheet (§7.3) and planned-test link (§7.4), then S-RX-05 (lines inside existing groups).

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| IMG-QA-01 | MRI report PDF, 2 pages | One record; type, body part, study date, Impression extracted with page links |
| IMG-QA-02 | Prescription ordering an MRI | Stays a prescription; no report created |
| IMG-QA-03 | Report says "Left knee" in header, "right" in findings | Side marked Needs check; never auto-chosen |
| IMG-QA-04 | Impression confirmed, findings not | Can be Verified (findings optional) |
| IMG-QA-05 | Impression unreadable | Partially Verified; original available |
| IMG-QA-06 | ECG printout with machine text | Text shown as "Printed by the ECG machine", verbatim; strip kept as image; no analysis |
| IMG-QA-07 | Handwritten note on ECG | Needs check with crop |
| IMG-QA-08 | Echo report "EF 55%" | Stays in text; no measurement created |
| IMG-QA-09 | Recommendation "Follow-up MRI in 6 months" | Offered after save; plan task only on Add to My Plan; no duplicate if already planned |
| IMG-QA-10 | Planned MRI from an earlier prescription | Link offered; plan done only on Yes |
| IMG-QA-11 | Addendum after the main report | Look-alike sheet; Updated Copy keeps both, labelled Revised |
| IMG-QA-12 | Report names an existing condition | Link suggested to confirm; no condition created |
| IMG-QA-13 | Report names a condition the person doesn’t have | No suggestion; no condition created |
| IMG-QA-14 | No study or report date | "Date unknown" |
| IMG-QA-15 | Sensitive report type | Hidden in previews by default (if IMG-OD-05 approved) |
| IMG-QA-16 | Photo of an X-ray film or a DICOM file | Saved only as a picture of the document; no image reading; DICOM rejected with an explanation (if IMG-OD-04 approved) |
| IMG-QA-17 | Change type from Lab Report to Imaging | Lab reading marked out of date; imaging review starts (CLR-06) |
| IMG-QA-18 | Any screen | No AI summary, explanation or severity label |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| IMG-OD-01 | Update the locked S-RX-03 to v1.2 with the imaging review (§10) | Yes — specify and design it next, once this draft is approved |
| IMG-OD-02 | Findings: required or optional to check | Optional; the Impression is required. Long findings shouldn’t keep a record pending forever |
| IMG-OD-03 | Turn printed numbers (EF, nodule size, T-score) into measurements | Not in this release; keep them in the text. Revisit with a clinician and the trends work (Phase 19) |
| IMG-OD-04 | Image files (DICOM, CDs, films) | Not supported now; photos or PDFs of the written report only, plus pictures printed inside it. DICOM is a separate later scope |
| IMG-OD-05 | Sensitive reports | Same hide-by-default mechanism as lab results; legal review of the list |
| IMG-OD-06 | Condition suggestions | Only to conditions the person already has; never create one |
| IMG-OD-07 | AI summaries or explanations of reports | None now; only via the assistant phase with its own approval |
| IMG-OD-08 | Extra test types (stress test, Holter, EEG, NCV, spirometry, audiometry) in DOC-03 | Yes, as listed in §1 |
