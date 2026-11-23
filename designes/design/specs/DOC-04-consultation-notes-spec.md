# DOC-04 · Doctor Consultation & Clinical Notes — Extraction & Verification Specification v0.1

**Status:** REVIEW DRAFT v0.1 (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-04 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-04: "OPD visit summary, specialist opinion, referral, consultation notes — record clinical encounter information and related links where verified"; CLR-01, 02, 04, 05, 06, 07, 09); Verification & Recovery v1.0 (DOC-04 items: "consultation details, documented observation or advice"); MF-D01–08, B1–B5, RX-MAT-01–20 (for any medicines); locked S-RX-01–05, S-RX-03 v1.1 and v1.2; DOC-02 and DOC-03 v1.0 patterns.
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only; no clinical rule set.

---

## 1. Scope and the prescription boundary
| Document | Category | Status |
|---|---|---|
| OPD visit summary, consultation notes, specialist opinion, second opinion | **DOC-04** | APPROVED |
| Referral letter (doctor to doctor) | **DOC-04** | APPROVED |
| Teleconsultation summary | **DOC-04** if it records the visit; **DOC-01** if it is only a prescription | PROPOSED |
| A page whose main content is medicines to take (an OPD slip / Rx pad), even with a line of diagnosis | **DOC-01 Prescription** | PROPOSED |
| A consultation note that also lists medicines | **DOC-04**; its medicines are extracted and reviewed with the same medicine cards and S-RX-04 reconciliation (as CLR-02 does for discharge summaries) | PROPOSED (DOC04-OD-01) |
| Discharge summary | DOC-05 (CLR-02) | APPROVED |
| Medical/fitness/sick-leave certificate | DOC-09 Other | APPROVED |
| Mixed PDF (notes + lab report) | Split suggestion (CLR-05) | APPROVED |

**How Ayoreni suggests the type (PROPOSED):** if most of the page is medicines with doses, suggest Prescription; if it records the visit (history, examination, assessment), suggest Consultation. The person always confirms (APPROVED Classification §1).

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence · Ayoreni’s reading · patient context · the person’s decisions · system metadata. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Visit details
| ID | Field | Tier |
|---|---|---|
| CON-D01 | **Visit date** (consultation date) | Review-required if present |
| CON-D02 | **Doctor** and specialty as printed | Review-required if present |
| CON-D03 | Clinic / hospital | Review, not blocking |
| CON-D04 | **Name on document** | Review-required (patient check) |
| CON-D05 | Age, sex, registration number of patient as printed | Optional |
| CON-D06 | Visit type as printed (first visit, follow-up, teleconsultation) | Optional |
| CON-D07 | Referral: from whom / to whom, and why | Review-required if present |

**Date rule (PROPOSED, as DOC-02/03):** visit date → document date → "Date unknown"; never the upload date.

### 3.2 Content (verbatim blocks and items)
| ID | Item | Handling | Tier |
|---|---|---|---|
| CON-C01 | Reason for visit / complaints | Verbatim text | Optional |
| CON-C02 | History | Verbatim text | Optional |
| CON-C03 | Examination findings | Verbatim text | Optional |
| CON-C04 | **Vitals written by the doctor** (BP, pulse, weight, temperature, SpO2, sugar) | One row each, value and unit as written; can be added to Health Measurements only by explicit choice (§7.3) | Optional |
| CON-C05 | **Diagnosis / assessment as written** | One item per diagnosis, verbatim; labelled "Written by Dr …" | Review-required if present |
| CON-C06 | **Medicines** | Same medicine cards and rules as a prescription (S-RX-03 v1.0 §6; MF-D01–08) | Review-required if present |
| CON-C07 | **Tests ordered** | Items, as CLR-01: recommendations, never results | Review-required if present |
| CON-C08 | **Follow-up** (date or interval) | Item | Review-required if present |
| CON-C09 | Advice (diet, activity, precautions) | Verbatim text | Optional |
| CON-C10 | Referral details | Item (see CON-D07) | Review-required if present |

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items |
|---|---|
| Required to save the original | Confirmed type and profile (APPROVED RX-VER-02) |
| Review-required for **Verified** | Name on document; and, when present: visit date, doctor, diagnoses, medicines, tests, follow-up, referral |
| Optional | Complaints, history, examination, vitals, advice, IDs |
| Not on document | Recorded as such; does not block |
Medicine eligibility for S-RX-04 follows S-RX-03 v1.0 §11 and RX-VER-03 exactly (APPROVED).

## 5. Interpretation boundary (PROPOSED; as DOC-02/03)
- No summaries, simplifications, explanations or severity labels of the doctor’s notes.
- Diagnoses appear only as **written by the doctor**, labelled with the doctor and date; Ayoreni never adds, infers or renames a diagnosis.
- No automatic conditions (§7.2).
- Vitals are never judged (no "high BP"); shown as written.
- Disclaimer on the record: "These are your doctor’s notes as written. Ayoreni doesn’t interpret them."
- Doctors’ handwriting: unclear words are "Needs check" with their crop; **Unable to Verify** is always available, and a record with unreadable notes can still be saved (APPROVED RX-VER-02).

## 6. Text handling (PROPOSED)
Verbatim paragraphs with page links; abbreviations as written (e.g. "c/o", "k/c/o", "HTN"), never expanded; Hindi or mixed text kept (roadmap D12).

## 7. Downstream use
### 7.1 Timeline
"Visit · Dr. Meera Iyer (Endocrinology) · 12 Oct 2026".

### 7.2 Conditions (PROPOSED; consistent with IMG-OD-06)
Diagnoses written by the doctor can be **linked to conditions the person already has**, offered after saving. Creating a **new** condition from a documented diagnosis is left to the Medical Conditions design (Records; roadmap Phase 20) — not created from this screen (DOC04-OD-03).

### 7.3 Vitals → Health Measurements (PROPOSED)
After saving, if vitals were confirmed: "Add these readings to Health Measurements?" Each row: **Add** / **Skip**. Added readings are labelled "Recorded by Dr. … on 12 Oct", dated at the visit, and link to the note. Nothing is added automatically (DOC04-OD-04).

### 7.4 Medicines
If the note has eligible confirmed medicines: **Save & Continue to Medicines** → S-RX-04 unchanged (all RX-MAT rules apply, including Link Existing when the same medicine is already tracked).

### 7.5 Tests, follow-ups, referrals
Without medicines: the recommendations sheet from S-RX-03 v1.2 §4 (Add to My Plan / Link / Record Only). With medicines: S-RX-04 4C handles them. A referral becomes a plan item "See a cardiologist (referred by Dr. …)" only on Add to My Plan. Never booked.

### 7.6 Same visit, two documents (PROPOSED)
A prescription and a consultation note from the same doctor and date are **different documents**, not duplicates. After saving the second, Ayoreni offers **Link as Same Visit** so they appear together on the timeline; medicines on both are reconciled by S-RX-04 (Link Existing), never doubled.

## 8. Duplicates and versions (PROPOSED)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet |
| Same doctor + same visit date + same content | S-RX-03 look-alike sheet |
| A typed copy of an earlier handwritten note | Updated Copy (linked version) |
| Prescription + consultation note, same visit | Not duplicates; Link as Same Visit (§7.6) |

## 9. Privacy and sensitive visits (OPEN DOC04-OD-05)
Same hide-by-default mechanism as DOC-02/03 for sensitive specialties or content (e.g. psychiatry, de-addiction, sexual health, fertility); list subject to legal review. Notifications never name a doctor, specialty or diagnosis.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03:** currently basic details for DOC-04. Approving this draft leads to **S-RX-03 v1.3** (consultation review in view 3C), needing its own approval (DOC04-OD-02). Outline: Visit details group · Diagnosis items ("Written by the doctor") · Medicines (same cards as v1.0) · Tests, follow-up, referral items · Notes collapsed (complaints, history, examination, advice) · Vitals rows · save buttons as v1.0 §10 (Save & Continue to Medicines when eligible).
- **S-RX-04:** used when there are eligible medicines; unchanged.
- **After save:** recommendations sheet (when no S-RX-04), vitals sheet, condition link, same-visit link — each only if it applies; then S-RX-05 (lines inside existing groups).

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| CON-QA-01 | OPD slip with 3 medicines and one diagnosis line | Suggested as Prescription; person confirms |
| CON-QA-02 | Specialist note with history, exam, assessment and 2 medicines | Suggested as Consultation; medicines reviewed with medicine cards; S-RX-04 offered |
| CON-QA-03 | Note with no medicines, a follow-up in 4 weeks | No medicine step; recommendations sheet after save |
| CON-QA-04 | Diagnosis "k/c/o HTN, T2DM" | Two items as written; no expansion; no condition created |
| CON-QA-05 | Diagnosis matches an existing condition | Link offered after save; only on Link |
| CON-QA-06 | Vitals "BP 150/90, wt 72 kg" | Rows as written; no judgement; added to measurements only on Add, labelled as recorded by the doctor |
| CON-QA-07 | Illegible handwriting | Needs check with crops; Unable to Verify; save works |
| CON-QA-08 | Referral to cardiology | Plan item only on Add to My Plan; never booked |
| CON-QA-09 | Prescription and consult note, same visit | Not a duplicate; Link as Same Visit; medicines not doubled |
| CON-QA-10 | Same medicine already tracked | S-RX-04 offers Link to Existing (RX-MAT-02) |
| CON-QA-11 | Medical certificate uploaded | Suggested as Other Medical Document |
| CON-QA-12 | No visit date | "Date unknown" |
| CON-QA-13 | Sensitive specialty | Hidden in previews by default (if DOC04-OD-05 approved) |
| CON-QA-14 | Any screen | No summary, explanation or severity wording; disclaimer shown |
| CON-QA-15 | Change type Consultation → Prescription | Consultation reading marked out of date; prescription review starts (CLR-06) |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| DOC04-OD-01 | Consultation notes with medicines stay DOC-04, with the medicines reviewed and reconciled like a prescription | Yes (same approach as CLR-02 for discharge summaries) |
| DOC04-OD-02 | Update the locked S-RX-03 to v1.3 with the consultation review | Yes — specify and design it next, once approved |
| DOC04-OD-03 | New conditions from documented diagnoses | Not from this screen; link to existing conditions only; creation handled in the Medical Conditions design |
| DOC04-OD-04 | Doctor-written vitals into Health Measurements | Only by explicit Add per reading, labelled "Recorded by Dr …" |
| DOC04-OD-05 | Sensitive visits | Hide by default, same mechanism; legal review of the list |
| DOC04-OD-06 | Same-visit link between a prescription and a consultation note | Offer it after saving; never merge the documents |
