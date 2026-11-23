# DOC-06 · Vaccination & Immunization Record — Extraction & Verification Specification v1.0

**Status:** APPROVED v1.0 2026-11-23 (owner: "approve DOC-06 with recommendations"; all PROPOSED items and the recommendations for DOC06-OD-01–07 accepted; sensitive-vaccine list in DOC06-OD-06 still needs legal review before release) (functional specification; no screens, no code) · **Date:** 2026-11-23 · **Category:** DOC-06 of the nine approved document types.
**Builds on (APPROVED):** Document Classification v1.0 (DOC-06: vaccine certificate, immunization card, administration record; "keep administration date, product/details and source"); Verification & Recovery v1.0 (DOC-06 items: "vaccine identity, administration evidence and dates"); **RX-MAT-19 / MAT-AC-19** (order ≠ administration; "Administration Reported" vs "Administration Documented"; an order never enters completed immunization history; scheduling never marks administration); VF-033, MF-QA18; MF-D01–08, B1–B5; locked S-RX-01–05, S-RX-03 v1.1–v1.4, S-RX-04 v1.1; DOC-02–05 v1.0 patterns.
**Labels:** APPROVED · PROPOSED (needs your approval) · OPEN.
**Approval boundary:** product behaviour only; no clinical rule set and no vaccination schedule.

---

## 1. Scope
| Document | Category | Status |
|---|---|---|
| Vaccination certificate (e.g. CoWIN COVID-19 certificate, clinic certificate) | **DOC-06** | APPROVED |
| Immunization card or booklet (child card, MCP card pages, adult card) | **DOC-06** | APPROVED |
| Clinic administration record or receipt-style slip naming the vaccine given | **DOC-06** | APPROVED |
| International travel certificate (ICVP, e.g. yellow fever) | **DOC-06** | PROPOSED |
| Antirabies / anti-tetanus injection record after an injury | **DOC-06** | PROPOSED |
| Prescription that **orders** a vaccine | **DOC-01** Prescription (RX-MAT-19: "Prescribed · not given yet") | APPROVED |
| Vaccine bill or pharmacy invoice | DOC-07 Bills (CLR-05 split if in the same PDF) | APPROVED |
| Antibody / titre lab report (e.g. anti-HBs) | DOC-02 Laboratory | APPROVED |
| Vaccine given during a hospital stay, written in a discharge summary | Stays in the DOC-05 course text; not an immunization entry in this release | PROPOSED (DOC06-OD-07) |

## 2. Five information layers (PROPOSED; as DOC-02 §2)
Source evidence · Ayoreni’s reading · patient context · the person’s decisions · system metadata. None overwrites another.

## 3. Fields (PROPOSED)
### 3.1 Document details
| ID | Field | Tier |
|---|---|---|
| VAC-D01 | **Name on document** (and date of birth / age if printed) | Review-required (patient check) |
| VAC-D02 | Issuer: clinic, hospital, programme or authority, as printed | Review, not blocking |
| VAC-D03 | Document type as printed (certificate, card, record) | Optional |
| VAC-D04 | Certificate / reference ID (e.g. beneficiary reference ID, certificate number) | Optional; used for duplicates; **masked on screen** (§9) |
| VAC-D05 | Government ID printed on it (masked Aadhaar, passport number) | **Not extracted**; stays only in the original image (§9) |

### 3.2 Doses (one item per dose given)
| ID | Field | Handling | Tier |
|---|---|---|---|
| VAC-C01 | **Vaccine as written** (e.g. "Covishield", "Tdap", "Hep B") | Verbatim; `nameAsWritten` kept separate from any normalized name (rule 12) | Review-required |
| VAC-C02 | **Date given** | As printed; partial dates kept partial ("Mar 2019"); never the upload date | Review-required |
| VAC-C03 | **Dose label as written** ("Dose 1", "2nd dose", "Booster", "Precaution dose") | Verbatim; Ayoreni never computes dose numbers | Review-required if present |
| VAC-C04 | Brand / manufacturer | Verbatim | Optional |
| VAC-C05 | Batch / lot number | Verbatim | Optional |
| VAC-C06 | Given by / site of vaccination (vaccinator, centre) | Verbatim | Optional |
| VAC-C07 | Route / body site ("IM, left deltoid") | Verbatim | Optional |
| VAC-C08 | Signature or stamp present | Shown as "Stamp/signature seen on page" only if visible; Ayoreni never authenticates it | Optional |

### 3.3 Other content
| ID | Item | Handling | Tier |
|---|---|---|---|
| VAC-C09 | **Next due date as written** ("Next dose due 12 Jan 2027") | Item, verbatim; offered as an optional reminder after save (§7.3); never computed | Review-required if present |
| VAC-C10 | Reactions noted on the card ("fever after dose 2") | Item, verbatim, labelled with the source; addable to the person’s reactions only by explicit choice (§7.4) | Review-required if present |
| VAC-C11 | Blank or unticked rows on a printed schedule card | **Not doses.** Ignored as doses; shown as "Not filled in on the card" only if the person opens the card view | — |
| VAC-C12 | Notes / remarks | Verbatim text | Optional |

**Printed schedule cards (PROPOSED; safety core):** child and MCP cards print the whole national schedule. Only rows with a **date or tick and a mark of administration** become dose items. A printed vaccine name with an empty date is never a dose given. A tick without a date becomes a dose item flagged **"Date not written"** (rule 13).

## 4. What must be checked (PROPOSED, extends RX-VER-01)
| Tier | Items |
|---|---|
| Required to save | Confirmed type and profile (APPROVED RX-VER-02) |
| Review-required for **Verified** | Name on document; each dose’s vaccine and date; dose labels and next-due dates and noted reactions when present |
| Optional | Issuer, brand, batch, given by, route/site, remarks, IDs |
Each dose has its own Confirm · Unable to Verify (APPROVED RX-VER-04). Verified / Partially Verified / Unverified as everywhere (APPROVED).

## 5. Administration evidence (PROPOSED; the safety core of this category)
| Source | Label on the immunization entry | Rule |
|---|---|---|
| Vaccine **ordered** on a prescription | **Prescribed · not given yet** | APPROVED RX-MAT-19; never enters immunization history |
| Dose on a vaccination record, confirmed by the person | **Administration documented · <issuer>, <date>** | This category; "documented" means a document says it, not that Ayoreni authenticated it (MAT-AC-19) |
| Person says they had it, without a document | **Administration reported · by you** | Belongs to the later Immunizations screen; not created from this flow |
| Dose marked **Unable to Verify** | Kept on the record with that status; shown in history as "Not verified" | Never upgraded automatically |

- A documented dose **can be linked** to an earlier "Prescribed · not given yet" order for the same vaccine, only by explicit choice after save (§7.2). The order is never auto-closed on name match.
- Vaccines are **not medicines to track**: no S-RX-04, no dose schedule, no Taken (APPROVED RX-MAT-19, rule 14).
- No completeness claims: Ayoreni never says "fully vaccinated", "up to date", "overdue" or "missed" (rule 15 principle).

## 6. Interpretation boundary (PROPOSED; as DOC-02–05)
- No schedule logic: no "next dose due" unless printed; no catch-up suggestions; no age-based advice.
- No validity, travel-eligibility or protection statements; QR codes are not read or verified in this release (DOC06-OD-05).
- Disclaimer: "This is your vaccination record as written. Ayoreni doesn’t check it against any schedule."

## 7. Downstream use
### 7.1 Timeline and Immunizations
Each confirmed dose: a timeline entry on its date ("Vaccination · Covishield · Dose 2 · 14 Jun 2021"). A dose without a date is listed under the document, not placed on the timeline. The Immunizations list itself is a later design (Profile / Records); this spec only defines the data it receives.

### 7.2 Link to a prescribed vaccine (PROPOSED; DOC06-OD-02)
After saving, if the person has a "Prescribed · not given yet" order whose written vaccine name matches a confirmed dose: "Is this the vaccine Dr. Rao prescribed on 2 Nov?" **Link** / **Not the Same** / **Not Now**. Link marks the order "Given · documented on <date>"; nothing else changes. Several possible orders → a list; never matched automatically.

### 7.3 Next due date (PROPOSED; DOC06-OD-03)
After saving, a printed next-due date: "The card says the next dose is due 12 Jan 2027. Add a reminder?" **Add Reminder** / **Not Now**. Same pattern as the recommendations sheet (S-RX-03 v1.2 §4): unticked, generic lock-screen text ("You have a health reminder"), and a reminder **never** records a dose.

### 7.4 Reactions noted (PROPOSED; DOC06-OD-04)
"The card notes ‘fever after dose 2’. Add it to your reactions?" **Add** (labelled "Documented on <issuer> card") / **Not Now**. Same pattern as DOC-05 allergies; an existing entry is linked, not duplicated.

### 7.5 Family members
A child’s card uploaded to the parent’s profile is caught by the existing name check and "Not your document?" flow (APPROVED S-RX-03); it is saved to the right profile, never merged.

## 8. Duplicates and versions (PROPOSED)
| Signal | Behaviour |
|---|---|
| Same file | S-RX-02 exact-copy sheet |
| Same certificate ID, or same vaccine + date + name | S-RX-03 look-alike sheet |
| Provisional then final certificate (e.g. after dose 2) | **It’s an Updated Copy**: final first, earlier kept |
| New photo of the same card with more doses filled in | **It’s an Updated Copy**; doses already confirmed from the older photo are matched by vaccine + date and **not duplicated**; only new rows need checking |
| Same dose on a certificate and on a card | Two sources for one dose: shown once, both documents listed under it (by explicit "Same Dose" in the look-alike sheet) |

## 9. Privacy (PROPOSED; DOC06-OD-06)
- Government IDs (Aadhaar, passport) are **not extracted**; they stay only in the original image, which is already private and reached only through short-lived signed URLs (rules 5–6).
- Certificate / reference IDs are masked on screen ("•••• 4821") with **Show**.
- Vaccines are not hidden by default. OPEN: whether some (e.g. HPV, post-exposure rabies, HIV-related) need the sensitive mechanism — legal review, same as DOC-05.
- Notifications never name a vaccine.

## 10. Impact on locked screens
- **S-RX-01, S-RX-02:** unchanged.
- **S-RX-03:** v1.5 vaccination review in view 3C (DOC06-OD-01): Document details · **Doses** (one card per dose: vaccine as written, date, dose label, batch) · Next due (as written) · Reactions noted · Notes collapsed. Save button **Save Record** (no S-RX-04).
- **S-RX-04:** not used for DOC-06.
- **After save:** prescribed-vaccine link → next-due reminder → reactions; then S-RX-05.
- **S-RX-05:** lines inside existing groups ("Vaccination record saved · Verified · 3 doses", "Linked to Dr. Rao’s prescription · Hep B", "Reminder set · 12 Jan 2027").

## 11. QA scenarios (PROPOSED)
| ID | Scenario | Pass condition |
|---|---|---|
| VAC-QA-01 | CoWIN certificate with 2 doses | Stays DOC-06; two dose items with dates; IDs masked; Aadhaar not extracted |
| VAC-QA-02 | Child card with printed schedule, 6 rows filled | Six dose items only; empty rows are not doses |
| VAC-QA-03 | Row ticked without a date | Dose item flagged "Date not written"; not placed on the timeline |
| VAC-QA-04 | Prescription orders Hep B; later the card shows Hep B given | Order stays "not given yet" until the person taps Link |
| VAC-QA-05 | Card prints "next due 12 Jan 2027" | Reminder offered, unticked; reminder never records a dose |
| VAC-QA-06 | No next-due date printed | No reminder offered; nothing computed |
| VAC-QA-07 | Same card photographed again with one new dose | Updated Copy; only the new dose to check; no duplicate doses |
| VAC-QA-08 | Child’s card uploaded on the parent’s profile | Name check → Not your document flow |
| VAC-QA-09 | "Fever after dose 2" written | Reactions sheet; added only on Add |
| VAC-QA-10 | Any screen | No "up to date", "overdue", "fully vaccinated"; disclaimer shown |
| VAC-QA-11 | Dose marked Unable to Verify | Shown as "Not verified"; never treated as documented |
| VAC-QA-12 | Vaccine given in hospital, only in a discharge summary | Stays in DOC-05 course text |
| VAC-QA-13 | Lock screen | Generic text only |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| DOC06-OD-01 | Update the locked S-RX-03 to v1.5 with the vaccination review | Yes — specify and design next |
| DOC06-OD-02 | Link a documented dose to a "Prescribed · not given yet" order | Only by explicit Link; never matched automatically |
| DOC06-OD-03 | Printed next-due date → reminder | Offer after save, unticked; never computed by Ayoreni |
| DOC06-OD-04 | Reactions noted on the card → the person’s reactions | Only by explicit Add, labelled with the source |
| DOC06-OD-05 | Read or verify certificate QR codes | Not in this release; no validity claims |
| DOC06-OD-06 | Government IDs on certificates | Not extracted; certificate IDs masked with Show; sensitive-vaccine list to legal review |
| DOC06-OD-07 | Vaccines mentioned only in discharge summaries or consultation notes | Stay as text in those records in this release |
