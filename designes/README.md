# AYORENI — Design files

**Source of truth: Claude Design canvas → https://claude.ai/artifact/7f6T8pLUF6V4CTzCKeYmU9**
All new screens are designed there. `claude-design/` holds a backup of the canvas source (`.dc.html` per screen, with Theme and State props). The HTML/PNG mockups in `design/mockups/` are the older static versions of S01–S07, kept for reference.

Design source for the AYORENI health app (Calm Glass UI).

| Path | What it is |
|---|---|
| `design/colour-shape-spec.md` | Frozen design system: colours, shapes, shadows, font, type scale |
| `design/calm-glass-ui-brief.md` | Visual design language brief |
| `design/screens.md` | Screen-by-screen status (locked / in review) |
| `design/mockups/*.html` | Screen mockups (402×874pt), open in a browser |
| `design/mockups/*.png` | 3x renders of each screen and state, light and dark |
| `assets/logo/` | Final glossy "A" + pulse logo (PNG / WebP) |

Screens S01–S06 are locked; S07 (dose update sheet + Mark as Taken toast) is in review.

## Where designs live

All AYORENI designs are pushed to the **`designes/initial-upload`** branch only.
Developers should take designs from this branch, not from `main`.
