# R-DOC-01 · Documents list — screen specification

**Status:** APPROVED 2026-11-24 (owner: "approve R-DOC-01 with recommendations"; all PROPOSED items and R01-OD-1–8 recommendations accepted) · design APPROVED 2026-11-24 (canvas boards RD01 and RD01 States) · LOCKED · **Date:** 2026-11-23 · **Flow:** Records → Documents.
**Sources (APPROVED):** RX-VER-04 (three access points), **RX-VER-07** (Records → Documents; All default; Pending Verification filter; no new tab; VER-AC-07.1–07.5), **RX-VER-08** (one pending list with Unverified + Partially Verified, distinct labels and actions, progress), **RX-VER-09** (Today "Records to Review" deep link; unique-document count; patient-scoped; VER-AC-09.4, 09.6), **RX-VER-10** (secondary multi-select category filter for all nine types; optional date/provider/condition; reset; not persistent clutter; VER-AC-10.1–10.5), **RX-VER-11** (bidirectional list updates; VER-AC-11.1–11.3), RX-VER-12 (postpone without losing progress), RX-VER-13 (one canonical record everywhere); Classification v1.0 (nine categories, names); DOC-02–09 v1.0 §7 "Records" rules (dating, Bills filter, restricted rows, "Date unknown"); locked S-RX-01–05 and S-RX-03 v1.1–v1.8; locked design system (Calm Glass UI v4, 2026-11-19 contrast fix); four tabs (Today / Records / Medications / Profile).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

---

## 1. Objective
One place to see every saved document for the selected person, find one quickly, and see which still need checking — without moving records between lists or creating copies (APPROVED RX-VER-07, 13).

## 2. Entry paths
| From | Opens with | Back goes to |
|---|---|---|
| Records tab → **Documents** | **All** (APPROVED RX-VER-07) | Records |
| Today → **Records to Review** (when it exists; S06 v1.1, §12 OD-7) | **Pending Verification** preselected (APPROVED RX-VER-09) | Today |
| S-RX-05 → **View in Records** / **Records to Review** | All (or Pending if the record is pending) with the new record briefly highlighted | Today |
| A verification reminder notification | Pending Verification, after app unlock | Today |

## 3. Content hierarchy (top to bottom; PROPOSED)
1. **Header:** back chevron · title **Documents** · search icon · filter icon (with a small count when filters are active). If the account manages more than one profile, a profile line under the title: "Ananya Sharma" · **Switch** (existing profile switcher).
2. **Primary filter** (segmented control, always visible): **All** · **Pending Verification** · **Verified** (APPROVED names). Pending shows its count: "Pending Verification 2". The count is unique documents for this profile (APPROVED RX-VER-09).
3. **Active filters row** (only when secondary filters are set): chips "Prescription ×", "Lab Report ×", "Last 3 months ×" · **Reset** (APPROVED RX-VER-10).
4. **Pending context line** (Pending only): "2 records to check. You can finish them any time." (PROPOSED copy)
5. **List**, grouped by month of the **document date** ("November 2026"), newest first; a last group **Date unknown** for undated records (APPROVED DOC rules: never the upload date).
6. **Add** — floating pill **+ Add Record** above the tab bar → S-RX-01 (PROPOSED).
7. Tab bar (locked), Records selected.

## 4. Row anatomy (PROPOSED)
Each row is one canonical document (APPROVED RX-VER-13). Min height 68, whole row tappable → R-DOC-02 Record detail.

| Part | Content |
|---|---|
| Icon tile | Category icon (one per type, as the S-RX-03 type picker) |
| Line 1 | Record title: type-based name and source — "Prescription · Dr. Rao", "Lab Report · City Diagnostics", "Hospital stay · Apollo Hospital", "Bill · Apollo Hospital", or the person’s title for Other |
| Line 2 | Date (stays as a range "3–7 Nov" for stays) · subtype or extra: Bills show the printed total "₹1,23,450"; vaccination "3 doses"; lab "12 results" |
| Status chip (icon + word, never colour only) | **✓ Verified** (green) · **◐ Partially Verified** (amber) with progress "3 of 4 checked" · **○ Unverified** (grey-blue) "Not checked yet" (APPROVED RX-VER-08 labels) |
| Pending action (Pending and All, on pending rows only) | Small pill **Verify Record** (Unverified) or **Continue Verification** (Partially Verified) — opens S-RX-03 3C at the first unresolved item (APPROVED RX-VER-08, RX-VER-05) |
| Small markers (optional, max one) | "Updated copy" · "Linked" · "Waiting to upload" · "Reading…" |

**Status meanings stay the approved ones:** verification = the person checked the transcription, not that it is medically correct (APPROVED). A Verified record with no medicines tracked is still Verified (VER-AC-08.3).

## 5. Special rows (PROPOSED)
| Case | Row |
|---|---|
| **Restricted** (DOC-08, and any legally hidden type) | Neutral lock tile · "Restricted record" · date only · status word only ("Not checked yet") · no category, provider or test name; tap → device authentication → R-DOC-02 (APPROVED DOC-08 §4) |
| **Waiting to upload** (saved offline, S-RX-02) | Top of All, "Waiting to upload · will send when you’re online" · **Retry** |
| **Reading** (left during S-RX-03 3A) | "Reading your document…" · tap resumes S-RX-03 |
| **Couldn’t read** (3A failed, not yet saved) | Not listed — nothing was saved (APPROVED S-RX-03 save boundary) |
| **Updated copy** | Only the latest copy is a row; earlier copies are inside R-DOC-02 (APPROVED DOC rules) |
| **Same-visit / same-stay links** | Separate rows; "Linked" marker; never merged (APPROVED DOC-04/05) |

## 6. Secondary filter sheet (APPROVED RX-VER-10; PROPOSED layout)
Opened from the filter icon. Sheet title **Filter Documents**.
1. **Type** — all nine categories by their approved names, multi-select chips: Prescription · Laboratory Report · Imaging & Diagnostic Report · Doctor Consultation & Clinical Notes · Hospitalization & Procedure Records · Vaccination & Immunization Record · Medical Bills & Receipts · Genetic & Genomic Report · Other Medical Document. None selected = all (APPROVED).
2. **Date** — Any time · This month · Last 3 months · This year · Custom range.
3. **Doctor or provider** — list built from the person’s saved records (search inside if long); only shown when at least two exist.
4. **Condition** — the person’s existing conditions that have linked records; only shown when any exist.
5. **Sort** — Document date (newest first, default) · Recently added.
Footer: **Show 6 Records** (live count) · **Reset**.
Rules: types combine as alternatives; facets intersect with each other and with the primary filter (APPROVED clarification). Changing secondary filters never changes the primary filter (VER-AC-10.3). Genetic: selecting it still shows only restricted rows (VER-AC-10.5). Filters last while the person stays in Records; they clear when the app is closed (PROPOSED, OD-2).

## 7. Search (PROPOSED)
Tap search → field at the top, keyboard up, recent searches (on device only).
- Matches title, type, provider, doctor and, for non-restricted records, text kept from the document (DOC-09 §3.3).
- Searches **All** regardless of the primary filter; results show their status chips.
- Never matches restricted records’ content, type or lab (APPROVED VER-AC-10.5).
- No results: "No records match “thyroid”." · **Clear Search**.

## 8. States
| State | What the person sees |
|---|---|
| Loading | Skeleton rows (3), segmented control usable |
| All · first time | Empty card: "Your documents will appear here." · **Add Health Record** (→ S-RX-01) |
| All · with records | Grouped list |
| Pending · with records | Context line, pending rows with actions |
| Pending · empty | "Nothing to check. Your saved records are all verified." Filter stays selectable (APPROVED VER-AC-07.3) |
| Verified · empty | "No verified records yet. Records you check fully appear here." |
| Filtered · no match | "No records match these filters." · **Reset Filters** |
| Offline | Banner "You’re offline · showing records saved on this phone"; Pending count shown without a freshness claim ("Pending Verification 2 · may not be up to date") (APPROVED VER-AC-09.6); Verify actions open if the record is cached, otherwise "Available when you’re online" |
| Sync error | Banner "Some changes haven’t synced yet" · **Try Again** (APPROVED RX-VER-12) |
| Profile switched | List, counts and filters reset to the new profile (APPROVED VER-AC-09.4) |
| Just saved (from S-RX-05) | The new row highlighted for 2 s; reduce-motion: no animation, a "New" marker instead |
| Status changed | A record leaving Pending after verification animates out of Pending; it stays in All and Verified (APPROVED VER-AC-11.1). A reopened record re-enters Pending (VER-AC-11.2) |

## 9. Data
This screen only reads. It creates or changes nothing; every change happens in S-RX-03 or R-DOC-02 (PROPOSED). No document contents, titles or providers in logs or analytics (rule 8).

## 10. Privacy
- Patient-scoped: only the selected, authorized profile (APPROVED).
- Restricted rows as §5; app-switcher snapshot of this list blurs restricted rows only if one is visible (PROPOSED).
- Counts and badges never appear in notifications or on the lock screen.

## 11. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-R01-01 | Records → Documents | All selected; three primary filters shown (VER-AC-07.1, 07.2) |
| AT-R01-02 | Today → Records to Review | Pending preselected; no second Records module (VER-AC-07.4) |
| AT-R01-03 | Switch All ↔ Pending ↔ Verified | View changes only; same records (VER-AC-07.5) |
| AT-R01-04 | Pending with none left | Empty state; filter still selectable (VER-AC-07.3) |
| AT-R01-05 | Prescription 3 of 4, lab unverified, MRI verified, summary partial, vaccine verified | Pending shows 3 with correct labels and actions; All shows 5 (VER-AC-08.1, 08.2) |
| AT-R01-06 | Verified record without tracking | Not in Pending (VER-AC-08.3) |
| AT-R01-07 | Filter Prescription + Lab within Pending | Only those pending; Reset keeps Pending (VER-AC-10.2, 10.3) |
| AT-R01-08 | Filter shows all nine types | Yes, approved names (VER-AC-10.1) |
| AT-R01-09 | Genetic report saved | Restricted row; not found by search; filter shows restricted row only (VER-AC-10.5) |
| AT-R01-10 | Finish verifying a record | Leaves Pending, stays in All and Verified (VER-AC-11.1) |
| AT-R01-11 | Edit a verified dose | Record returns to Pending (VER-AC-11.2) |
| AT-R01-12 | Undated record | In "Date unknown"; upload date never shown as its date |
| AT-R01-13 | Bill row | Shows printed total; in Bills filter only via Type |
| AT-R01-14 | Offline | Banner; count without freshness claim (VER-AC-09.6) |
| AT-R01-15 | Switch profile | List and counts change; no other-profile rows (VER-AC-09.4) |
| AT-R01-16 | Largest text size, light and dark | Rows wrap, nothing clipped; contrast passes |
| AT-R01-17 | Screen reader | Row reads title, date, status and action; status not by colour only |

## 12. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| R01-OD-1 | Default sort | Document date, newest first; "Recently added" as an option |
| R01-OD-2 | Filter persistence | Kept while in Records; cleared on app close (avoids hidden filters later) |
| R01-OD-3 | Group by month | Yes, by document date; "Date unknown" last |
| R01-OD-4 | Pending action on rows | Small Verify / Continue pill on pending rows, plus whole-row tap to detail |
| R01-OD-5 | Restricted rows in All | Shown as neutral "Restricted record" rows with date only |
| R01-OD-6 | Records landing (Documents beside Medical Timeline, Medical Conditions, Health Measurements) | Not part of this screen; specify as R-00 Records home next, with only the Documents entry live at first |
| R01-OD-7 | Today "Records to Review" shortcut | Needs a small change spec to the locked S06 (v1.1) after this screen is approved |
| R01-OD-8 | Floating **+ Add Record** here | Yes — same S-RX-01 entry as Today |
