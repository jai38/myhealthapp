# DOC-09 · Other Medical Document — Extraction & Verification Specification v1.0

**Status:** REVIEW (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-09 of the nine approved document types (the fallback).
**Builds on (APPROVED):** Document Classification v1.0 (DOC-09: "medical certificate, insurance-related medical document, unclassified health document"; "fallback or genuinely other healthcare records; users may correct the classification later"); **CLR-09** ("ask the user to select a category; preserve the original"; "do not create a misleading AI certainty or lose unclassifiable medical evidence"); **CLR-06** (category correction without re-upload; reassess stale extraction and links); **QA-DOC-09** ("blurry unclassifiable photo … can save original without invented data"); Verification & Recovery v1.0 (DOC-09 items: "title, issuer, date and applicable information"); DOC-07 §1 (insurance documents belong here); DOC05-OD-08 (death certificates and birth summaries out of scope); locked S-RX-01–05, S-RX-03 v1.1–v1.7; DOC-02–08 v1.0 patterns.
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only.

---

## 1. Scope
| Document | Category | Status |
|---|---|---|
| Medical certificate (sick leave, fitness, "fit to fly/join") | **DOC-09** | APPROVED |
| Insurance-related medical document (policy/health card, pre-authorization, claim form, settlement or rejection letter) | **DOC-09** | APPROVED |
| Unclassified health document; unreadable or blurry photo the person still wants to keep | **DOC-09** (CLR-09) | APPROVED |
| Disability certificate (e.g. UDID card) | **DOC-09** | PROPOSED |
| Blood group card, medical ID card | **DOC-09** | PROPOSED |
| Diet chart, exercise / physiotherapy sheet, patient information leaflet | **DOC-09** | PROPOSED |
| Consent form, referral letter without clinical notes | **DOC-09** | PROPOSED |
| Death certificate, birth summary | Out of scope for this release (APPROVED DOC05-OD-08) | APPROVED |
| Anything that clearly fits DOC-01–08 | That category; DOC-09 is never chosen to skip a category’s rules (§5) | PROPOSED |

**Subtypes (PROPOSED; internal, as Classification v1.0 "optional internal subtypes"):** Medical certificate · Insurance document · Disability certificate · ID or blood group card · Care instructions · Consent or referral · Unclassified. Shown as a small tag; the person can change it.

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence · Ayoreni’s reading · patient context · the person’s decisions · system metadata. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Details (every DOC-09)
| ID | Field | Handling | Tier |
|---|---|---|---|
| OTH-D01 | **Title** | As printed ("Medical Certificate"); if none, left **empty** for the person to name — never invented (CLR-09) | Review-required |
| OTH-D02 | **Name on document** | As printed | Review-required if present (patient check) |
| OTH-D03 | **Document date** | As printed; unknown stays unknown; never the upload date | Review-required if present |
| OTH-D04 | **Issuer** (doctor, clinic, insurer, authority) | As printed | Review-required if present |
| OTH-D05 | Subtype | Suggested; person confirms or changes | Review, not blocking |
| OTH-D06 | Reference numbers (certificate no., policy no., claim no., UDID no.) | Stored, **masked on screen** with Show (§9) | Optional |

### 3.2 Subtype extras (only when printed)
| Subtype | Extra fields (verbatim) | Tier |
|---|---|---|
| Medical certificate | Period as written ("Rest advised from 24 to 28 Nov 2026"); purpose as written ("for office") | Optional |
| Insurance document | Insurer / TPA name; document kind ("Pre-authorization approved"); amounts as printed (DOC-07 amount rule) | Optional |
| Disability certificate | Validity date as written | Optional |
| ID / blood group card | Blood group as printed | Optional; see §7.3 |
| Care instructions | None — kept as text | — |

### 3.3 Content
Everything else on the page is kept as **text from the document** (collapsed, optional), searchable like other records. Nothing in it becomes structured data: no medicines, results, diagnoses, doses or schedules (PROPOSED, §5).

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items |
|---|---|
| Required to save | Confirmed type and profile (APPROVED RX-VER-02) |
| Review-required for **Verified** | Title; and when printed: name on document, date, issuer |
| Optional | Subtype extras, reference numbers, content text |
An **unreadable** document (QA-DOC-09) can be saved with only a title the person types; it is **Unverified** with "Ayoreni couldn’t read this document" and its fields stay empty (APPROVED "no invented data").

## 5. The fallback must not weaken other rules (PROPOSED; the safety core of this category)
- If Ayoreni’s reading finds content that belongs to another category (medicines with doses, lab values, a discharge summary, a vaccine record, a bill, genetic results), the review shows **"This may be a Prescription"** (or the type found) with **Change Type** · **Keep as Other**. Change Type opens that category’s review without re-upload (APPROVED CLR-06).
- **Keep as Other** keeps the content as text only. No medicines, reminders, results, immunizations, conditions or allergies are created from a DOC-09 record — ever.
- If genetic content is detected, the DOC-08 restriction is applied **before** the person decides, and Keep as Other keeps it restricted (APPROVED CLR-08; DOC-08 §7.2).
- A certificate’s rest period or validity date never creates a reminder or changes Today.
- Disclaimer: "This document is kept as written. Ayoreni doesn’t act on what it says."

## 6. Interpretation boundary (PROPOSED)
- No statements on what a certificate allows (leave, fitness, travel) or whether it is valid or genuine.
- No insurance coverage, eligibility or claim-outcome interpretation; insurer text shown as written.
- No disability percentage interpretation or benefits advice.

## 7. Downstream use
### 7.1 Records
In Records under **Other**, dated by the document date (undated → "Date unknown", sorted by upload time but never labelled with it), with title and subtype tag.

### 7.2 Link to a related record (PROPOSED; DOC09-OD-03)
After saving, offered only when a match exists (same issuer and date, or a claim/policy number found on a saved bill): "Is this related to your hospital stay at Apollo Hospital, 3–7 Nov?" **Link** / **Not the Same** / **Not Now**. Never automatic. Typical: sick-leave certificate ↔ consultation; pre-authorization ↔ hospital stay; settlement letter ↔ bill.

### 7.3 Blood group (PROPOSED; DOC09-OD-04)
If a blood group card is confirmed and the Health Profile has no blood group: "Add blood group B+ to your health profile?" **Add** (labelled "From your blood group card · <issuer>") / **Not Now**. If the profile already has a **different** value: "Your profile says O+. This card says B+." **Keep O+** / **Use B+** / **Decide Later** — nothing changes without a choice.

### 7.4 Changing the type later (APPROVED CLR-06)
From the record: **Change Type** → that category’s review, using the same original; the DOC-09 text is replaced by that category’s reading; history kept.

## 8. Duplicates and versions (PROPOSED)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet |
| Same issuer + reference number, or same title + issuer + date | S-RX-03 look-alike sheet |
| Renewed card or extended certificate | **It’s an Updated Copy**: latest first, earlier kept |

## 9. Privacy (PROPOSED; DOC09-OD-05)
- Reference numbers (policy, claim, certificate, UDID) masked with **Show**. Aadhaar, PAN, bank and card numbers **not extracted** (same as DOC-06/07).
- Disability certificates and insurance rejection letters: OPEN whether hidden by default — legal review list, as DOC-05/06/07.
- Notifications never name the document, issuer or subtype.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03 3B:** unchanged; for an unclassifiable document the existing type picker opens with nothing preselected (APPROVED CLR-09).
- **S-RX-03:** v1.8 "Other" review in view 3C (DOC09-OD-01): Details (title, name, date, issuer, subtype tag) · subtype extras · reference numbers masked · **"This may be a …"** banner when applicable · Text from the document (collapsed). Unreadable variant with an empty title field. Save button **Save Record** (no S-RX-04).
- **After save:** related-record link → blood group; then S-RX-05.
- **S-RX-05:** lines inside existing groups ("Medical certificate saved · Verified", "Linked to your consultation · 20 Nov", "Blood group added to your profile").

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| OTH-QA-01 | Sick-leave certificate | DOC-09 · Medical certificate; period kept as written; no reminder |
| OTH-QA-02 | Blurry unreadable photo | Saved with a typed title only; Unverified; no invented fields (QA-DOC-09) |
| OTH-QA-03 | No title printed | Title empty for the person; never generated |
| OTH-QA-04 | Document with medicines kept as Other | "This may be a Prescription"; Keep as Other → text only; no medicine created |
| OTH-QA-05 | Genetic content found | Restricted before the decision; stays restricted on Keep as Other |
| OTH-QA-06 | Pre-authorization letter | Insurance subtype; policy number masked; no coverage wording |
| OTH-QA-07 | Blood group card, profile empty | Add sheet; added only on Add |
| OTH-QA-08 | Blood group differs from profile | Conflict sheet; no change without a choice |
| OTH-QA-09 | Change Type later to Lab | Lab review from the same original; history kept (CLR-06) |
| OTH-QA-10 | Renewed insurance card | Updated Copy; latest first |
| OTH-QA-11 | Undated document | "Date unknown"; upload date never shown as its date |
| OTH-QA-12 | Any DOC-09 screen | Disclaimer; no validity, eligibility or benefits wording |
| OTH-QA-13 | Lock screen | Generic text only |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| DOC09-OD-01 | Update the locked S-RX-03 to v1.8 with the "Other" review | Yes — specify and design next |
| DOC09-OD-02 | Subtypes | Seven internal subtypes shown as a tag, changeable |
| DOC09-OD-03 | Link to a related record | Only by explicit Link; never automatic |
| DOC09-OD-04 | Blood group card → Health Profile | Only by explicit Add; a different existing value needs a choice |
| DOC09-OD-05 | Reference numbers and sensitive certificates | Masked with Show; IDs not extracted; sensitive list to legal review |
| DOC09-OD-06 | Content that fits another category | "This may be a …" with Change Type / Keep as Other; nothing structured from DOC-09 |
| DOC09-OD-07 | Unreadable documents | Save with a typed title only, Unverified |
| DOC09-OD-08 | Death certificates, birth summaries | Remain out of scope (DOC05-OD-08) |
