# S-RX-03 · Confirm Classification & Verify Information — functional specification

**Status:** APPROVED 2026-11-22 (owner: "approve S-RX-03 with recommendations"; all PROPOSED items and OPEN-1–6 recommendations accepted) · design APPROVED 2026-11-22 (canvas boards R03, R03 States A and B) · LOCKED · **Date:** 2026-11-22 · **Stage:** 3 of 5 (S-RX-01 → S-RX-02 → **S-RX-03** → S-RX-04 → S-RX-05). This is the record-save boundary.
**Sources:** Continuation brief §4–§8; Document Classification v1.0 (§1–§6, CLR-01–09); Medication Reconciliation v1.0 §3–§6, RX-MAT-10/12/17, §11 (RX-OD-02/03/09/10/13); Verification & Recovery v1.0 §2–§5, RX-VER-01/02/03/05/06/12; v0.3 workflow review §5 and v0.2 field review §4–§5 (reference only); v0.1 draft §6 (reference only). Locked: S-RX-01, S-RX-02, visual baseline `8c62eb0`.
**Labels:** APPROVED · DECIDED · PROPOSED (needs approval) · OPEN.

## 1. Purpose
Turn the uploaded pages into a saved, honest record:
1. the person **confirms the document type** Ayoreni suggests (mandatory, first);
2. the person **checks what Ayoreni read**, item by item against the original, and confirms, corrects or marks what can’t be verified;
3. a **look-alike duplicate check** runs before the record is created;
4. the record is **saved** — original plus transcription with its verification status — and the person chooses **Save & Continue to Medicines** or **Save Record Only**.

Confirming the type is not checking the content; checking the content is not clinical validation; saving is not starting any medicine or reminder (APPROVED).

## 2. Entry and exit
| From / to | Behaviour | Status |
|---|---|---|
| S-RX-02 → Continue (no exact copy, or "Save as a Separate Record") | Opens **3A Reading** | APPROVED |
| Document details / Pending Verification / Records to Review → **Continue Verification** | Opens **3C Check what we read** on the saved record, showing only outstanding or affected items; confirmed items stay confirmed | APPROVED (RX-VER-05, RX-VER-13) |
| Save & Continue to Medicines | Saves, then opens S-RX-04 with the same saved record | APPROVED |
| Save Record Only / Save & Verify Later / Save Record (other types) | Saves, then opens S-RX-05 | APPROVED |
| Back before saving | Sheet: **Save and Check Later** / **Discard Document** / **Keep Reviewing** | PROPOSED |

## 3. Views and sheets in this stage
S-RX-03 is one stage with three views and five sheets (PROPOSED structure; v0.3 allowed panels within one step).

| ID | View / sheet | When |
|---|---|---|
| 3A | Reading your document | While Ayoreni reads and suggests a type |
| 3B | Confirm document type | Always, before any content review (APPROVED order) |
| 3C | Check what we read | After the type is confirmed |
| Sheet T | Choose document type | "Change Type", or when Ayoreni can’t tell |
| Sheet I | Check one item | Tapping a medicine, test, follow-up or detail |
| Sheet D | Possible duplicate | Look-alike match found before saving |
| Sheet P | Some details aren’t checked yet | Saving with unresolved items |
| Sheet M | Not your document? | The name on the document clearly differs from the profile |

## 4. View 3A — Reading your document
- **Content:** page thumbnail; "Reading your document…"; "This usually takes under a minute, but it can take a few minutes." Progress dots (no percentage, no fake precision).
- **Actions:**
  - **Save and Check Later** (secondary): opens Sheet T to pick the type now, saves the original as **Unverified**, and lets reading finish in the background. The record then appears in Records → Documents → Pending Verification and in Today’s Records to Review. (PROPOSED; matches APPROVED RX-VER-02, RX-VER-12, D-RX-2.)
  - Nothing else is needed: when reading finishes, 3B opens by itself.
- **Reading failed:** "We couldn’t read this document" / "You can still save the original and add details yourself later." **Try Again** · **Save Without Reading** (Sheet T, then saved as Unverified). Nothing is invented (APPROVED RX-VER-02, MF-D07).
- **Offline:** "Waiting for connection. Reading starts when you’re back online." Same two actions; saving needs a connection and says so honestly (APPROVED RX-VER-12 rule 5).

## 5. View 3B — Confirm document type (mandatory, first)
- **Title:** "What kind of document is this?"
- **Suggestion card:** the page thumbnail and the suggested type with its icon, labelled **"Suggested by Ayoreni"**. For a prescription, a one-line hint of what was found ("2 medicines and 1 follow-up found") — shown as what was read, not as fact.
- **Actions:** **Confirm Type** (primary) · **Change Type** (opens Sheet T).
- **Can’t tell (CLR-09):** no preselection; card reads "We couldn’t tell what kind of document this is. Please choose one." with the nine options shown directly.
- **Mixed file (CLR-05):** when pages look like different documents: "This file may contain 2 documents" with page ranges and a type for each (e.g. pages 1–2 Prescription, page 3 Medical Bill). **Save as 2 Records** / **Keep as 1 Record**. The original upload is kept whole either way; each record links to its pages.
- **Genetic report (CLR-08):** after confirming: note "Genetic reports are kept private by default. Ayoreni doesn’t interpret genetic results." No content reading; only basic details (§7).
- **Changing type later (CLR-06):** if the type is changed after content was read, the old reading is marked out of date and the review for the new type starts; nothing is reused silently.
- No timeout or inactivity counts as confirmation (APPROVED Classification §5).

### Sheet T — Choose document type
The nine approved categories as a single list with icon and a short example each: Prescription · Laboratory Report · Imaging & Diagnostic Report · Doctor Consultation & Clinical Notes · Hospitalization & Procedure Records · Vaccination & Immunization Record · Medical Bills & Receipts · Genetic & Genomic Report · Other Medical Document. The suggested one is marked "Suggested", not preselected-and-hidden.

## 6. View 3C — Check what we read (Prescription)
**Header:** "Check what we read" / "Compare with your prescription and confirm each item. You can save now and finish later."
**Progress line:** e.g. "2 of 4 items checked · 1 needs attention" (counts items, not fields).
**Original:** a **View Original** button (full pages) is always available; each item also shows its own source crop.

**Groups (progressive disclosure; essentials first — MF-D03):**
| Group | Shown on the card | Confirm style |
|---|---|---|
| Document details | Name on document; document date (shown separately from the upload date; "No date found" if absent); doctor; clinic | One **Confirm Details** for the group, with any unclear field flagged individually (PROPOSED, RX-OD-02) |
| Medicines | One card per medicine: name as written, strength/form if read, dose and how often, source page; small context badges where relevant: "Already in your medicines", "Reaction recorded" (information only; decisions happen in S-RX-04 — APPROVED MF-D08) | Each medicine confirmed individually (PROPOSED; no "confirm all" for medicines) |
| Tests & follow-ups | Each recommended test or follow-up with its timing as written | Individually; a recommendation is never shown as done or booked (APPROVED CLR-01, RX-MAT-17) |
| Diagnoses & notes | Diagnoses as written on the document; other notes | Individually; no diagnosis is suggested by Ayoreni (APPROVED) |

**Card status chips (icon + word):** Needs check · Confirmed · Edited · Unable to Verify · Not on document.

**No medicines (RX-MAT-17):**
- Confirmed none: Medicines group reads "No medicines on this prescription" with **That’s right** / **There are medicines** (opens add-item).
- Unreadable: "We couldn’t read the medicines section" — **never** "No medicines". Offers Unable to Verify or adding them by hand from the original.

**Add a missing item:** "+ Add an item we missed" per group; the person types it from the original; marked as added by the person.

### Sheet I — Check one item (e.g. a medicine)
1. **Source crop** at the top: the exact part of the page, zoomable, with page number.
2. **As written:** the literal wording, read-only.
3. **Fields** (essentials first; MF-D03): Medicine name · Strength · Form · Amount each time (number + unit, kept separate from strength) · How often · When (e.g. after food) · For how long. **More details** (expands automatically if anything there is unclear): Route · Other instructions · Start / end dates · As-needed details.
4. Each field shows where its value came from: **Read by Ayoreni**, **Edited by you**, **Unable to Verify**, or **Not on the prescription**. Unclear fields are highlighted with "We couldn’t read this clearly" and the crop around that word. No confidence percentages (PROPOSED, v0.1 §6).
5. **Actions:** **Confirm** (primary; confirms what is shown) · **Unable to Verify** (keeps it unresolved for later) · **Remove from this record** (for a line Ayoreni read by mistake; the original is untouched).
6. Never: guess a missing value, expand an abbreviation such as "1-0-1" without the person confirming its meaning, convert units, or treat strength as the amount taken (APPROVED MF-D07, RX-MAT-12).

## 7. View 3C for the other eight types (this release)
Detailed reading for Laboratory Report and the other categories is a separate, later specification (APPROVED scope; VER-OD-09). Until then, after the type is confirmed:
- **Basic details** to confirm or fill: Title (e.g. "Blood test"), Document date (or "No date"), Provider (optional), Notes (optional).
- **Save Record** (single primary action).
- Status: **Verified** once the basic details are confirmed, because they are all the review that applies for that type today; **Unverified** if saved without confirming them (PROPOSED reading of RX-VER-01; OPEN-1).
- Medical Bills & Receipts: a note "A bill shows a charge, not that a treatment was given or taken." (APPROVED Classification §2).

## 8. Patient check
- The profile is the signed-in person (DECIDED D-RX-1). The name read from the document is shown in Document details for confirmation.
- **Sheet M** (PROPOSED): when that name clearly differs from the profile name: "This may be someone else’s document" / "It shows ‘R. Mehta’. For now you can only save your own documents." **It’s Mine** (name was misread or is a nickname; saved with a note) · **Not Mine** (discard; nothing saved). Nothing is linked to another person (APPROVED RX-OD-10).

## 9. Look-alike duplicate check (before saving)
- Runs when Save is tapped, using what was read (document date, doctor, medicines, text) against this person’s saved documents (APPROVED B1 second check, B2).
- **Sheet D:** "This looks like a document you’ve already saved" with both thumbnails side by side and their dates, doctor and page count.
  - **Open Saved Record** (primary) — nothing new is created.
  - **It’s an Updated Copy** — saved as a new version linked to the earlier record (e.g. a stamped or annotated copy).
  - **It’s a Different Document** — saved as a separate record.
- A shared medicine alone never makes two documents duplicates (APPROVED).

## 10. Saving (the record commit)
**Buttons (pinned bottom; PROPOSED labels from the brief):**
| Situation | Primary | Secondary |
|---|---|---|
| Prescription with at least one confirmed medicine that is eligible (§11) | **Save & Continue to Medicines** | **Save Record Only** |
| Prescription with no eligible medicines but confirmed tests or follow-ups | **Save & Review Follow-ups** | **Save Record Only** |
| Prescription with nothing confirmed yet | **Save & Verify Later** | **Keep Checking** (scrolls to the first item) |
| Other types | **Save Record** | — |

**Sheet P — Some details aren’t checked yet** (when items are unresolved): summary "3 of 4 medicines confirmed · 1 detail Unable to Verify", listing what is pending.
- **Continue with 3 Confirmed Medicines** (only if they are eligible) · **Save & Verify Later** · **Keep Checking**.
- Saying no to a reminder never blocks saving; the optional verification reminder is offered on S-RX-05 (APPROVED RX-VER-12, RX-VER-14).

**What saving does (APPROVED B1, RX-VER-02):**
- Creates one canonical record for this person: the original pages, the confirmed type (with who/when), the document date separate from the upload date, and the transcription with each field’s source wording, Ayoreni’s reading, the person’s value and its state.
- Sets the status: **Verified**, **Partially Verified** or **Unverified** (§12).
- Makes the record visible in Records → Documents (and Pending Verification if not Verified), in the timeline marked with its status, and in Today’s Records to Review count when pending (D-RX-2).
- Creates **no** medicine course, schedule, reminder, test task, follow-up task or dose entry.
- Returns a saved record ID before S-RX-04 can do anything; a retry never creates a second record.
- **Save failed:** "We couldn’t save this record. Your review is still here." **Try Again**. Nothing downstream happens.
- **Offline:** **Save When Online**; the screen says clearly that nothing is saved yet.

## 11. Which medicines can go on to S-RX-04 (eligibility)
A medicine is eligible to continue (not to be activated) only when it is confirmed and none of these are unresolved: name/identity, strength needed for the dose, amount each time and unit, how often or as-needed, route where it matters, required duration, essential instructions — and no unresolved instruction shared with it (APPROVED RX-VER-03). Doctor, clinic, address, notes and condition do not block on their own. The exact clinical list stays subject to specialist validation (OPEN, RX-OD-03).

## 12. Verification status rules (APPROVED RX-VER-01)
- **Verified:** everything that needs review is confirmed (absent or not-applicable fields recorded as such).
- **Partially Verified:** some confirmed, some unresolved or Unable to Verify.
- **Unverified:** nothing confirmed, reading failed, or saved before checking.
- Missing optional details never keep a record pending. "Unable to Verify" stays visible on reopening. Editing a confirmed value later reopens that item and keeps the earlier value in history (RX-VER-06).

## 13. Requirement trace
S-RX-03 stage · B1 (record saved here, independently) · B2 (look-alike check before creation) · B4 (record-only always offered) · B5 · CLR-01, 05, 06, 07, 08, 09 · Classification §4–§5 · MF-D01, 02, 03, 07, 08 · RX-VER-01, 02, 03, 05, 06, 12, 13 · RX-MAT-10 (document date distinct; history handled in S-RX-04), 12, 17 · RX-OD-02, 03, 09, 10, 13 · D-RX-1, D-RX-2.

## 14. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-03-01 | Reading finishes | 3B opens with "Suggested by Ayoreni" and Confirm Type / Change Type; no content can be confirmed before the type |
| AT-03-02 | Ayoreni can’t tell the type | No preselection; the nine options are shown |
| AT-03-03 | No action for a long time on 3B | Nothing is confirmed or saved |
| AT-03-04 | Change Type from Prescription to Laboratory Report after reading | Prescription reading marked out of date; basic-details review shown |
| AT-03-05 | Reading fails | Try Again / Save Without Reading; saved record is Unverified with no invented values |
| AT-03-06 | Save and Check Later during reading | Type chosen, original saved as Unverified, appears in Pending Verification; reading results show on Continue Verification |
| AT-03-07 | Dose reads as 5 or 50 mg | Field highlighted with source crop; Confirm needs the person’s value; Unable to Verify keeps it pending |
| AT-03-08 | "1-0-1" on the prescription | Shown as written; not expanded until the person confirms what it means |
| AT-03-09 | Confirm 3 of 4 medicines, Unable to Verify the 4th dose | Sheet P; Continue with 3 Confirmed Medicines saves as Partially Verified and opens S-RX-04 with 3 eligible |
| AT-03-10 | Shared unclear instruction affects 2 medicines | Both ineligible even if their own fields are confirmed |
| AT-03-11 | Medicines section unreadable | Shows "We couldn’t read the medicines section", never "No medicines" |
| AT-03-12 | Prescription with only an MRI and a follow-up | Save & Review Follow-ups; no medicine step; nothing booked or completed |
| AT-03-13 | Look-alike of a saved prescription | Sheet D with both previews; Open Saved Record creates nothing; Updated Copy links a version; Different Document saves separately |
| AT-03-14 | Same medicine as an older prescription, different visit | No duplicate warning from the medicine alone |
| AT-03-15 | Name on document clearly differs | Sheet M; Not Mine saves nothing |
| AT-03-16 | Save Record Only | Record saved with correct status; no course, schedule, reminder or task created |
| AT-03-17 | Save tapped twice / retried after failure | One record only |
| AT-03-18 | Save fails | Error with Try Again; review kept; S-RX-04 not opened |
| AT-03-19 | Reopen a Partially Verified record via Continue Verification | Only outstanding items need action; confirmed items unchanged |
| AT-03-20 | Edit a confirmed dose later | Item reopens; earlier value kept in history; status recalculated |
| AT-03-21 | Mixed PDF (prescription + bill) | Split suggestion with page ranges; original kept whole either way |
| AT-03-22 | Genetic report | Private-by-default note; no interpretation; basic details only |
| AT-03-23 | Medical bill | Basic details; bill note shown; no medicine or treatment created |
| AT-03-24 | Status labels anywhere | Never "clinically verified"; "Verified" means the person confirmed the transcription |
| AT-03-25 | Largest text size, light and dark | Nothing clipped; every control reachable; contrast passes |

## 15. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Status for the eight types without detailed reading yet (VER-OD-01, VER-OD-09) | Verified when basic details are confirmed; revisit when each category’s reading spec is approved |
| OPEN-2 | Group confirm vs one by one (RX-OD-02) | Document details as a group; medicines, tests and diagnoses one by one |
| OPEN-3 | Exact medicine fields and which block scheduling (RX-OD-03; 99-field catalog not approved) | Use the essentials in §6 and the blocking list in §11 until clinical validation |
| OPEN-4 | Backend (Phase 9): category on documents; per-field transcription with states; three statuses; background reading after "Save and Check Later"; content duplicate check; confirm route that saves the record without creating medicines | Add to Phase 9; the current confirm route conflicts (already flagged to the lead) |
| OPEN-5 | When names "clearly differ" (Sheet M) | A simple rule (different surname or initials) tuned in testing; never blocks on a missing name |
| OPEN-6 | Storing a split mixed PDF (page ranges, one original) | Backend design in Phase 9 |
