# S-RX-04 · Medication Reconciliation & Optional Scheduling — functional specification

**Status:** APPROVED 2026-11-22 (owner: "approve S-RX-04 with recommendations"; all PROPOSED items and OPEN-1–7 recommendations accepted) · design APPROVED 2026-11-22 (canvas boards R04, R04 States A and B) · LOCKED · **Date:** 2026-11-22 · **Stage:** 4 of 5 (S-RX-01 → S-RX-02 → S-RX-03 → **S-RX-04** → S-RX-05). Conditional: skipped when there is nothing to reconcile.
**Sources:** Continuation brief §6–§7; Medication Reconciliation v1.0 §3–§10 incl. all RX-MAT-01–20 workflows, safeguards and MAT-AC criteria, §8.1 final review, §8.2 lifecycle; Verification & Recovery v1.0 RX-VER-03, 05, 06; v0.3 workflow review §6 (reference only). Locked: S-RX-01–03, M-rules in S06/S07 (dose statuses), visual baseline `8c62eb0`. Related, in review: M02 Medication Details.
**Labels:** APPROVED · DECIDED · PROPOSED (needs approval) · OPEN.

## 1. Purpose
For each medicine the person confirmed on S-RX-03, show how it relates to what they already track, let them choose what to do — **Link Existing, Track New, Review Change, Record Only or Decide Later** — set up tracking and optional reminders where they choose to, and confirm every change in one final summary. Also offer the confirmed tests and follow-ups. The prescription is already saved; nothing here can undo that.

The app explains and compares; it never decides treatment, restarts, stops, substitutes or converts anything on its own (APPROVED B3, B4).

## 2. Entry and exit
| From / to | Behaviour | Status |
|---|---|---|
| S-RX-03 → Save & Continue to Medicines | Opens **4A** with the eligible medicines | APPROVED |
| S-RX-03 → Save & Review Follow-ups | Opens **4C** directly (no medicine step) | APPROVED RX-MAT-17 |
| Saved record → **Review Medicines** (later, incl. Decide Later items) | Opens 4A for that record; matching is run again against the person’s current medicines | APPROVED RX-VER-05, §6.5 |
| Confirm Changes / Finish Without Changes | Opens S-RX-05 | APPROVED |
| Close (×) or Back | Sheet "Finish later?" / "Your prescription is saved. Anything you haven’t decided stays in the record, and you can come back to it." **Finish Later** (→ S-RX-05, undecided items saved as Decide Later) · **Keep Reviewing** | PROPOSED |

A "Prescription saved ✓" pill sits in the header throughout (APPROVED: the saved record is never at risk here).

## 3. Views and sheets
| ID | View / sheet | When |
|---|---|---|
| 4A | Review medicines (the list) | First view |
| Sheet C | Compare | Tapping Compare on a card |
| Sheet U | Are you taking this now? | Before tracking when current use is unknown |
| Sheet W | Reaction on record | Medicine linked to a recorded reaction |
| 4B | Set up tracking | After Track New / Review Change / Review Restart / Review New Course / Track as Needed |
| 4C | Tests & follow-ups | After medicines, or directly when there are no medicines |
| 4D | Confirm changes | Final summary before anything changes |

## 4. View 4A — Review medicines
**Header:** title "Review Medicines"; pill "Prescription saved ✓"; patient line "For: You · <name>".
**Intro:** "Choose what to do with each medicine. Nothing changes until you confirm." Progress: "1 of 3 decided".

**Card (one per confirmed medicine, prescription order; MF-D03):** icon; name, strength, form; prescribed amount and how often; source page link; **status label** (icon + word, explanatory only); a line about the person’s current medicines when relevant; then only the actions that apply (§5). Chosen action shows on the card as a decision chip (e.g. "Will link", "Will track · 9:00 PM", "Record only", "Decide later") with **Change**.

**Groups:**
1. **Medicines on this prescription** — the eligible ones (S-RX-03 §11).
2. **Not ready to track** — confirmed but ineligible items, with the reason ("Strength not verified") and **Finish Checking** (opens S-RX-03 item) or **Record Only** (APPROVED RX-VER-03, RX-MAT-12).

**Footer note:** "Medicines that aren’t on this prescription stay as they are." No prompt to review omitted medicines (APPROVED RX-MAT-18).

**Bottom:** **Review Changes** (primary; opens 4D; disabled until at least one decision) · **Next: Tests & Follow-ups** when there are any · **Finish Without Changes** (text button).

## 5. Status labels and the actions each offers
No action is preselected; the person taps one (APPROVED B3).

| Status label (copy PROPOSED) | When (RX-MAT) | Actions offered |
|---|---|---|
| **New medicine** | No match found (01) | Track New · Record Only · Decide Later |
| **Already tracked** | Same verified regimen already active (02) | Link to Existing · Compare |
| **May be the same medicine** | Same ingredient, different brand (03) — shown only with validated reference data; otherwise only when the person says so | Compare → Link to Existing · Review Change · Record Only · Decide Later |
| **Dose is different** | Different strength or amount (04) | Compare · Keep Existing · Review Change · Record Only · Decide Later |
| **Timing is different** | Different frequency or time (05) | Compare · Keep Existing · Review Change · Record Only · Decide Later |
| **Needs careful review** | Different form, route or release type (06) | Compare · Review Change · Record Only · Decide Later |
| **Paused earlier** | Matches a paused medicine (07); shows pause date and reason | View Existing · Review Restart · Record Only · Decide Later |
| **Stopped or completed earlier** | Matches a stopped/completed medicine (08); shows dates and reason | View History · Review New Course · Record Only · Decide Later |
| **Reaction on record** | Linked to a recorded reaction (09) — see Sheet W | Record Only · Decide Later (tracking not available from here; OPEN-1) |
| **Older prescription** | Document date earlier than a newer record (10) | View Newer · Record Only · Review Tracking (asks Sheet U first) |
| **Several instructions** | Same medicine on more than one line (13) | Compare Lines → One Medicine, Several Doses · Separate Medicines · Decide Later |
| **Changing-dose schedule** | Taper or stages (14) | Record Only · Decide Later, with "Ayoreni can’t set up changing-dose schedules yet." (OPEN-2) |
| **As needed** | PRN (15) | Track as Needed · Record Only · Decide Later |
| **Different instructions from another doctor** | Conflicting active instructions (16) | Compare · Keep Existing · Record Only · Decide Later; **Review Change** only after "I’ve checked with my doctor" |
| **Prescribed · not given yet** | Injection or vaccine (19) | Add a Reminder · Record Only |

Several labels can apply at once; all are shown, and safety ones (reaction, conflict) come first and override the ordinary actions (APPROVED §6, §8).

### Sheet C — Compare
Two columns, **Now** (current medicine) and **This prescription**: name/ingredient (when verified), strength, form, route, amount each time, how often and times, dates, status (active/paused/stopped/completed), source and doctor. Differences highlighted. Source instructions and the person’s own reminder times are shown on separate rows (APPROVED RX-MAT-05). Same choices as the card at the bottom. Opening Compare is never consent to anything (APPROVED §5.1).

### Sheet U — Are you taking this now?
"Are you taking Metformin now?" **Yes, I’m Taking It** (→ 4B) · **No, I’m Not** (→ Record Only) · **Not Sure** (→ Decide Later). The answer is saved with the time and never changes tracking by itself (APPROVED RX-MAT-11). Asked for New medicine, Older prescription and Review Tracking; not asked when the medicine is already tracked.

### Sheet W — Reaction on record
Prominent, not dismissable by a single tap: "A reaction is recorded for this medicine" with what was recorded — **Suspected** or **Confirmed** (never merged), symptoms, severity, date, and what was done then. "Talk to your doctor or pharmacist before you start tracking it." **Keep in Record Only** · **Decide Later** · **View Reaction** (APPROVED RX-MAT-09). Ayoreni never says a medicine is safe because no reaction is recorded (APPROVED §4).

## 6. View 4B — Set up tracking
Opens for Track New, Review Change, Review Restart, Review New Course and Track as Needed.

1. **From the prescription** (read-only, with source link): name, strength, form, route, amount each time, how often, when, for how long, instructions. Unknown stays "Not on the prescription".
2. **Your tracking** (you choose):
   - **Start** date (pre-filled with today, editable; for a change: **Changes from** date).
   - **Dose times:** one slot per dose from the confirmed frequency ("1 twice a day" → 2 slots). Slots start **empty**; the person picks each time. Prescribed timing (e.g. "after breakfast") is shown as a hint beside the slot, never turned into a clock time (APPROVED RX-MAT-05; lead flag on invented default times).
   - **End:** from the prescription ("For 8 weeks · ends 17 Jan") or **No end date** when none is written; editable.
   - **Reminders:** switch, **off by default**. Turning it on asks for notification permission if needed. If the phone blocks notifications: "Notifications are off for Ayoreni on this phone. Tracking still works; you won’t get alerts." **Open Settings** (APPROVED §8.1, RX-VER-06).
3. **For a change (Review Change / Restart):** a before → after strip ("Was 500 mg once a day → 500 mg twice a day from 18 Nov") and "Your earlier history stays as it is."
4. **As needed:** no times and no daily doses; "You’ll log each dose when you take it." (APPROVED RX-MAT-15).
5. **One medicine, several doses (RX-MAT-13):** one card with several dose rows (e.g. 1 tablet morning, ½ tablet night).
6. **Button:** **Add to Plan** (adds this choice to the summary; nothing is saved yet). Disabled until every dose slot has a time when reminders are on.

Never pre-filled from unverified values, never converted units, never a guessed time (APPROVED MF-D07).

## 7. View 4C — Tests & follow-ups
Each confirmed test or follow-up from the prescription: "HbA1c test · ‘Repeat after 3 months’". Actions: **Add to My Plan** (optional date and reminder; creates one task) · **Already Planned** (when a matching task exists: links instead of creating another) · **Record Only**. A recommendation is never shown as booked or done (APPROVED CLR-01, RX-MAT-17, B2 task dedupe). Where planned tasks appear in the app is OPEN-4.

## 8. View 4D — Confirm changes
Title "Confirm your changes". Groups, each line naming exactly what will happen (APPROVED §8.1 table):
- **Will link** — "Telmisartan 40 mg · linked to your current medicine · no new reminders"
- **Will start tracking** — "Vitamin D3 · 1 capsule once a day from 22 Nov · reminder 9:00 PM" (or "no reminders")
- **Will change** — "Metformin · twice a day from 22 Nov (was once a day) · earlier history kept · reminders 8:00 AM, 8:00 PM"
- **Will add to plan** — "HbA1c test · around 22 Feb 2027 · reminder on"
- **Stays in the record only** — names
- **You’ll decide later** — names
- **Not ready** — names, with reason
**Buttons:** **Confirm Changes** (primary; label shows the count, e.g. "Confirm 3 Changes") · **Back to Medicines**. With no changes chosen: **Finish Without Changes**.

**On Confirm (APPROVED B2, B5, RX-MAT-20):**
- Rechecks the person’s current medicines first. If something changed meanwhile (e.g. on another device): "Your medicines changed since you started" → the affected cards reopen for review; nothing is overwritten.
- Applies each chosen change once; a retry or double tap never adds a second course, schedule or reminder.
- Records each decision (including Record Only and Decide Later, so it can be resumed) and the current-use answers.
- Partial failure: the successful changes stay; the failed ones are listed on S-RX-05 with **Retry**. Never "all done" unless all were done.
- Creates no dose entries: Taken/Skipped come only from the person later (APPROVED §8.2).

## 9. States
| State | What the person sees |
|---|---|
| Matching | Card skeletons, "Checking against your medicines…" |
| No medicines tracked yet | Every card is New medicine; no comparisons |
| All decided | Progress "3 of 3 decided"; Review Changes highlighted |
| Offline | "You’re offline. You can choose now; we’ll apply changes when you’re back online." Confirm reads **Confirm When Online** (PROPOSED) |
| Matching unavailable | "We couldn’t compare with your medicines right now." Only Record Only and Decide Later offered; **Try Again** (APPROVED: never a false "no match") |
| Notification permission off | As §6 |
| Largest text size | Actions wrap below the card text; nothing clipped |

## 10. Data
- **Already saved before this screen:** the record and transcription (S-RX-03).
- **Saved on Confirm:** links between the prescription line and an existing course; new courses with a first schedule version; new schedule versions with effective dates for changes; reminder plans only where switched on; tasks for chosen tests/follow-ups; decisions for every medicine (including Record Only / Decide Later); current-use answers with time.
- **Never:** dose events, deleted or overwritten history, changes to medicines that aren’t on this prescription, a restart or stop the person didn’t choose (APPROVED B4).
- **Privacy:** no medicine names in logs or analytics (rule 8); reminder notification text stays private by default ("Time for your medicine") (APPROVED B5; exact copy OPEN-5).

## 11. Requirement trace
RX-MAT-01–20 (each mapped in §5; 17 via 4C/bypass; 18 via footer and no prompts; 20 via §8) · B1 (record stays saved) · B2 (course, schedule and task dedupe) · B3 (five choices, no preselection, comparison, effective date, final confirmation) · B4 (no auto restart/stop/substitution/guessed schedules; record-only always available) · B5 · MF-D04 (prescription vs your tracking), MF-D06, MF-D07, MF-D08 · RX-VER-03, 05, 06 · §8.1 final review · §8.2 lifecycle distinctions.

## 12. Acceptance tests (MAT-AC mapped)
| ID | Given / when | Then |
|---|---|---|
| AT-04-01 | New medicine, Record Only, Confirm | No course or reminder created (MAT-AC-01) |
| AT-04-02 | New medicine, Track New, Confirm | One course linked to the source; a retry returns the same result |
| AT-04-03 | Same regimen already tracked, Link to Existing | Course and reminder counts unchanged; both prescriptions retrievable (MAT-AC-02) |
| AT-04-04 | Other brand, same ingredient, no reference data | Shows only after the person says so; no automatic link (MAT-AC-03) |
| AT-04-05 | 50 mg tracked, 75 mg prescribed, Cancel | Current schedule unchanged (MAT-AC-04) |
| AT-04-06 | Review Change confirmed | New version from the chosen date; earlier doses and history kept |
| AT-04-07 | Once → twice a day | Needs Review Change and confirmation; no second schedule (MAT-AC-05) |
| AT-04-08 | Immediate vs extended release | Needs careful review; not linked by name (MAT-AC-06) |
| AT-04-09 | Paused medicine on the prescription, no action | Stays paused, no reminders restart; reason visible (MAT-AC-07) |
| AT-04-10 | Completed course re-prescribed, Review New Course | Separate course with its own dates; old one unchanged (MAT-AC-08) |
| AT-04-11 | Reaction on record | Sheet W shown; Suspected/Confirmed distinct; only Record Only / Decide Later (MAT-AC-09) |
| AT-04-12 | Older prescription | Current schedule unchanged; Review Tracking asks Sheet U (MAT-AC-10) |
| AT-04-13 | Sheet U → No / Not Sure | No tracking change; answer saved (MAT-AC-11) |
| AT-04-14 | Ineligible item | In Not ready group; no Track action (MAT-AC-12) |
| AT-04-15 | Morning 1 tablet + night ½ tablet | One course with two dose rows (MAT-AC-13) |
| AT-04-16 | Taper | Record Only / Decide Later only, with explanation (MAT-AC-14) |
| AT-04-17 | PRN tracked | No daily doses; no Missed ever generated (MAT-AC-15) |
| AT-04-18 | Conflicting doctors | Both sources visible; Review Change only after "checked with my doctor" (MAT-AC-16) |
| AT-04-19 | No medicines | Goes straight to 4C; no task created without a choice (MAT-AC-17) |
| AT-04-20 | Tracked medicine missing from prescription | Stays active, reminders unchanged, no prompt (MAT-AC-18) |
| AT-04-21 | Vaccine prescribed | "Not given yet"; never marked given (MAT-AC-19) |
| AT-04-22 | Double tap Confirm / retry after failure | One result; only failed items retried (MAT-AC-20) |
| AT-04-23 | Medicines changed on another device | Affected cards reopen; nothing overwritten |
| AT-04-24 | Reminders switched on, notifications blocked | Tracking saved; summary says reminders are off on this phone |
| AT-04-25 | Dose times | Empty until chosen; no default clock time ever filled in |
| AT-04-26 | Close mid-way | Prescription stays saved; undecided items saved as Decide Later and resumable |
| AT-04-27 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 13. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Reaction override policy (clinical gate, RX-OD-06, VER-OD-03) | Until specialists decide: no tracking from S-RX-04 for a medicine with a recorded reaction; Record Only / Decide Later only |
| OPEN-2 | Tapers and complex schedules (RX-OD-12) | Not supported in this release: Record Only / Decide Later with explanation |
| OPEN-3 | Brand/ingredient matching needs validated India-relevant reference data (RX-OD-04) | Without it, no automatic "may be the same" label; the person can choose Compare with an existing medicine themselves |
| OPEN-4 | Where planned tests and follow-ups appear (Plan is no longer a tab) | In Today (upcoming) and on the record; decide with the Records design |
| OPEN-5 | Private reminder text | "Time for your medicine" by default; medicine name only if the person turns it on |
| OPEN-6 | Backend: links between prescription lines and courses, schedule versions with effective dates, PRN logging, current-use answers, task dedupe, idempotent per-item confirm (Phases 9 and 12) | Flag to the lead |
| OPEN-7 | M02 Medication Details "Start Taking" (in review) | Align with Sheet U and 4B before M02 is locked |
