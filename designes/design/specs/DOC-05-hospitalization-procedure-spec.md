# DOC-05 · Hospitalization & Procedure Records — Extraction & Verification Specification v1.0

**Status:** APPROVED v1.0 2026-11-23 (owner: "approve DOC-05 with recommendations"; all PROPOSED items and the recommendations for DOC05-OD-01–08 accepted; legal review in DOC05-OD-05 still required before release) (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-05 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-05: discharge summary, admission summary, surgery/procedure note, hospital records; "can contain medicines, investigations, diagnoses and recommended follow-ups"; CLR-02; QA-DOC-02 "no course or reminder auto-activates"); Verification & Recovery v1.0 (DOC-05 items: "admission/discharge details, procedure, discharge instructions"); MF-D01–08, B1–B5, RX-MAT-01–20 (esp. 04, 05, 07, 08, 09, 10, 13, 14, 18); locked S-RX-01–05 and S-RX-03 v1.1–v1.3; DOC-02/03/04 v1.0 patterns.
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only; no clinical rule set.

---

## 1. Scope
| Document | Category | Status |
|---|---|---|
| Discharge summary (final or interim), admission summary, transfer summary | **DOC-05** | APPROVED |
| Operation / procedure note, anaesthesia record | **DOC-05** | APPROVED |
| Day-care procedure summary (e.g. chemotherapy session, dialysis, cataract surgery) | **DOC-05** | PROPOSED |
| Implant card or record (stent, joint, lens, pacemaker) | **DOC-05** | PROPOSED |
| Emergency department visit summary without admission | **DOC-04** Consultation | PROPOSED |
| Lab reports or scan reports done during the stay, uploaded separately | DOC-02 / DOC-03, linkable to the stay (§7.6) | APPROVED categories; link PROPOSED |
| Hospital bill | DOC-07 (CLR-05 split if in the same PDF) | APPROVED |
| Death certificate, birth summary | Out of scope for this release | OPEN DOC05-OD-08 |

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence · Ayoreni’s reading · patient context · the person’s decisions · system metadata. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Stay details
| ID | Field | Tier |
|---|---|---|
| HOS-D01 | **Hospital** and department/unit | Review-required if present |
| HOS-D02 | **Admission date** | Review-required if present |
| HOS-D03 | **Discharge date** (or "interim" if the summary says so) | Review-required if present |
| HOS-D04 | Treating doctor(s) as printed | Review, not blocking |
| HOS-D05 | **Name on document** | Review-required (patient check) |
| HOS-D06 | Inpatient (IP) / UHID number | Optional; used for duplicates |
| HOS-D07 | Summary type as printed (discharge, interim, transfer, operation note) | Optional |
| HOS-D08 | Condition at discharge, as written | Optional |

**Date rule (PROPOSED):** the timeline shows a **stay** ("Hospital stay · 3–7 Nov 2026"); procedures are dated on their own day; unknown stays unknown; never the upload date.

### 3.2 Content
| ID | Item | Handling | Tier |
|---|---|---|---|
| HOS-C01 | **Diagnoses as written** (final / provisional / secondary as labelled) | Items, verbatim, labelled with the hospital and date; "provisional" kept | Review-required if present |
| HOS-C02 | **Procedures / surgeries** | One item each: name as written, date, surgeon | Review-required if present |
| HOS-C03 | Course in hospital | Verbatim text | Optional |
| HOS-C04 | Investigations summary (lab values, scan results quoted in the summary) | Kept as text in this release (DOC05-OD-04) | Optional |
| HOS-C05 | **Discharge medicines** | Same medicine cards and rules as a prescription (S-RX-03 v1.0 §6; MF-D01–08) | Review-required if present |
| HOS-C06 | **Medicine instructions that change existing treatment** ("Stop Aspirin", "Hold Metformin until review", "Continue other medicines") | One item each, verbatim; never applied automatically (§5) | Review-required if present |
| HOS-C07 | **Allergies or reactions documented during the stay** | Items, verbatim, labelled "Documented by <hospital>" | Review-required if present |
| HOS-C08 | Advice (diet, activity, wound care) | Verbatim text | Optional |
| HOS-C09 | **Warning signs to return** ("Come back if fever, bleeding…") | Verbatim text, shown in its own card on the record as printed; no alerts by Ayoreni | Optional |
| HOS-C10 | **Follow-up** (date, doctor, tests) | Items | Review-required if present |
| HOS-C11 | Implant details (type, brand, size, serial/lot) | Items, verbatim | Optional |
| HOS-C12 | Operation note details (anaesthesia, findings, technique) | Verbatim text | Optional |

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items |
|---|---|
| Required to save | Confirmed type and profile (APPROVED RX-VER-02) |
| Review-required for **Verified** | Name on document; when present: hospital, admission and discharge dates, diagnoses, procedures, discharge medicines, change instructions, allergies, follow-ups |
| Optional | Course, investigations text, advice, warning signs, implants, operation details, IDs |
Medicine eligibility for S-RX-04 follows S-RX-03 v1.0 §11 and RX-VER-03 exactly.

## 5. Discharge medicines and change instructions (PROPOSED; the safety core of this category)
- **Discharge medicines** go to S-RX-04 like any prescription: new ones need Track New; ones already tracked get Link Existing or Review Change; **nothing starts automatically** (APPROVED QA-DOC-02, B3, B4).
- **Explicit change instructions** ("Stop X", "Hold X until review", "Reduce X to …") are extracted as their own items. In S-RX-04 they appear on the existing medicine’s card with a new label **"Summary says stop"** / **"Summary says hold"** and the actions **Keep Existing · Review Stop (or Review Pause) · Record Only · Decide Later**. Stopping or pausing happens only through the existing lifecycle step with the person’s explicit confirmation and an effective date; history is kept (APPROVED RX-MAT-18 lifecycle path, B4). This is a small addition to the locked S-RX-04 (DOC05-OD-02).
- **"Continue other medicines"** or a medicine simply not listed: nothing changes; the S-RX-04 footer already says "Medicines that aren’t on this summary stay as they are" (APPROVED RX-MAT-18).
- **Medicines given only in hospital** (IV antibiotics, injections during the stay) are part of the course text, not discharge medicines, and never become tracking (APPROVED RX-MAT-19 principle).
- **Older summary** (an earlier admission): RX-MAT-10 applies — saved as history, current tracking unchanged.

## 6. Interpretation boundary (PROPOSED; as DOC-02/03/04)
- No summaries, explanations, severity labels or "what happened" retelling of the stay.
- Diagnoses only as written, with "provisional" or "final" kept as written; no new conditions from this screen (links only to existing conditions).
- Warning signs shown verbatim as the hospital wrote them; Ayoreni adds no alerts or advice.
- Disclaimer: "This is your hospital’s summary as written. Ayoreni doesn’t interpret it."

## 7. Downstream use
### 7.1 Timeline
A stay entry ("Hospital stay · Apollo Hospital · 3–7 Nov 2026") and procedure entries on their dates.

### 7.2 Conditions
Diagnoses can be linked to **existing** conditions after saving (as DOC-04 §7.2); creation belongs to the Medical Conditions design.

### 7.3 Allergies (PROPOSED; DOC05-OD-03)
After saving, documented allergies: "The hospital recorded an allergy to Penicillin. Add it to your allergies?" **Add** (labelled "Documented by <hospital>, 5 Nov 2026") / **Not Now**. Never added automatically; an existing allergy is linked, not duplicated. (Allergies are a record only until Phase 16, per the roadmap.)

### 7.4 Follow-ups and tests
Through S-RX-04 4C when medicines exist, otherwise the recommendations sheet (S-RX-03 v1.2 §4). Never booked.

### 7.5 Implants (PROPOSED; DOC05-OD-06)
Kept on the record as items; later surfaced on the Emergency Health Card design (roadmap Phase 17), not now.

### 7.6 Same stay (PROPOSED)
Operation notes, lab and scan reports dated within the stay can be linked to it: after saving, "Link to your hospital stay 3–7 Nov?" **Link** / **Not Now**. Documents stay separate; no merging (as DOC-04 same-visit).

## 8. Duplicates and versions (PROPOSED)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet |
| Same hospital + IP number + discharge date | S-RX-03 look-alike sheet |
| Interim summary, then final summary | **It’s an Updated Copy**: final shown first, interim kept, labelled |
| Summary and bill in one PDF | CLR-05 split |
| Lab values in the summary and the same lab report uploaded | Not duplicates (values here are text only in this release) |

## 9. Privacy and sensitive stays (OPEN DOC05-OD-05)
Same hide-by-default mechanism for sensitive admissions (e.g. psychiatric, de-addiction, pregnancy-related procedures); list subject to legal review. Notifications never name a hospital, diagnosis or procedure.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03:** v1.4 hospital review in view 3C (DOC05-OD-01): Stay details · Diagnoses · Procedures · Discharge medicines (medicine cards) · **Medicine changes** (stop/hold items) · Allergies documented · Follow-ups · Warning signs (verbatim card) · Notes collapsed (course, investigations, advice, operation details, implants).
- **S-RX-04:** v1.1 adds the "Summary says stop / hold" label and actions on existing medicine cards (DOC05-OD-02). Everything else unchanged.
- **After save:** allergies sheet, condition link, same-stay link, recommendations (if no S-RX-04); then S-RX-05.

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| HOS-QA-01 | Discharge summary with diagnoses and 4 new medicines | Stays DOC-05 (CLR-02); medicines reviewed; no tracking until chosen (QA-DOC-02) |
| HOS-QA-02 | "Stop Aspirin" with Aspirin tracked | Card shows "Summary says stop"; nothing stops until Review Stop is confirmed with a date |
| HOS-QA-03 | "Continue other medicines" | No change to anything; no prompts |
| HOS-QA-04 | Tracked medicine not mentioned | Stays active (RX-MAT-18) |
| HOS-QA-05 | IV antibiotics given during the stay | Course text only; no tracking |
| HOS-QA-06 | Allergy documented | Allergies sheet after save; added only on Add; no duplicate of an existing allergy |
| HOS-QA-07 | Provisional diagnosis | Kept with "provisional" as written |
| HOS-QA-08 | Two procedures on different days | Two procedure items, each dated |
| HOS-QA-09 | Interim then final summary | Updated Copy; final first, interim kept |
| HOS-QA-10 | Lab report from the stay uploaded later | Same-stay link offered; documents separate |
| HOS-QA-11 | Warning signs printed | Shown verbatim in their card; no Ayoreni alert |
| HOS-QA-12 | Summary from 2023 uploaded now | History only; current tracking unchanged (RX-MAT-10) |
| HOS-QA-13 | Implant serial number | Item on the record, verbatim |
| HOS-QA-14 | No discharge date | Stay shown "Admitted 3 Nov 2026 · discharge date unknown" |
| HOS-QA-15 | Sensitive admission | Hidden in previews (if DOC05-OD-05 approved) |
| HOS-QA-16 | Any screen | No summary or severity wording; disclaimer shown |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| DOC05-OD-01 | Update the locked S-RX-03 to v1.4 with the hospital review | Yes — specify and design next |
| DOC05-OD-02 | Update the locked S-RX-04 to v1.1 with "Summary says stop / hold" (Keep Existing · Review Stop/Pause · Record Only · Decide Later) | Yes — stops happen only through the existing lifecycle step, confirmed by the person |
| DOC05-OD-03 | Allergies documented in hospital → the person’s allergy list | Only by explicit Add, labelled with the hospital and date |
| DOC05-OD-04 | Lab values quoted in the summary | Text only for now; the separate lab report is the source for measurements |
| DOC05-OD-05 | Sensitive stays | Hide by default, same mechanism; legal review of the list |
| DOC05-OD-06 | Implant details | Kept as items on the record; surfaced on the Emergency Health Card later |
| DOC05-OD-07 | Same-stay link for other documents | Offer after saving; never merge |
| DOC05-OD-08 | Death certificates and birth summaries | Out of scope for this release |
