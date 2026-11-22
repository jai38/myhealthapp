# S-RX-02 · Review Your Document — functional specification

**Status:** REVIEW (spec only; no visual design) · **Date:** 2026-11-22 · **Stage:** 2 of 5 (S-RX-01 → **S-RX-02** → S-RX-03 → S-RX-04 → S-RX-05).
**Sources:** Continuation brief §6 (stage S-RX-02); Medication Reconciliation v1.0 §5 (stage table), §6 (document duplicate layer); Document Classification v1.0 CLR-05, CLR-07, §5; Verification & Recovery v1.0 §2 (save what is available); v0.3 workflow review §4, §8 (reference only); v0.1 draft §3, §7, §12 (reference only); `api.md` documents upload. Locked: S-RX-01 (`specs/S-RX-01-add-health-record.md`), visual baseline `8c62eb0`.
**Labels:** APPROVED = in the approved specifications · DECIDED = owner decision already recorded · PROPOSED = my recommendation, needs approval · OPEN = needs a decision or backend/specialist input.

## 1. Purpose
Let the person check that every page is clear, upright and in the right order, fix that quickly, and send the document for reading. On Continue the pages are uploaded and checked for an **exact copy** of a document the person already saved. Nothing is classified, read or saved as a record here; the record is saved at S-RX-03.

## 2. Entry and exit
| From / to | Behaviour | Status |
|---|---|---|
| S-RX-01 → Continue | Opens here with the selected pages in order (photos, or one PDF) | APPROVED |
| Back | Returns to S-RX-01 with all pages and edits kept (S-RX-01 owns the discard dialog) | PROPOSED |
| Continue → upload → no exact copy | Opens S-RX-03, where reading and the document-type suggestion happen | APPROVED |
| Continue → exact copy found | Duplicate sheet on this screen (§7) before anything is read | APPROVED (CLR-07, B2) |
| View Saved Record (from the duplicate sheet) | Opens the existing record's details; this upload is cleared | APPROVED |

Pushed full screen, no tab bar, Calm Glass v4, light and dark.

## 3. Content hierarchy (top to bottom)
1. **Navigation bar:** glass back button; title **"Review Your Document"**; page position on the right, e.g. **"2 of 3"**.
2. **For line:** "For: You · <name>" (same as S-RX-01; DECIDED D-RX-1).
3. **Page preview:** the current page large, on a soft card; pinch to zoom, double-tap to fit; swipe left/right between pages.
4. **Quality note** (only when the page is flagged; PROPOSED copy): amber note "This page may be hard to read" / "It looks blurry or too dark. Retake it for a better result, or continue." + **Retake** (photos only).
5. **Page tools** (one row of labelled icon buttons under the preview):
   - Photos: **Rotate**, **Crop**, **Retake**, **Remove**.
   - PDF: **Rotate** only (DECIDED in S-RX-01: "a PDF is added as it is").
6. **Page strip:** thumbnails numbered 1…n, the current one outlined; long-press and drag to reorder (photos only); **Add Page** tile at the end (photos only, up to 10 pages).
7. **Hint line:** "Check every page is clear and in the right order."
8. **Primary button, pinned bottom: "Continue"**. While uploading it shows progress ("Uploading 2 of 3…") and is not tappable; a text button **Stop** sits under it.

Not on this screen (APPROVED): no document type, no AI result, no extracted text, no medicine or reminder options.

## 4. Controls and interactions
| Control | Behaviour | Status |
|---|---|---|
| Swipe / tap thumbnail | Shows that page; "2 of 3" updates | PROPOSED |
| Rotate | Turns the current page 90° clockwise; Undo toast | APPROVED (rotate) |
| Crop | Opens a crop view with corner handles. For camera photos the handles start at the detected page edges; **Reset** returns to the full original. Done / Cancel | APPROVED (crop); edge start PROPOSED |
| Retake | Opens the camera for this page only; the new shot replaces it in the same position. Undo restores the old shot | APPROVED |
| Remove | Confirmation sheet: "Remove page 2?" / "It won’t be part of this record." **Remove** / **Cancel**. Then Undo toast. The last remaining page can’t be removed (use Back instead) | APPROVED (visible confirmation) |
| Reorder | Long-press a thumbnail and drag; Undo toast | APPROVED |
| Add Page | Sheet: Take Photo / Choose from Photos (same rules as S-RX-01) | APPROVED |
| Continue | Builds the document for upload (§6), uploads it, runs the exact-copy check, then opens S-RX-03 | APPROVED |
| Stop (during upload) | Dialog "Stop uploading?" / "Your pages stay on this screen." **Stop** / **Keep Uploading**. Stopping cancels the upload and removes anything already sent | PROPOSED; server removal is OPEN-2 |
| Back | Returns to S-RX-01 with pages and edits kept. During an upload, Back acts like Stop | PROPOSED |

Every edit is reversible with Undo until Continue. Edits never change the original files (§6).

## 5. States
| State | What the person sees | Status |
|---|---|---|
| Ready | Preview, tools, strip, Continue enabled | — |
| Page flagged | Amber quality note on that page and a small dot on its thumbnail; Continue still enabled (never blocked) | APPROVED (never hide scan problems; never block saving) |
| Uploading | Progress in the button; tools and strip disabled; Stop available | PROPOSED |
| Exact copy found | Duplicate sheet (§7) | APPROVED |
| Upload failed | Red note "Upload didn’t finish" / "Check your connection and try again. Your pages are still here." **Try Again**. Retrying reuses the same upload and never creates a second copy | APPROVED (RX-MAT-20 retry, idempotency) |
| File rejected by the server | "We couldn’t upload this file. It may be damaged. Try another copy." Pages remain; Back to S-RX-01 to replace | APPROVED (server checks, CLAUDE rule 7) |
| Offline | Blue note "You’re offline" / "We’ll upload when you’re back online. Keep this screen open, or your pages won’t be kept." Continue reads **Continue When Online**; the upload starts by itself when the connection returns | PROPOSED; consistent with "no draft kept" (S-RX-01 OPEN-3) |
| PDF | Single-page-at-a-time preview of the PDF; only Rotate; no strip reordering or Add Page | DECIDED |
| Largest text size | Tools stack in two rows with labels; nothing clipped | APPROVED (accessibility) |

## 6. Data and save boundary
- **Originals are never changed** (APPROVED MF-D02, Classification §5). Rotate, crop, retake, remove and reorder are kept as a separate edited version plus a page map back to each original.
- **What is uploaded on Continue** (PROPOSED, extends S-RX-01 OPEN-1): one reading copy (the edited pages joined into one PDF, ≤ 10 pages, ≤ 15 MB) **and** the untouched originals (each photo, or the PDF file as picked), linked to the reading copy.
- **Not a saved record yet** (APPROVED B1): the upload is a private staged upload for this person only. It must not appear in Records, Documents, Pending Verification or the timeline until S-RX-03 saves it. Retention of a staged upload that is never saved is OPEN-3.
- **Upload identity** is kept across retries, so a retry or a double tap can’t create two uploads (APPROVED RX-MAT-20).
- **Privacy:** no page images, file names or text in logs or analytics (rule 8); uploads go only through the signed upload route and the server’s checks (rules 5–7).

## 7. Exact-copy check and duplicate sheet
- **What is checked here (APPROVED B2 layer A, phase 1):** the uploaded originals against this person’s already-saved documents, by exact file fingerprint (and per-page fingerprints for photos). Only this person’s documents are compared; nothing about other people is ever shown (APPROVED patient isolation).
- **Not checked here:** look-alike rescans, cropped versions and "same visit" matches need the document to be read; they are checked at S-RX-03 before saving (APPROVED B1 second check). A matching medicine is never treated as a matching document (APPROVED).
- **Duplicate sheet** (PROPOSED layout and copy):
  - Title "You’ve already saved this document"; a card with the saved record’s thumbnail, document type, document date (or "No date"), saved date and page count.
  - **View Saved Record** (primary): opens it; this upload is discarded; nothing new is created.
  - **Save as a Separate Record** (secondary): explanation "Only if this is a different visit or a new copy you need to keep." Continues to S-RX-03 as a new upload, with the link to the earlier record kept for reference.
  - **Cancel**: back to this screen with pages intact.
  - Nothing is deleted or merged automatically, and re-uploading never starts any medicine tracking (APPROVED CLR-07, B2).

## 8. Requirement trace
S-RX-02 stage (brief §6; Reconciliation v1.0 §5) · B1 (document saved only at stage 3; staged upload before) · B2 layer A exact check · B5 (patient isolation, recovery, accessibility, privacy) · CLR-05 (mixed PDFs: split suggestion needs reading, so it happens at S-RX-03) · CLR-07 (warn and offer the existing record) · MF-D02 (originals preserved) · RX-VER-02 (save what is available) · RX-MAT-20 (retry and idempotency) · RX-OD-18/19 (file bounds, staged-upload retention) · CLAUDE.md rules 5–8.

## 9. Acceptance tests
| ID | Given / when | Then |
|---|---|---|
| AT-02-01 | Arrive from S-RX-01 with 3 photos | Page 1 shown large, "1 of 3", strip with 3 thumbnails, tools for photos, Continue enabled |
| AT-02-02 | Arrive with a PDF | Only Rotate; no reorder, Add Page, Crop, Retake or Remove |
| AT-02-03 | Rotate page 2, then Undo | Page returns to its original orientation |
| AT-02-04 | Crop a camera photo, then Reset | Full original page restored |
| AT-02-05 | Retake page 3 | New shot replaces page 3 in place; Undo restores the old shot |
| AT-02-06 | Remove page 2 | Confirmation sheet first; after Remove, 2 pages remain and Undo is offered |
| AT-02-07 | Only one page left | Remove is disabled |
| AT-02-08 | Drag page 3 to first place | Order and numbers update; Undo restores the old order |
| AT-02-09 | A blurry photo | Amber note and thumbnail dot; Continue still works |
| AT-02-10 | Back | S-RX-01 shows the same pages with the edits kept |
| AT-02-11 | Continue, no existing copy | Upload shows progress, then S-RX-03 opens; the upload is not visible anywhere in Records |
| AT-02-12 | Continue with a PDF already saved before | Duplicate sheet with the saved record’s details; View Saved Record opens it and creates nothing |
| AT-02-13 | Duplicate sheet → Save as a Separate Record | Continues to S-RX-03 as a new upload; no medicine or reminder is created |
| AT-02-14 | Connection drops during upload | "Upload didn’t finish" with Try Again; retry completes with one upload only |
| AT-02-15 | Tap Continue twice quickly | Only one upload exists |
| AT-02-16 | Stop during upload | Confirmation; after Stop, pages remain and nothing stays on the server |
| AT-02-17 | Offline | Offline note; "Continue When Online"; upload starts by itself when back online while the screen is open |
| AT-02-18 | Any path | No document type, AI result, extracted text, medicine or reminder shown or created |
| AT-02-19 | Originals after edits | Original photo/PDF bytes are unchanged and uploaded alongside the edited reading copy |
| AT-02-20 | Largest text size, light and dark | Nothing clipped; tools reachable with labels; contrast passes |

## 10. Open items
| ID | Question | Recommendation |
|---|---|---|
| OPEN-1 | Backend: exact-copy check after upload (file and per-page fingerprints, this person only) | Add to Phase 8 with the multi-page upload work |
| OPEN-2 | Backend: a staged upload must stay out of Records until S-RX-03 saves it, and be removable on Stop. Today `confirm-upload` creates a `Document` that `GET /documents` lists straight away | Add a staged state in Phase 8; list only saved documents |
| OPEN-3 | How long a staged upload that is never saved is kept (privacy review, RX-OD-19) | Delete it automatically after a short period (e.g. 24 hours), confirmed by the privacy review |
| OPEN-4 | Blur/dark/cut-off detection | On the phone, simple image checks only; a hint, never a block; thresholds to be tuned in testing |
| OPEN-5 | Where look-alike duplicates are shown | S-RX-03, before the save (B1); designed with that screen |
