# R-DOC-02 · Record detail — screen specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-24 · **Flow:** Records → Documents → a record (and every other place a record is opened).
**Sources (APPROVED):** RX-VER-04 (document detail → Verify Record / Continue Verification is the third access point), **RX-VER-05** (resume only outstanding information; no duplicates; recheck current medicines), **RX-VER-06** (verification and tracking independent; editing verified information reopens it, keeps versions, surfaces tracking discrepancies; never silently changes a schedule), RX-VER-11 (status updates both ways), **RX-VER-12** (postpone without losing progress; unsynced changes shown), **RX-VER-13** (one canonical record from every entry point), **RX-VER-14** (optional one-time verification reminder, off by default; Tomorrow · In 3 days · In 1 week · Choose a date · Don’t remind me; cancelled when verified; distinct from medicine reminders; generic notification text); CLR-04 (one original, many condition links), **CLR-06** (change category without re-upload; reassess extraction and links; keep history), CLR-07 (duplicates reviewed, never silently removed), CLR-08; rules 3–8 (identity from the session, cross-patient → not found, private originals via short-lived signed URLs, no health data in logs); DOC-02–09 v1.0 (links, versions, restricted, Bills, Other); locked S-RX-03 v1.0–v1.8, S-RX-04 v1.0–v1.1, R-DOC-01, A01; M02 Medication Details (in review).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN · LEGAL GATE.

---

## 1. Objective
Show one saved record exactly as the person checked it, let them finish or correct it, and see how it connects to the rest of their health record — without ever creating a second copy or silently changing medicines (APPROVED RX-VER-05, 06, 13).

## 2. Entry paths (APPROVED RX-VER-13: the same record from everywhere)
R-DOC-01 row · search result · S-RX-05 **View Record** · Medical Timeline entry · Condition history · M02 "Source document" · a linked record’s Linked list · verification reminder (after app unlock). Back returns to where the person came from.

## 3. Content hierarchy (top to bottom; PROPOSED)
1. **Header:** back · type icon + title ("Prescription · Dr. Rao") · **⋯** menu (§7).
2. **Original strip:** page thumbnails (max 4 visible, "+3"); tap → full-screen viewer (pinch zoom, page swipe, rotate). The original is loaded through a short-lived signed link and never cached in the photo library (APPROVED rules 5–6).
3. **Status card:**
   - Status chip (approved labels) and progress: "◐ Partially Verified · 3 of 4 checked".
   - Primary action: **Continue Verification** / **Verify Record** → S-RX-03 3C of this type at the first unresolved item, with already-confirmed items left confirmed (APPROVED RX-VER-05).
   - Secondary: **Remind Me to Finish** (pending only; §6).
   - Verified: "All details checked · 24 Nov 2026" and no action.
4. **What you checked:** the record’s content in the **same groups and order as its type’s 3C** (v1.0–v1.8), read-only. Each item shows its mark: ✓ Confirmed · ○ Not checked · "Not verified" (Unable to Verify). Type disclaimers repeat here (e.g. "This is your hospital’s summary as written…").
5. **Medicines from this record** (Prescription, Hospitalization, and any type with confirmed stop/hold instructions): one row per medicine with its tracking state as a word — "Tracking · reminders on" · "Tracking · reminders off" · "Not tracked" · "Record only" · "Not ready to track" — tap → M02. **Set Up Medicines** appears only when eligible verified medicines have no decision yet (→ S-RX-04 with current medicines rechecked; APPROVED RX-VER-05). Verification and tracking are shown separately (APPROVED RX-VER-06).
6. **Linked records:** same visit/stay, bills, receipts, prescribed-vaccine orders, conditions (CLR-04). Each row opens that record; **Unlink** in the row’s swipe/long-press menu with confirmation; documents stay separate.
7. **Copies and history:**
   - "Latest copy · 1 earlier copy" → earlier copy opens read-only, labelled "Earlier copy · replaced 24 Nov" (APPROVED DOC duplicate rules).
   - **History** (collapsed): dated events in plain words — "Saved 22 Nov" · "3 items checked 22 Nov" · "Dose for Amlodipine changed 24 Nov — needs checking again" · "Type changed from Other to Prescription". Correction versions are viewable (APPROVED RX-VER-06, VER-AC-11.4).
8. **About this record** (collapsed): document date · added to Ayoreni on (the only place the upload date appears, labelled as such) · pages · file type.

## 4. Editing a checked item (APPROVED RX-VER-06; PROPOSED copy)
Tap an item → the S-RX-03 item sheet with **Edit**. Editing a **confirmed** item first shows: "**Change this detail?** It will be marked as not checked until you confirm it again." · **Change** · **Cancel**.
- After saving the change: the item is "○ Not checked", the record becomes Partially Verified and returns to Pending (APPROVED VER-AC-11.2); the previous value stays in History.
- If the item belongs to a **tracked medicine**: banner on the Medicines section "**Amlodipine dose changed on this record.** Your tracked medicine hasn’t changed. Review it to decide." · **Review Medicine** (→ S-RX-04 Review Change for that medicine). Nothing changes in Today or reminders until the person confirms (APPROVED RX-VER-06, VER-AC-11.5).
- Editing an **unconfirmed** item is the normal 3C flow.

## 5. Change type (APPROVED CLR-06; PROPOSED flow)
⋯ → **Change Type** → the nine types (current ticked) → confirmation: "**Check it as a Laboratory Report?** Ayoreni will read it again as a lab report. You’ll check its details again. Medicines you already track won’t change." · **Change Type** · **Cancel** → that type’s 3C on the same original; History records the change.
- Away from Genetic: the v1.7 "Keep this record restricted?" sheet, Keep Restricted default (APPROVED DOC-08 §7.2).
- To Genetic: restriction applies at once; content outside permitted metadata is removed from the reading layer (APPROVED DOC-08 §7.2).

## 6. Remind me to finish (APPROVED RX-VER-14)
Sheet "Remind you to finish checking?" with one-time options **Tomorrow · In 3 days · In 1 week · Choose a date** and **Don’t Remind Me**; time row "9:00 AM · Change" (PROPOSED default, editable; OPEN in RX-VER-14). Off by default.
- An existing reminder shows on the status card: "Reminder · Thu 27 Nov, 9:00 AM" · **Change** · **Remove**; changing replaces it.
- Notifications off: "Notifications are off for Ayoreni, so this reminder can’t be delivered." · **Open Settings** · **Keep Anyway** (APPROVED item 8).
- Notification text: "You have a record to finish checking" (APPROVED item 9). Cancelled automatically when the record becomes Verified (APPROVED VER-AC-11.6).

## 7. ⋯ menu (PROPOSED)
| Item | Behaviour |
|---|---|
| **Change Type** | §5 |
| **Share Original** | System share sheet with the original file, after a confirmation naming the file; nothing else is shared; restricted records need device authentication first (APPROVED DOC-08 §4). A full sharing flow is a later spec (R01-OD) |
| **Save to Files** | Downloads the original to the device’s Files app after confirmation; not offered for restricted records (PROPOSED) |
| **Delete Record** | §8 |

## 8. Delete (PROPOSED; retention LEGAL GATE)
Sheet: "**Delete this prescription?** The original and everything you checked will be removed from Ayoreni." Then, only if true:
- "Medicines you track from it **keep running**. You can stop them in Medications." (never stopped by deleting a document; APPROVED RX-VER-06 principle)
- "2 linked records stay; only the link is removed."
**Delete** (red) · **Cancel**. After delete: back to the list with toast "Record deleted" · **Undo** (5 s). Final removal and retention period follow the legal review. Pending reminders for it are cancelled.

## 9. Restricted records (APPROVED DOC-08 §4, S-RX-03 v1.7)
- Opening requires device authentication every time; cancelled → back to the list.
- Shows only: lock title "Restricted record", report details (name, date, lab, test name), status, **View Original**, History, ⋯ (Change Type, Share Original after re-authentication, Delete). No medicines, links or content sections.
- App-switcher snapshot blurred while open; no thumbnails strip until the person taps **View Original**.

## 10. States
| State | What the person sees |
|---|---|
| Loading | Header, skeleton strip and cards |
| Verified | Status card without action; content; medicines/links if any |
| Partially Verified | Status card with Continue Verification, Remind Me to Finish |
| Unverified | Status card with Verify Record; content groups show "○ Not checked" |
| Edit confirmed item | "Change this detail?" sheet |
| Tracked medicine affected | Medicines banner with Review Medicine |
| Reminder set | Reminder line on the status card |
| Change type | Type list → confirmation |
| Delete | Confirmation naming consequences |
| Earlier copy | Read-only, labelled banner, **Open Latest** |
| Restricted | Authentication → minimal view |
| Offline | Banner "You’re offline"; content from the phone; original "Available when you’re online" unless already open this session; edits saved on the phone and marked "Not synced yet" (APPROVED RX-VER-12) |
| Changed on another device | Banner "Updated on another device" · **Refresh**; never overwrites newer changes silently (APPROVED RX-VER-13) |
| Deleted elsewhere / not found | "This record isn’t available." · **Back to Documents** (same message for another person’s record; APPROVED rule 4) |

## 11. Data
Reads the canonical record. Writes only through: item edit (new version, status recomputed), change type (new reading, history), link/unlink, reminder set/change/remove, delete. Never writes medicine courses, schedules or dose logs from this screen; those go through S-RX-04 or M02 (APPROVED RX-VER-06). No record content in logs or analytics (rule 8).

## 12. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-R02-01 | Open the same prescription from Documents, timeline and a condition | Same record, same status (RX-VER-13) |
| AT-R02-02 | Continue Verification on 3 of 4 | Opens the 4th item; first three stay confirmed (RX-VER-05) |
| AT-R02-03 | Verified prescription, not tracked | Verified; medicines "Not tracked" (RX-VER-06) |
| AT-R02-04 | Edit a confirmed dose of a tracked medicine | Record back to Pending; banner; schedule unchanged until Review Medicine is confirmed (VER-AC-11.2, 11.5) |
| AT-R02-05 | History after an edit | Previous value listed (VER-AC-11.4) |
| AT-R02-06 | Set reminder In 3 days, then change to Tomorrow | One reminder, updated (RX-VER-14) |
| AT-R02-07 | Record becomes Verified | Reminder cancelled; medicine reminders untouched (VER-AC-11.6) |
| AT-R02-08 | Notifications off, set reminder | Delivery warning shown |
| AT-R02-09 | Change type Other → Prescription | Prescription 3C on the same original; no re-upload; history entry (CLR-06) |
| AT-R02-10 | Change type away from Genetic | Keep Restricted default |
| AT-R02-11 | Delete a prescription with tracked medicines | Medicines keep running; Undo available |
| AT-R02-12 | Open another person’s record id | "This record isn’t available." (rule 4) |
| AT-R02-13 | Restricted record | Authentication each time; minimal view; blurred snapshot |
| AT-R02-14 | Earlier copy opened | Read-only, labelled, Open Latest |
| AT-R02-15 | Upload date | Shown only in About, labelled "Added to Ayoreni" |
| AT-R02-16 | Offline edit | Marked Not synced yet; synced later without duplicates |
| AT-R02-17 | Largest text size, light and dark; screen reader | Nothing clipped; contrast passes; statuses read as words |

## 13. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| R02-OD-1 | Content layout | Reuse each type’s 3C groups read-only, so what you see matches what you checked |
| R02-OD-2 | Editing a confirmed item | Allowed, with the "Change this detail?" warning; record returns to Pending |
| R02-OD-3 | Default reminder time | 9:00 AM, editable (RX-VER-14 left the time open) |
| R02-OD-4 | Deleting a record with tracked medicines | Medicines keep running; say so in the delete sheet |
| R02-OD-5 | Undo after delete | 5-second Undo; final removal per legal retention policy |
| R02-OD-6 | Share and Save to Files | Original file only, after confirmation; full sharing flow later |
| R02-OD-7 | Upload date | Only in About, labelled "Added to Ayoreni" |
| R02-OD-8 | Unlink | Allowed per link with confirmation; never deletes either record |
