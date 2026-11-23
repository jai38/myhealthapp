# S-RX-04 v1.1 · "Summary says stop / hold" — change specification

**Status:** APPROVED 2026-11-23 (owner: "approve S-RX-04 v1.1 with recommendations"; all PROPOSED items and OPEN-1–3 recommendations accepted) · design REVIEW · **Date:** 2026-11-23 · **Changes:** the locked `specs/S-RX-04-reconcile-and-schedule.md` (v1.0, 2026-11-22).
**Reason:** owner decision DOC05-OD-02 (DOC-05 v1.0, approved 2026-11-23).
**Sources:** DOC-05 v1.0 §5 (APPROVED); S-RX-04 v1.0 (locked); RX-MAT-07 (no automatic restart), RX-MAT-16 (conflicts), RX-MAT-18 (omission is not a stop; explicit lifecycle actions only), B3, B4, §8.1–§8.2 lifecycle (APPROVED); `api.md` pause/discontinue routes.
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-04 | v1.1 |
|---|---|
| 4A list, status labels, Compare, "Are you taking this now?", Reaction sheet, 4B setup, 4C tests, finish later | Unchanged |
| **4A: new group "Changes to your current medicines"** | Added, only when the saved document has confirmed stop/hold instructions |
| **New sheet: "Which medicine does this mean?"** | Added (uncertain match) |
| **New view 4E: Review stop / Review pause** | Added (sets up the lifecycle step; nothing saved until 4D) |
| 4D Confirm changes | Gains "Will stop" and "Will pause" groups |
| Commit rules (recheck, once only, partial failure) | Unchanged; apply to stops and pauses too |
| S-RX-05 | Lines for stops and pauses inside the Medicines group (§7) |

**Which documents (PROPOSED, OPEN-1):** any saved document whose confirmed items include an explicit change instruction — discharge summaries (DOC-05) and also prescriptions or consultation notes that write "Stop X" / "Hold X". The rule is the same wherever the instruction comes from.

## 2. 4A · "Changes to your current medicines" (new group)
Shown above "Not ready to track", one card per confirmed instruction (PROPOSED copy):
- Medicine and current tracking: "**Aspirin 75 mg** · Now: 1 once a day, 9:00 PM · active".
- Label (icon + word, amber): **"Summary says stop"** or **"Summary says hold"**.
- The instruction verbatim with its source: "“Stop Aspirin” · Apollo Hospital discharge summary, 7 Nov 2026".
- Actions (none preselected): **Keep Existing** · **Review Stop** (or **Review Pause**) · **Record Only** · **Decide Later**.
- Chosen action shows as a decision chip ("Will stop from 23 Nov", "Keeping as is", "Record only", "Decide later") with **Change**.

The footer stays: "Medicines that aren’t on this summary stay as they are." (APPROVED RX-MAT-18)

**Special cases:**
| Case | Card |
|---|---|
| The instruction names a medicine the person doesn’t track | Info row: "“Stop Pantoprazole” · not in your medicines · kept in the record". No action needed |
| The medicine is already stopped or paused | Info row: "Already stopped on 2 Sep" / "Already paused"; no action |
| The same summary also lists the medicine as a discharge medicine (contradiction) | Label **"Instructions disagree"**; actions Keep Existing · Record Only · Decide Later; **Review Stop** only after "I’ve checked with my doctor" (APPROVED RX-MAT-16 pattern) |
| A medicine with a recorded reaction | Unchanged rules apply to it as a discharge medicine; stopping it is still a normal Review Stop |

## 3. Sheet · "Which medicine does this mean?"
When the instruction can’t be matched for certain to one tracked medicine (name only, other brand, several strengths): "The summary says “Stop Ecosprin”. Which of your medicines does this mean?" List of the person’s active and paused medicines + **None of These**. Choosing one fills the card; **None of These** keeps it as Record Only. Never matched automatically on name alone (APPROVED §6 matching rules).

## 4. View 4E · Review stop / Review pause
**Review stop** ("Stop tracking Aspirin?"):
1. **What the summary says:** verbatim instruction, source and date, link to the page.
2. **What will happen** (plain list): "Reminders for Aspirin stop" · "Future doses are removed from Today" · "Your history stays, including doses you logged" · "You can start it again later as a new course".
3. **From** date: pre-filled with today, editable; the summary date is shown as a hint ("Summary dated 7 Nov") — never back-dated automatically (PROPOSED, OPEN-2).
4. **Reason** (optional, pre-filled, editable): "As per Apollo Hospital discharge summary, 7 Nov 2026".
5. **Add to Plan** (adds it to 4D; nothing changes yet).

**Review pause** ("Pause Metformin?") — for "Hold" instructions:
- Same layout; what will happen: "Reminders pause" · "No doses on Today while paused" · "It won’t restart by itself — you resume it when your doctor says" (APPROVED RX-MAT-07).
- The instruction’s condition is shown verbatim ("Hold until review"); Ayoreni does not set a resume date.

Stopping maps to the existing **discontinue** route with the reason; pausing to **pause** (API exists).

## 5. 4D · Confirm changes (additions)
New groups, each line naming exactly what will happen:
- **Will stop** — "Aspirin 75 mg · from 23 Nov · reminders off · history kept"
- **Will pause** — "Metformin 500 mg · from 23 Nov · won’t restart by itself"
- **Keeping as is** — names (instruction saved in the record)
The button count includes stops and pauses ("Confirm 4 Changes"). On confirm, the existing rules apply: latest-state recheck (e.g. the medicine was stopped on another device → card reopens), each change once, partial failure reported, retry only failed (APPROVED RX-MAT-20).

## 6. After confirming
- Today: the stopped medicine’s future doses disappear; past doses and history stay; Taken/Not confirmed history is unchanged (APPROVED §8.2).
- Medication Details (M02, in review) shows "Stopped on 23 Nov · Reason: As per Apollo Hospital discharge summary" — the same stopped state already designed.
- A paused medicine shows "Paused since 23 Nov" with **Resume Medicine** in M02.

## 7. S-RX-05 lines (inside the Medicines group; PROPOSED copy)
"Stopped · Aspirin 75 mg from 23 Nov — history kept" · "Paused · Metformin 500 mg from 23 Nov" · "Kept as is · Atorvastatin (the summary said stop; you chose to keep it)".

## 8. States added
| State | What the person sees |
|---|---|
| 4A with change cards | "Changes to your current medicines" group with Summary says stop / hold |
| Instructions disagree | Card with the conflict label and limited actions |
| Not tracked / already stopped | Info rows |
| Which medicine? | Matching sheet |
| Review stop | 4E with what will happen, date, reason |
| Review pause | 4E pause variant |
| Confirm with stop and pause | 4D with the new groups |

## 9. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-041-01 | Confirmed "Stop Aspirin", Aspirin tracked | Card "Summary says stop"; nothing changes until 4D confirm (HOS-QA-02) |
| AT-041-02 | Keep Existing | Aspirin unchanged; instruction kept in the record |
| AT-041-03 | Review Stop → Confirm | Discontinued from the chosen date with reason; reminders off; history intact |
| AT-041-04 | Cancel at 4E or 4D | No change |
| AT-041-05 | "Hold Metformin until review" → Review Pause → Confirm | Paused; no resume date; never restarts by itself |
| AT-041-06 | Instruction names an untracked medicine | Info row; no action; nothing changes |
| AT-041-07 | "Stop Ecosprin", tracked as Aspirin 75 mg | Matching sheet; no automatic match |
| AT-041-08 | Summary lists the medicine and also says stop | "Instructions disagree"; Review Stop only after "I’ve checked with my doctor" |
| AT-041-09 | "Continue other medicines" / not mentioned | No card; nothing changes (HOS-QA-03, HOS-QA-04) |
| AT-041-10 | Stopped on another device before confirm | Recheck reopens the card; nothing double-applied |
| AT-041-11 | Double tap Confirm | One stop only |
| AT-041-12 | From date | Pre-filled today; never back-dated automatically |
| AT-041-13 | S-RX-04 without change instructions | Identical to v1.0 |
| AT-041-14 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 10. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Apply to stop/hold instructions in prescriptions and consultation notes too | Yes — same rule wherever the instruction appears |
| OPEN-2 | Default "From" date | Today, editable; the summary date shown as a hint only |
| OPEN-3 | Pre-filled reason | Yes, editable, naming the source document and date |
