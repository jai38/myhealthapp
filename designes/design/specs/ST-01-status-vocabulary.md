# ST-01 · Status vocabulary — shared reference

**Status:** APPROVED 2026-11-24 (owner: "approve status recommendations") · LOCKED · **Date:** 2026-11-24.
**Applies to:** every screen that shows a dose, medicine, document or tracking status — Today (S05/S06), S07, M01 Medications, M02, R-00, R-DOC-01/02, S-RX-03–05, notifications. Screens must use these words and rules; a new status needs a change to this file first.
**Sources (APPROVED):** S06/S07 (locked 2026-11-16/19), DEV-HANDOFF §3–4 dose chips and rules, colour-shape spec (contrast fix 2026-11-19), `api.md` (`Medication.status`: INACTIVE · ACTIVE · PAUSED · COMPLETED · DISCONTINUED; `Dose.status`: PENDING · TAKEN · SKIPPED · SNOOZED · MISSED; "PENDING in the past means Not confirmed"; MISSED only from the patient), M02 v1.1, S-RX-04 v1.0/v1.1, RX-VER-01–14, R-DOC-01/02, rules 10–15.

All statuses are shown as **icon + word**, never colour alone (APPROVED).

## 1. Dose statuses (one scheduled dose)
| Word | Chip | Set by | Rule |
|---|---|---|---|
| **Upcoming** | grey "Upcoming" | System, before the scheduled time | — |
| **Due now** | blue gradient "● Due now" + one **Mark as Taken** per group | System, from the scheduled time | Lasts **2 hours after the scheduled time, or until the same medicine’s next scheduled dose if that is sooner** (decided 2026-11-24) |
| **Taken** | green "✓ Taken" + actual time | **Only an explicit tap** by the person (Mark as Taken, S07 "Yes, I took it", Log a Dose) | Never from a notification being delivered, dismissed or snoozed (rule 14) |
| **Skipped** | grey "Skipped" + optional reason | Only the person (S07) | — |
| **Missed** | red "Missed" | Only the person ("No, I missed it") | Never automatic (rule 15) |
| **Not confirmed** | amber "? Not confirmed" · "Tap to update" | System, when the Due now window ends with nothing recorded (`PENDING` in the past) | Not Taken, not presumed Missed; never synthesized adherence (rule 15) |

**Snooze (decided 2026-11-24):** no status word. A snoozed dose keeps its current word (normally Due now) with a small line "Reminder again at 1:15 PM". It never counts as Taken; after its window it becomes Not confirmed like any other unrecorded dose.
**As-needed medicines:** no scheduled doses, so none of the words above except **Taken**, shown "✓ Taken · logged by you". Never Missed or Not confirmed (M02 v1.1).
**Undo** returns a dose to its time-based word (Upcoming / Due now / Not confirmed) with no trace of Taken (api.md PR #9).

## 2. Medicine (course) statuses
| Word | Chip | API | Meaning |
|---|---|---|---|
| **Active** | green "● Active" | ACTIVE | Tracked; scheduled doses appear on Today |
| **Paused** | amber "❚❚ Paused" | PAUSED | No doses or reminders; never restarts by itself; no resume date |
| **Stopped** | red "✕ Stopped" | DISCONTINUED | Stopped by the person (optionally from a document), with date and reason; history kept |
| **Completed** | grey "✓ Completed" | COMPLETED | Finished: marked by the person, **or automatically when a course reaches the end date the person set** (decided 2026-11-24) |
| **Not in daily list** | grey "Not in daily list" | INACTIVE | From an older or historical prescription; no reminders; started only by Start Taking (Sheet U → 4B) |

**Labels shown beside the status (not statuses):** **As needed** · source **Prescribed** / **Added by you**.
**Flags (amber card, shown above everything else on M02 and as a marker on list rows):** **Reaction on record** (Suspected / Confirmed, never merged) · **Prescription corrected** (source edited; tracking unchanged until reviewed).
**Separate item type, not a course:** **Prescribed · not given yet** for injections and vaccines (RX-MAT-19); becomes "Given · documented" only by an explicit link (DOC-06).

**Course end date (decided 2026-11-24):** on the day after the end date the course becomes Completed; no doses or reminders after it; nothing on Today. M02 shows "Course ended 17 Jan, as planned" with **Still Taking It? Extend Course** (→ 4B with the end date editable). No prompt or notification is sent.

## 3. Document statuses (RX-VER-01, R-DOC-01)
| Word | Chip |
|---|---|
| **Verified** | green "✓ Verified" |
| **Partially Verified** | amber "◐ Partially Verified" + "3 of 4 checked" |
| **Unverified** | grey-blue "○ Unverified" · "Not checked yet" |
Row markers (not statuses): Restricted record · Waiting to upload · Reading… · Updated copy · Linked. Generated doctor reports carry a "Report" label and no verification status (D-RX-3).

## 4. Tracking state of a medicine on a record (R-DOC-02)
Tracking · reminders on · Tracking · reminders off · Not tracked · Record only · Not ready to track · Decide later. Verification and tracking are always shown separately (RX-VER-06).

## 5. Where each appears
| Surface | Shows | Never shows |
|---|---|---|
| **Today (S05/S06)** | Hero "2 of 6 taken", next dose, "1 needs confirming" (= Not confirmed today); dose chips for **Active, scheduled** doses; snooze line; Records to Review row | Paused, Stopped, Completed, Not in daily list, As needed; document statuses |
| **M01 Medications** | Medicine statuses, labels, flags, next dose time | Per-dose chips other than the next dose line |
| **M02** | Medicine status, labels, flags; Today’s dose chips (active only); history chips | — |
| **Records (R-00, R-DOC-01/02)** | Document statuses and markers; tracking state on R-DOC-02 | Dose chips |
| **Lock-screen / banner notifications** | Generic text only: "Time for your medicine" (medicine name only if the person turns names on), "You have a record to finish checking" | Any status, medicine, document, count or health detail |

## 6. Reminder notifications (decided 2026-11-24)
- One action button: **Snooze 15 min**. Tapping the notification opens the app on that dose, where **Mark as Taken** is one tap.
- No "Taken" button on the notification or lock screen.
- Delivery, dismissal and snooze never change a dose to Taken (rule 14).
- If notifications are blocked on the phone, screens say so; they never imply alerts will arrive (RX-VER-14, 4B).
- The in-app notification list (bell) is a separate later spec.

## 7. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-ST-01 | Dose at 8:00, next dose 20:00, nothing recorded | Upcoming → Due now at 8:00 → Not confirmed at 10:00 |
| AT-ST-02 | Doses at 8:00 and 9:00 of the same medicine | First dose Due now until 9:00, then Not confirmed |
| AT-ST-03 | Notification snoozed | Still Due now with "Reminder again at …"; not Taken |
| AT-ST-04 | Notification dismissed | No status change |
| AT-ST-05 | Notification tapped | App opens on the dose; Taken only after Mark as Taken |
| AT-ST-06 | Course end date 17 Jan passes | Completed on 18 Jan; no doses; M02 "Course ended 17 Jan, as planned" + Extend Course |
| AT-ST-07 | As-needed medicine | Never on Today; never Missed or Not confirmed |
| AT-ST-08 | Paused / Stopped / Not in daily list | Not on Today; no reminders |
| AT-ST-09 | Any status | Icon + word; contrast passes in light and dark |
