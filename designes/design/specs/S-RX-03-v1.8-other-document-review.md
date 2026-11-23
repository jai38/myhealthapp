# S-RX-03 v1.8 · Other medical document review — change specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-23 · **Changes:** the locked S-RX-03 v1.0–v1.7 for **Other Medical Documents only**. With v1.8, every one of the nine types has its own view 3C; the v1.0 "basic details" form is no longer used by any type.
**Reason:** owner decision DOC09-OD-01 (DOC-09 v1.0, approved 2026-11-23).
**Sources:** DOC-09 v1.0 §3–§11 (APPROVED); S-RX-03 v1.0 (type picker, item sheet, save boundary, Not-your-document, look-alike sheet), v1.5/v1.6 (link sheet), v1.7 (keep-restricted sheet) — locked; CLR-06, CLR-08, CLR-09, QA-DOC-09 (APPROVED).
**Labels:** APPROVED · PROPOSED (needs approval) · OPEN.

## 1. What changes and what doesn’t
| Part of S-RX-03 | v1.8 |
|---|---|
| 3A Reading, mixed file, Not-your-document | Unchanged |
| 3A "Couldn’t read" state | Unchanged; its **Save as Other** path now lands in the unreadable variant (§2.3) |
| 3B type | Unchanged; unclassifiable → existing picker, nothing preselected (APPROVED CLR-09). Hint when Other is suggested: "This looks like a medical certificate from Dr. Meera Iyer, 20 Nov 2026." (PROPOSED copy) |
| 3C Prescription … Genetic (v1.0–v1.7) | Unchanged |
| **3C Other Medical Document** | **Replaced:** basic-details form becomes the review below |
| Save boundary, statuses, one-record rule | Unchanged |
| Look-alike sheet | Other wording (§5) |
| **After saving (other):** related-record link; blood group | Added (DOC-09 §7.2–7.3) |
| S-RX-04 | **Not used** |
| S-RX-05 | Structure unchanged; lines inside existing groups (§6) |

## 2. View 3C · "Check your document"
### 2.1 Layout
**Header:** title "Check your document"; **Original** button.
**Progress:** "3 of 4 details checked".
**Disclaimer:** "This document is kept as written. Ayoreni doesn’t act on what it says." (APPROVED DOC-09 §5).

Groups, in this order (PROPOSED):
1. **Details:** Title (as printed; editable) with the subtype tag beside it ("Medical certificate" · **Change**) · Name on document · Date · Issuer. One **Confirm Details**; each row editable.
2. **From the document** (subtype extras, only when printed), verbatim with quotes: e.g. "“Rest advised from 24 to 28 Nov 2026”", "“For office”". Confirm per item is optional.
3. **Reference numbers:** "Certificate no. •••• 2207" with **Show** (policy, claim, UDID the same).
4. **Text from the document** (collapsed, optional): the page text; a footnote "Kept as text. Nothing here is added to your medicines or results."

Subtype picker (tap **Change**): the seven subtypes as a list, current one ticked (APPROVED DOC09-OD-02).

### 2.2 "This may be a …" banner (APPROVED DOC09-OD-06)
At the top of the view when another category’s content is found: info card "**This may be a prescription.** It lists medicines with doses. Checking it as a prescription lets you choose what to track." **Check as Prescription** (primary) · **Keep as Other**. Keep as Other collapses the banner to one line "Kept as Other · medicines kept as text only". Choosing the other type opens that type’s 3C on the same original (CLR-06). For genetic content, the banner says "This may be a genetic report. It’s been restricted." and the v1.7 restriction applies before any choice (APPROVED CLR-08).

### 2.3 Unreadable variant (APPROVED DOC09-OD-07, QA-DOC-09)
Notice "**Ayoreni couldn’t read this document.** You can still keep it. Give it a name so you can find it later." · one empty **Title** field (placeholder "e.g. Old clinic letter") · optional **Date** ("Add if you know it") · **Retake Photo** link. No other fields, nothing pre-filled. Save → **Save Record** saves Unverified.

### 2.4 Blood group card
Extra row in "From the document": "Blood group · **B+** (as printed)" with Confirm. Added to the profile only after saving (§4).

## 3. Saving (other)
| Situation | Primary | Secondary |
|---|---|---|
| Details resolved | **Save Record** | — |
| Some unresolved | Sheet P ("3 of 4 details checked · date not checked") with **Save & Verify Later** / **Keep Checking** | — |
| Unreadable, title typed | **Save Record** (Unverified) | — |
| Unreadable, title empty | **Save Record** disabled; hint "Add a name to save" | — |

## 4. After saving · other sheets
Each only if it applies, before S-RX-05 (APPROVED DOC-09 §10 order):
1. **Related record** (DOC09-OD-03): "Is this related to your visit with Dr. Meera Iyer on 20 Nov?" — card pairs the document with the record. **Link** / **Not the Same** / **Not Now**; several → list, none preselected, + **None of These**.
2. **Blood group** (DOC09-OD-04):
   - Profile empty: "Add blood group B+ to your health profile?" **Add** (labelled "From your blood group card · <issuer>") / **Not Now**.
   - Profile differs: "Your profile says O+. This card says B+." **Keep O+** · **Use B+** · **Decide Later** (none preselected).

## 5. Look-alike check (other wording; PROPOSED copy)
"This looks like a document you’ve already saved." **It’s an Updated Copy** ("For example, a renewed card or an extended certificate") · **It’s Different** · **Cancel Upload**.

## 6. S-RX-05 lines (inside existing groups; PROPOSED copy)
"Medical certificate saved · Verified" · "Document saved · not verified" (unreadable) · "Linked to your visit · Dr. Meera Iyer, 20 Nov" · "Blood group added to your profile · B+".

## 7. States added
| State | What the person sees |
|---|---|
| Other review | Details with subtype tag, extras, reference number, text collapsed |
| Subtype picker | Seven subtypes, current ticked |
| This may be a … | Banner with Check as Prescription / Keep as Other |
| Unreadable | Notice, empty title, optional date, Retake Photo |
| Some unresolved at save | Sheet P with counts |
| After save · related record | Link / Not the Same / Not Now |
| After save · blood group differs | Keep / Use / Decide Later |

## 8. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-038-01 | Sick-leave certificate | Other review; period verbatim; no reminder (OTH-QA-01) |
| AT-038-02 | Blurry photo | Unreadable variant; empty title; save disabled until named (OTH-QA-02) |
| AT-038-03 | No title printed | Title field empty (OTH-QA-03) |
| AT-038-04 | Medicines found | Banner; Keep as Other → text only (OTH-QA-04) |
| AT-038-05 | Check as Prescription | Prescription 3C on the same original; no re-upload |
| AT-038-06 | Genetic content found | Restricted before choice (OTH-QA-05) |
| AT-038-07 | Policy number printed | Masked with Show (OTH-QA-06) |
| AT-038-08 | Blood group card, profile empty / different | Add sheet / conflict sheet; nothing changes without a choice (OTH-QA-07, 08) |
| AT-038-09 | Subtype changed | Tag updates; nothing else changes |
| AT-038-10 | Any Other screen | Disclaimer; no validity or eligibility wording (OTH-QA-12) |
| AT-038-11 | Other document types | Unchanged from v1.0–v1.7 |
| AT-038-12 | Largest text size, light and dark | Nothing clipped; contrast passes |

## 9. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | "This may be a …" primary action | Check as <type> primary — the safer path keeps the category’s rules |
| OPEN-2 | Unreadable: allow saving without a title | No — a name is required so the record can be found |
| OPEN-3 | Retire the v1.0 "basic details" form | Yes — no type uses it after v1.8; keep it in the spec history only |
