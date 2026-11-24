# M01 · Medications list — screen specification

**Status:** APPROVED 2026-11-24 (owner: "approve M01 with recommendations"; all PROPOSED items and M01-OD-1–6 recommendations accepted) · design REVIEW · **Date:** 2026-11-24 · **Flow:** Medications tab (first screen).
**Sources (APPROVED):** **ST-01 Status vocabulary** (locked 2026-11-24: medicine statuses, labels, flags, where each appears); **M02 v1.1** (locked: what opens from each row; Start Taking, Start a New Course, as needed, reaction, corrected); S-RX-04 v1.0/v1.1 and S-RX-05 ("View Medicines", "you can stop them in Medications"); `api.md` `GET /medications?status=` (INACTIVE · ACTIVE · PAUSED · COMPLETED · DISCONTINUED); four tabs (Today | Records | Medications | Profile); R-00 / R-DOC-01 list patterns (header, search, floating Add pill, offline, profile line); rules 10–15 (nothing becomes tracked without the person; historical prescriptions default inactive; `nameAsWritten` separate); locked tab bar and Calm Glass UI v4.
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

---

## 1. Objective
Show every medicine the person has, grouped so what they take now is obvious, and open M02 for anything else. The list never logs doses or changes a medicine by itself (APPROVED ST-01 §5: no dose chips here except the next-dose line).

## 2. Entry and exit
| From | Opens |
|---|---|
| Medications tab | M01 at the top (tapping the tab again returns here from inside Medications) |
| S-RX-05 **View Medicines** | M01, newly tracked rows briefly highlighted |
| M02 Back | M01 at the same scroll position |
A row → **M02** for that medicine.

## 3. Content hierarchy (top to bottom; PROPOSED)
1. **Header:** large title **Medications** · search icon. Profile line when the account manages more than one profile.
2. **Groups**, each with a section title and count, in this order; empty groups are hidden:
   | Group | Contains (ST-01) | Order inside |
   |---|---|---|
   | **Taking now** | Active, scheduled | By next dose time |
   | **As needed** | Active + As needed | A–Z |
   | **Paused** | Paused | Most recently paused first |
   | **Not in your daily list** | Not in daily list (from older prescriptions) | Newest source first |
   | **Finished** (collapsed, "Show 4") | Stopped and Completed | Most recently ended first |
3. **+ Add Medication** floating pill above the tab bar (§6).
4. Tab bar (locked), Medications selected.

## 4. Row anatomy (PROPOSED; words from ST-01)
Glass card rows, min height 68, whole row → M02.
| Part | Content |
|---|---|
| Icon chip | Pill (medicine) or drop (supplement), as S06 |
| Line 1 | Name (`normalizedMedicineName`, else `nameAsWritten`), as M02 |
| Line 2 | Strength · form, then the group-specific line: **Taking now** "Next: 8:00 PM" (or "Next: tomorrow, 8:00 AM"); **As needed** "Log when you take it"; **Paused** "Paused since 23 Nov"; **Not in daily list** "From Dr. Rao · 12 Oct 2024"; **Finished** "Stopped 15 Nov" / "Completed 17 Jan" |
| Right | Status chip only where the group doesn’t already say it: **Finished** rows show "✕ Stopped" or "✓ Completed"; other groups show none. Source label "Added by you" only for manually added medicines (Prescribed is the default and not repeated) |
| Flag marker (max one, safety first) | Amber "⚠ Reaction on record" or "⚠ Prescription corrected" under line 2 |

No Mark as Taken, Skip, Pause or Stop on the list (PROPOSED; all in M02 or Today).

## 5. Search (PROPOSED)
Searches name as normalized and as written, across all groups; results keep their group label as a small tag. No results: "No medicines match “metf”." · **Clear Search**.

## 6. Add Medication (PROPOSED)
**+ Add Medication** opens a small sheet: **Scan a Prescription** (→ S-RX-01) · **Add Manually** (→ manual entry, **not designed yet**; until then the option shows "Coming soon" and is not tappable; OD-4) · **Cancel**.

## 7. States
| State | What the person sees |
|---|---|
| Loading | Header, skeleton group with 3 rows |
| First time (no medicines) | Card: "Your medicines will appear here." · "Scan a prescription and choose what you take — nothing is tracked until you say so." · **Scan a Prescription**; no floating pill |
| Only historical medicines | "Not in your daily list" group only; above it a calm note: "Nothing is in your daily list yet. Open a medicine to start it if you’re taking it now." |
| Typical | Taking now (4), As needed (1), Paused (1), Not in daily list (2), Finished collapsed (3) |
| Finished expanded | Rows with Stopped / Completed chips; **Show Less** |
| Flags | Reaction / corrected markers on rows |
| Just tracked (from S-RX-05) | New rows highlighted 2 s (Reduce Motion: "New" marker) |
| Offline | Banner "You’re offline · showing medicines saved on this phone"; next-dose lines from the phone |
| Profile switched | Groups for the new profile only |
| Largest text size | Lines wrap; nothing clipped |

## 8. Data and privacy
Reads the selected profile’s medicines and the next scheduled dose per active course; writes nothing. Nothing from this list in notifications or widgets. No medicine names in logs or analytics (rule 8).

## 9. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-M01-01 | Active, as-needed, paused, inactive, stopped, completed medicines | Each in its group, in the §3 order; empty groups hidden |
| AT-M01-02 | Row tap | M02 for that medicine |
| AT-M01-03 | Taking now row | "Next: <time>" from the schedule; no Taken/Skip buttons |
| AT-M01-04 | Historical prescription saved | In "Not in your daily list"; not on Today (rule 11) |
| AT-M01-05 | Course passes its end date | Moves to Finished as Completed (ST-01 §2) |
| AT-M01-06 | Reaction on record | Amber marker; M02 shows the card |
| AT-M01-07 | Manual medicine | "Added by you" label |
| AT-M01-08 | Search "Tab. Metformin" | Finds by name as written |
| AT-M01-09 | First time | Empty card; Scan a Prescription |
| AT-M01-10 | Offline / profile switch | Banner / new profile only |
| AT-M01-11 | Statuses | ST-01 words, icon + word; contrast passes light and dark |

## 10. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| M01-OD-1 | Group order | Taking now · As needed · Paused · Not in your daily list · Finished |
| M01-OD-2 | Finished group | Collapsed by default with "Show N" |
| M01-OD-3 | Actions on the list | None; everything happens in M02 or Today |
| M01-OD-4 | Add Manually before manual entry is designed | Shown as "Coming soon"; Scan a Prescription works now |
| M01-OD-5 | Status chips on rows | Only in Finished (Stopped / Completed); the group title says the rest |
| M01-OD-6 | Supplements | Same list and groups, drop icon (as Today); no separate tab |
