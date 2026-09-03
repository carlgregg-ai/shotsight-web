# ShotSight Stage 5 — Playbook UX (IN PROGRESS)

Date: 2026-09-03
Status: **IN_PROGRESS**

## Completed durable tranche

- Added `playbook.js`, a mobile-first Playbook controller that:
  - loads the certified Stage 4 representative lesson set;
  - supports plain-language filtering across lesson names, aliases, coaching text, symptoms and candidate mechanisms;
  - renders compact presentation cards;
  - opens a progressive-disclosure lesson sheet;
  - keeps coaching evidence labels visible (DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD_DEMOTE);
  - shows a discriminating diagnostic question, candidate causes, corrective action and retest;
  - exposes visual-lesson requirements and warnings;
  - escapes rendered lesson text before injecting HTML.
- Added `playbook.css` with phone-first cards, sticky search, full-width mobile lesson sheet, readable evidence labels and a larger centred desktop sheet.
- `playbook.js` was syntax-checked locally with `node --check` before commit.
- No existing production navigation or page markup has yet been replaced, so the current hosted prototype is not intentionally broken by this tranche.

## Remaining before Stage 5 can pass

1. Integrate Playbook markup into `index.html` without removing the useful existing shot-type demos; recommended approach is to make Learn the Playbook landing view and retain demos as a secondary visual-guides section.
2. Add `playbook.css` and `playbook.js` to the document load order with cache-busting version strings.
3. Ensure page title/nav wording reads `Playbook` rather than the current generic Learn fallback.
4. Add search intent handling for phrases that include a miss, so `behind on a crosser` and `underneath teal` visibly enter Diagnose context rather than behaving as ordinary lesson filtering only.
5. Test empty/error/loading states.
6. Run mobile-width and desktop-width interaction QA; check close/back behaviour and sheet scrolling.
7. Run browser console/runtime checks against the integrated page.

Stage 5 is **not complete** and Stage 6 must not begin until these items are integrated and verified.
