# S-RX-05 · Completion Summary — functional specification

**Status:** APPROVED 2026-11-22 (owner: "approve S-RX-05 with recommendations"; all PROPOSED items and OPEN-1–4 recommendations accepted) · design REVIEW · **Date:** 2026-11-22 · **Stage:** 5 of 5 (S-RX-01 → S-RX-02 → S-RX-03 → S-RX-04 → **S-RX-05**).
**Sources:** Continuation brief §6 (S-RX-05); Medication Reconciliation v1.0 §5 (stage table), §8.1, §10 (completion contract), RX-MAT-20; Verification & Recovery v1.0 RX-VER-09, 11, 12, 14; v0.3 workflow review §7 (reference only). Locked: S-RX-01–04, D-RX-2 (Records to Review on Today), visual baseline `8c62eb0`.
**Labels:** APPROVED · DECIDED · PROPOSED (needs approval) · OPEN.

## 1. Purpose
Tell the person, exactly and honestly, what happened: what was saved, linked, started, changed, added, kept in the record only, left for later, not ready, or failed — and give the right next step. Offer an optional one-time reminder to finish checking. Never say more succeeded than did (APPROVED §10).

## 2. Entry and exit
| From | Status |
|---|---|
| S-RX-03 → Save Record Only, Save & Verify Later, Save Record (other types), Save and Check Later / Save Without Reading | APPROVED |
| S-RX-04 → Confirm Changes, Finish Without Changes, Finish Later | APPROVED |
| This screen → Retry (after a failure) returns here with the new result | APPROVED RX-MAT-20 |

Exits: **Done** (returns to where the journey started, usually Today), **View Record**, **View Medicines**, **Finish Checking** (S-RX-03 on the same record), **Review Medicines** (S-RX-04 on the same record). This is the end of the journey: no Back to edit; changes are made from the saved record (PROPOSED).

## 3. Content hierarchy (top to bottom)
1. **Navigation bar:** title "Summary"; **Done** text button at the right. No back button.
2. **Result header:** a calm icon and one headline that matches the outcome (copy PROPOSED):
   - "Prescription saved" (or the confirmed type, e.g. "Lab report saved").
   - Partial failure: "Prescription saved. Some changes didn’t finish."
   - Below: status chip **Verified / Partially Verified / Unverified**, then document date, doctor, pages ("12 Oct 2026 · Dr. Meera Iyer · 1 page").
3. **What happened** — one glass card per group, shown only when it has something (APPROVED §10 distinctions):
   | Group | Example lines |
   |---|---|
   | Record | "Saved to Records · Partially Verified" · "1 detail still to check: Vitamin D3 strength" |
   | Medicines | "Linked · Telmisartan 40 mg — no new reminders" · "Started tracking · Atorvastatin 10 mg, once a day from 22 Nov" · "Changed · Metformin 500 mg, twice a day from 22 Nov (earlier history kept)" · "Kept in the record only · …" · "You’ll decide later · …" · "Not ready · Vitamin D3 — strength not verified" |
   | Reminders | "Reminders on · Metformin 8:00 AM, 9:00 PM" or "Tracking is on, but notifications are off on this phone. You won’t get alerts." + **Open Settings** |
   | Tests & follow-ups | "Added to your plan · HbA1c test, around 22 Feb 2027" · "Linked · Follow-up visit on 20 Feb 2027" · "Kept in the record only · …" — never "booked" or "done" |
   | Didn’t finish | Red card: "1 change didn’t finish · Metformin: twice a day" + **Retry** (retries only these; the rest stays as it is) |
   | Still reading | When saved before reading finished: "We’re still reading this document. It’ll be in Records to Review when it’s ready to check." |
4. **Reminder to finish checking** (only when the record isn’t Verified; §5).
5. **Buttons** (pinned bottom; §4).

Medicines and tasks lines name each item; counts alone are never used for what changed (PROPOSED, clarity).

## 4. Buttons by outcome (PROPOSED order; APPROVED set)
| Outcome | Primary | Secondary | Text link |
|---|---|---|---|
| Something didn’t finish | **Retry** (in the red card) and **View Record** | — | Done |
| Any medicine linked, started or changed | **View Medicines** | **View Record** | Finish Checking (if not Verified) |
| Record saved, nothing changed in medicines | **View Record** | — | Finish Checking / Review Medicines (if Decide Later items exist) |
| Other types (e.g. lab report) | **View Record** | — | — |
Done is always available at the top right.

## 5. Reminder to finish checking (APPROVED RX-VER-14)
- **Shown only** when the record is Partially Verified or Unverified. **Off by default** — nothing is preselected and saving never depended on it.
- Card: "Remind me to finish checking" / "One reminder, only if you want it." Options: **Tomorrow · In 3 days · In 1 week · Choose a Date**. Choosing one shows the time it will arrive, e.g. "Tue 25 Nov at 10:15 AM", with **Change Time** (PROPOSED: same time of day as now; OPEN-1).
- After setting: "Reminder set for Tue 25 Nov, 10:15 AM" with **Change** and **Remove**. Changing it updates the same reminder; never two.
- **Notifications off:** "Notifications are off for Ayoreni on this phone, so this reminder can’t arrive." + Open Settings. The record stays in Pending Verification either way.
- **What the notification says** (default): "You have a document to finish checking." No medicine names, doctor or document type on the lock screen (APPROVED rule 9).
- **Rules carried by the reminder:** one-time; cancelled automatically when the record becomes Verified; dismissing it never schedules another; if the record later becomes pending again, no reminder is recreated; it never touches medicine reminders, tracking or doses.

## 6. States
| State | What the person sees |
|---|---|
| All done | Verified chip; Medicines and Reminders groups; View Medicines |
| Partially verified | Partially Verified chip; Record group lists what’s left; Not ready / Decide later lines; reminder card |
| Saved only (record only) | Record group; "No changes to your medicines"; View Record |
| Saved before reading | Unverified chip; Still reading card; reminder card; View Record |
| Partial failure | "Some changes didn’t finish" headline; red card with Retry; the successful lines shown as done |
| Retrying | Retry shows progress; only the failed items are sent again |
| Notifications off | Reminders group explains alerts won’t arrive; Open Settings |
| Other type saved | "Lab report saved · Verified"; no medicine groups |
| Largest text size | Groups stack; lines wrap; nothing clipped |

## 7. After Done (APPROVED, D-RX-2)
- Today shows the new or changed medicines in their groups and times (S06 rules); linked medicines don’t appear twice.
- If the record isn’t Verified, Today’s **Records to Review** row counts it (unique documents, not fields) and opens Documents → Pending Verification.
- The record’s details keep this summary as "What happened" with the date, so the person can see it later (APPROVED §10 "durable summary").

## 8. Data
- Nothing new is created on this screen except an optional verification reminder (one per record, updated in place).
- Retry re-sends only the failed operations with their original operation keys (APPROVED RX-MAT-20).
- The summary shown is read back from what the server confirmed, not from what the app intended (APPROVED: never claim success that didn’t happen).

## 9. Requirement trace
S-RX-05 stage (brief §6) · Reconciliation v1.0 §5, §8.1, §10 · RX-MAT-15 (as-needed lines say "log when you take it"), 17, 19 (vaccine "not given yet"), 20 (exact partial success, retry only failed) · RX-VER-09 (Records to Review count), 11 (list updates), 12 (save and verify later), 14 (verification reminder) · B1 (record saved regardless), B5 (privacy, reliability) · D-RX-2.

## 10. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-05-01 | Link + new tracking, all succeeded | Each line names the medicine; "no new reminders" for the link; View Medicines primary |
| AT-05-02 | Record Only from S-RX-03 | "No changes to your medicines"; no medicine groups claim changes |
| AT-05-03 | One change failed | Headline says some didn’t finish; red card with Retry; successful lines shown as done |
| AT-05-04 | Retry | Only the failed item is re-sent; no duplicate course or reminder |
| AT-05-05 | Notifications blocked, reminders requested | Says alerts won’t arrive; never "reminders on" |
| AT-05-06 | Partially Verified record | Reminder card shown, nothing selected |
| AT-05-07 | Verified record | No reminder card |
| AT-05-08 | Choose "In 3 days" | One reminder with the shown date and time; Change updates it, never adds a second |
| AT-05-09 | Record later becomes Verified | Pending reminder cancelled |
| AT-05-10 | Reminder dismissed | No repeat; record still in Pending Verification |
| AT-05-11 | Record re-enters pending after a correction | No reminder recreated automatically |
| AT-05-12 | Lock-screen preview | "You have a document to finish checking." only |
| AT-05-13 | Tests added | "Added to your plan"; never "booked" or "done" |
| AT-05-14 | Vaccine on the prescription | "Not given yet"; nothing marked as given |
| AT-05-15 | Saved before reading finished | Still reading card; record Unverified; appears in Records to Review when ready |
| AT-05-16 | Done with a pending record | Today’s Records to Review count includes it once |
| AT-05-17 | Open the record later | "What happened" summary is there with its date |
| AT-05-18 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 11. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Time of day for the verification reminder (VER-OD-07) | Same time of day as when it was set, shown and editable; never hidden |
| OPEN-2 | Where "What happened" lives on the record | A section on the record’s details screen, designed with Records (Sankalp) |
| OPEN-3 | Backend: one verification reminder per record, auto-cancel on Verified; per-operation results for the summary and Retry | Phases 9 and 12; flag to the lead |
| OPEN-4 | "Add another document" from here | Not now; Done returns to Today, where Upload Record is one tap away |
