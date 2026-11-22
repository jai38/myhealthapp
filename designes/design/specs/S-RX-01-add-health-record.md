# S-RX-01 · Add Health Record — functional specification

**Status:** REVIEW (spec only; no visual design yet) · **Date:** 2026-11-22 · **Stage:** 1 of 5 in the connected prescription journey (S-RX-01 → S-RX-05).
**Sources:** Continuation brief 2026-11-22 §2, §6; Document Classification v1.0 §1, §5; Medication Reconciliation v1.0 §5 (stage table); Verification & Recovery v1.0 §2, §5; v0.3 workflow review §3 (reference only); v0.1 draft §4, §13, §14 (reference only); `ayoreni-docs` `api.md` (documents upload limits). Locked baseline `8c62eb0` (visual system, S01–S07, A01–A04).
**Labels:** APPROVED = owner-approved behaviour; DECIDED = owner decision of 2026-11-22 in this session; PROPOSED = my recommendation for this screen, needs your approval; OPEN = needs a decision or specialist/technical input.

## 1. Objective
Let the signed-in person capture or import one medical document (one or more pages) quickly and safely, for their own profile, and hand it to S-RX-02 for review. Nothing is classified, read or saved as a record on this screen.

## 2. Entry paths
| Entry | Status |
|---|---|
| Today (S05 first-time and S06 returning) → Quick Action **Upload Record** | APPROVED |
| S05 Get Started sheet → **Health Record** | APPROVED |
| Records → Documents → Add (+) | PROPOSED; placement depends on Records design (Sankalp) |
| Other contextual "upload a document" shortcuts approved later | APPROVED in principle; each must open this same screen |

The screen opens as a pushed full screen (no tab bar), in the locked Calm Glass v4 style, light and dark.

## 3. Patient
- DECIDED: a fixed line **"For: You"** with the person's name (e.g. "For: You · Asha Test"). No selector and no chevron while an account has one profile. The profile comes only from the signed-in account (verified token), never from the document.
- APPROVED: a name or other identity printed on the uploaded document is not used here; any mismatch is handled later (S-RX-03, RX-OD-10).
- OPEN (future): when family/caregiver access exists, this line becomes a selector listing only authorised profiles, with a warning before switching if pages are already selected.

## 4. Content hierarchy (top to bottom)
1. **Navigation bar:** glass back button; title **"Add Health Record"**.
2. **For line:** "For: You · <name>".
3. **Intro (PROPOSED copy):** "Scan or upload a medical document" / "A prescription, lab report, discharge summary or any other health document. You’ll review what we read before it’s treated as fact."
4. **Three capture options** (large glass rows, ≥ 60 pt, icon + title + one-line hint):
   - **Take Photo** — "Best for paper documents · add several pages"
   - **Choose from Photos** — "Pick one or more pictures"
   - **Upload File** — "PDF, JPG or PNG · up to 15 MB"
5. **Selected pages** (appears only after something is added): page count ("3 pages"), a horizontal strip of thumbnails numbered 1…n with a small source icon (camera / photos / file) and a remove (×) button each, then an **Add Page** tile. Reordering, rotating and cropping happen on S-RX-02, not here.
6. **Tips link (PROPOSED):** "Tips for a clear photo" → small sheet: flat surface, good light, whole page in frame, one document per record.
7. **Primary button, pinned bottom: "Continue"** — disabled until at least one valid page is selected.

Not on this screen (APPROVED): no document category choice, no AI result, no medicine or reminder options.

## 5. Controls and behaviour
| Control | Behaviour | Status |
|---|---|---|
| Take Photo | Asks for camera permission the first time (system prompt). Opens the in-app camera with edge guide. After each shot: **Add Another Page** / **Done**. Returns here with the pages in capture order. Photos are kept inside the app and **not saved to the phone’s gallery**. | APPROVED (camera, multi-page); gallery rule PROPOSED |
| Choose from Photos | System photo picker, multi-select. Pages added in the order picked. iPhone HEIC photos are converted to JPEG on the device before upload. Picking the same photo twice in this session is ignored with "Already added". | APPROVED (multi-image); HEIC and same-photo rule PROPOSED |
| Upload File | System file picker for PDF, JPG, PNG. Checked on the device before it is added: type, size ≤ 15 MB, PDF ≤ 10 pages, not password-protected, readable. A PDF shows as one item with its page count. | APPROVED (file import); limits from `api.md` |
| Mixing | One record is **either** one PDF **or** one or more photos/images. If a PDF is selected, Take Photo / Choose from Photos and Add Page are hidden ("A PDF is added as it is"). Removing the PDF brings them back. | PROPOSED (keeps provenance simple; see OPEN-1) |
| Page limit | Up to 10 pages per record (same as the PDF limit). At 10, Add Page is disabled with "Up to 10 pages per record". | PROPOSED, tied to backend limit |
| Remove (×) | Removes that page from the selection immediately; short undo toast "Page removed · Undo". | PROPOSED |
| Add Page tile | Opens a small sheet: Take Photo / Choose from Photos (images only). | PROPOSED |
| Continue | Opens S-RX-02 with the ordered pages. | APPROVED |
| Back | No pages: returns to where the person came from. With pages: dialog "Discard 3 pages?" — **Discard** / **Keep Editing**. | PROPOSED (draft retention is OPEN-3) |

## 6. States
| State | What the person sees | Status |
|---|---|---|
| Empty (default) | Intro + three options; Continue disabled | — |
| Pages selected | Thumbnail strip, page count, Add Page, Continue enabled | — |
| Preparing | Thumbnail placeholders with a spinner, "Preparing pages…" (large PDF or many photos); Continue disabled until ready | PROPOSED |
| Camera access off | Inline note on the Take Photo row: "Camera access is off. Turn it on in Settings, or choose a photo or file instead." + **Open Settings**. Other options still work | APPROVED fallback principle |
| Photo access off / limited | Same pattern for photos; with limited access only the allowed photos appear | APPROVED fallback principle |
| File not supported | "This file type isn’t supported. Use a PDF, JPG or PNG." File not added | APPROVED |
| File too large | "This file is over 15 MB. Try a smaller file or take photos instead." | APPROVED (limit from API) |
| Too many pages | "This PDF has 14 pages. You can add up to 10 pages per record." | APPROVED (limit from API) |
| Password-protected PDF | "This PDF is password-protected. Remove the password and try again." | APPROVED |
| Damaged / unreadable file | "We couldn’t open this file. Try another copy." | APPROVED |
| Offline | Small note: "You’re offline. You can add pages now. We’ll upload them when you’re back online." Selection and Continue still work | PROPOSED; depends on OPEN-4 |
| App lock | Returning from the system camera/photo/file picker or Settings does **not** trigger the A01 lock; leaving the app for other apps does, and the selection is kept behind the lock | PROPOSED |

Errors never add a broken page, never create a document, and never show invented content.

## 7. Data and save boundary
- **Created on this screen:** nothing on the server. A local, in-app list of pages (original bytes unchanged, order, source: camera / photos / file, file name for files).
- **Save boundary:** none here. The upload starts at S-RX-02; the record is saved only at S-RX-03 (APPROVED B1).
- **Originals:** the bytes captured or picked are the originals and must stay unmodified; S-RX-02 edits (rotate/crop) are kept as separate versions (APPROVED MF-D02, Classification §5).
- **Privacy:** no page images or file names in logs or analytics (rule 8); camera shots not written to the gallery; local files removed when the person discards or finishes.

## 8. Duplicate checks
- Here: only "same photo picked twice in this session" (PROPOSED).
- File/image identity check: S-RX-02. Content duplicate check: S-RX-03 before the record is created (APPROVED B2, CLR-07).

## 9. Accessibility
All options and controls are real buttons with labels; targets ≥ 44 pt; thumbnails announced as "Page 2 of 3, from camera"; works at the largest text size without clipping (options stack, hints wrap); one clear primary action (APR-11); Reduce Motion respected; contrast per the 2026-11-19 values.

## 10. Requirement trace
S-RX-01 stage contract (Reconciliation v1.0 §5) · B1 connected flow, independent save · B2 no duplicates · B5 patient isolation, privacy, accessibility, recovery · Classification v1.0 §1 (scan/upload first, no category before upload) and §5 (preserve originals) · RX-VER-02 originals preserved · RX-OD-10 patient mismatch not resolved here · RX-OD-18 device/file bounds · RX-OD-19 draft retention (open) · CLAUDE.md rules 7 (upload validation, server side) and 8 (no health data in logs).

## 11. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-01-01 | Open from Today → Upload Record | Screen shows "For: You · <name>", three options, Continue disabled |
| AT-01-02 | Open from Get Started → Health Record | Same screen, same state |
| AT-01-03 | Take Photo → 3 shots → Done | 3 thumbnails in capture order, source camera, Continue enabled; nothing in the phone’s gallery |
| AT-01-04 | Camera permission denied | Inline note + Open Settings; Choose from Photos and Upload File still work; no empty page added |
| AT-01-05 | Pick 2 HEIC photos | Both added as JPEG pages in pick order |
| AT-01-06 | Pick the same photo twice | Second pick ignored with "Already added" |
| AT-01-07 | Upload a 16 MB PDF | Error message; nothing added |
| AT-01-08 | Upload a 14-page PDF | "Up to 10 pages per record"; nothing added |
| AT-01-09 | Upload a password-protected PDF | Password message; nothing added |
| AT-01-10 | Upload a valid PDF | One item with its page count; photo options hidden until it is removed |
| AT-01-11 | Add 10 image pages | Add Page disabled with the limit message |
| AT-01-12 | Remove a page, then Undo | Page returns in the same position |
| AT-01-13 | Back with pages selected | Discard dialog; Discard clears local files; Keep Editing keeps the selection |
| AT-01-14 | Continue | S-RX-02 opens with pages in order; no document, category, medicine or reminder has been created |
| AT-01-15 | Any path | No category asked, no AI result shown, no network call that creates a record |
| AT-01-16 | Largest text size, light and dark | No clipped text; all controls reachable; contrast passes |
| AT-01-17 | Offline | Pages can be added and Continue works; offline note shown |
| AT-01-18 | Return from photo picker | App lock not triggered; selection intact |

## 12. Open items for this screen
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | The API stores one file per document. How do several photos become one record? | The app joins the pages into one PDF on the device (≤ 10 pages, ≤ 15 MB) and also keeps each original image as provenance; backend to confirm storage of the per-page originals. Alternative: a multi-file document on the backend |
| OPEN-2 | Can one record mix a PDF and photos? | No, for now (see §5 Mixing) |
| OPEN-3 | Keep an unfinished selection if the app is closed? (RX-OD-19, privacy policy) | Not for this release: discard with confirmation; revisit with the privacy review |
| OPEN-4 | Offline upload queue (VER-OD-06) | Allow selection offline; S-RX-02 queues the upload with an honest "waiting to upload" state |
| OPEN-5 | Multi-profile selector | Deferred until family access exists (decision of 2026-11-22) |
