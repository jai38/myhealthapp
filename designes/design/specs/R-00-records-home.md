# R-00 · Records home — screen specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-24 · **Flow:** Records tab (first screen).
**Sources (APPROVED):** four tabs Today | Records | Medications | Profile, "Timeline, Documents, Medical Conditions and Health Measurements are within Records" (post-Welcome update, latest navigation); Verification & Recovery v1.0 §5.1 hierarchy (**Records → Medical Timeline · Documents · Medical Conditions · Health Measurements**) and §5.3 ("Records landing: Medical Timeline, Documents, Medical Conditions, Health Measurements"); **RX-VER-07** ("the three primary verification filters belong on the Documents screen … not on the Records landing"); VER-AC-04.2 (Today shortcut goes to Pending, not the landing); RX-VER-13 (one canonical record); DOC-02 §10.1, DOC-04 §7.3 (only verified or explicitly added readings reach Health Measurements); brief §15 B/D (Records, Timeline); locked R-DOC-01, R-DOC-02, S06 v1.1, tab bar and header patterns (Calm Glass UI v4).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

---

## 1. Objective
A calm front door to everything the person has recorded: four clear places in the approved order, the latest few documents, and one way to add more. No verification work happens here (APPROVED RX-VER-07).

## 2. Entry and exit
| From | Behaviour |
|---|---|
| Tap the **Records** tab | Opens R-00 at the top (PROPOSED: tapping the tab again while inside Records returns here) |
| Today → Records to Review | **Skips R-00**, opens R-DOC-01 Pending (APPROVED VER-AC-04.2); Back from Documents then returns to Today |
| Back from R-DOC-01 opened from here | R-00 |

## 3. Content hierarchy (top to bottom; PROPOSED)
1. **Header:** large title **Records** (Large Title 34/40) · search icon. If the account manages more than one profile, the existing profile line: "Ananya Sharma · Switch".
2. **Four sections**, one glass card with four rows, in the **approved order** (min height 68, icon chip, title, one-line summary, chevron):
   | Row | Summary line (PROPOSED copy) | Opens |
   |---|---|---|
   | **Medical Timeline** | "Latest: Hospital stay · 3–7 Nov" | Timeline (not yet designed; §5) |
   | **Documents** | "24 documents" | R-DOC-01, **All** (APPROVED default) |
   | **Medical Conditions** | "3 conditions" | Conditions (not yet designed; §5) |
   | **Health Measurements** | "Latest: Blood pressure · 20 Nov" | Measurements (not yet designed; §5) |
   Summaries never show a value, result, diagnosis or status judgement (no "high", "normal", "3 to check") — only counts, the latest entry’s type and its date (PROPOSED, R00-OD-3).
3. **Recently added** — the 3 most recently **added** documents as R-DOC-01 rows (same anatomy, status chips and Verify/Continue pills), then **See All Documents** → R-DOC-01 All sorted by Recently added (PROPOSED). Restricted records appear as the neutral "Restricted record" row (APPROVED DOC-08 §4).
4. **+ Add Record** floating pill above the tab bar → S-RX-01 (same as R-DOC-01, APPROVED R01-OD-8).
5. Tab bar (locked), Records selected.

## 4. Search (PROPOSED)
The search icon opens the R-DOC-01 search (documents only in this release; same rules: no restricted matches, searches All). When Timeline, Conditions and Measurements exist, search will cover them too — a later change.

## 5. Sections not built yet (PROPOSED; R00-OD-1)
Until Medical Timeline, Medical Conditions and Health Measurements are designed and built, their rows stay visible in the approved order with the summary "Coming soon" in secondary text and no chevron; tapping does nothing and the screen reader says "Medical Timeline, coming soon, dimmed". This keeps the approved structure stable so the layout doesn’t change when they arrive.

## 6. States
| State | What the person sees |
|---|---|
| Loading | Header, the four rows with skeleton summaries, 3 skeleton recent rows |
| First time (no documents) | Summaries "Nothing yet" (or "Coming soon"); Recently added replaced by a card: "Your records will appear here." · **Add Health Record** (→ S-RX-01); no floating pill |
| With documents | As §3 |
| Fewer than 3 documents | Only those rows; See All still shown |
| Restricted in recent | Neutral row; Face ID on tap (APPROVED) |
| Offline | Banner "You’re offline · showing records saved on this phone"; counts shown from the phone |
| Profile switched | Summaries and recent list for the new profile only (APPROVED patient isolation) |
| Largest text size | Rows wrap; nothing clipped |

## 7. Data and privacy
Reads counts, latest-entry type/date and the 3 newest documents for the selected profile; writes nothing. Counts include restricted records without naming them. Nothing from this screen appears in notifications or widgets (PROPOSED).

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-R00-01 | Tap Records tab | Four rows in order: Medical Timeline, Documents, Medical Conditions, Health Measurements (§5.3) |
| AT-R00-02 | Records home | No All / Pending / Verified filters here (RX-VER-07) |
| AT-R00-03 | Tap Documents | R-DOC-01 with All selected |
| AT-R00-04 | Today → Records to Review | Goes to Pending directly, not via R-00 (VER-AC-04.2) |
| AT-R00-05 | Recently added | 3 newest by added date; status chips and actions as R-DOC-01 |
| AT-R00-06 | See All Documents | R-DOC-01 All, sort Recently added |
| AT-R00-07 | Restricted newest | Neutral row; no type or lab |
| AT-R00-08 | Unbuilt sections | "Coming soon", not tappable, announced as dimmed |
| AT-R00-09 | Summaries | No values, results or judgements |
| AT-R00-10 | First time | Add Health Record card; no pill |
| AT-R00-11 | Offline / profile switch | Banner / new profile only |
| AT-R00-12 | Largest text size, light and dark; screen reader | Wraps; contrast passes; rows read title + summary |

## 9. Decisions for you (OPEN)
| ID | Decision | Recommendation |
|---|---|---|
| R00-OD-1 | Sections not built yet | Show in order as "Coming soon", not tappable |
| R00-OD-2 | Recently added on this screen | Yes — 3 newest, with See All |
| R00-OD-3 | Summary lines | Counts and latest type/date only; never values or judgements |
| R00-OD-4 | Pending count on the Documents row | No — Today’s row and the Documents filter already cover it (keeps verification off the landing, RX-VER-07) |
| R00-OD-5 | Tapping Records tab again | Returns to R-00 from anywhere inside Records |
| R00-OD-6 | Search scope | Documents only for now; widen when the other sections exist |
