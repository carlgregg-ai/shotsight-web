# ShotSight Stage 5 — Playbook UX (IN PROGRESS)

Date: 2026-09-03
Status: **IN_PROGRESS — integration tranche complete; runtime QA remains**

## Newly completed and persisted

- Integrated the certified Playbook into the existing `learnView` through `v02.js` without removing the existing shot-type demonstrations.
- Changed the Learn navigation/title presentation to `Playbook` while preserving the same app view architecture.
- Added mobile-first Playbook landing markup, search field, lesson count, evidence-labelled cards, lesson sheet and retained visual-guides section.
- Added cache-busted dynamic loading of `playbook.css` and `playbook.js`; Playbook initialisation is resilient whether the asset loads before or after `DOMContentLoaded`.
- Added explicit search-intent detection. Phrases such as `behind on a crosser`, `underneath teal`, `missing above`, `stopping` and similar miss-language enter a visible Diagnose mode, rank diagnostic evidence and open the lesson with the diagnostic section first.
- Added Learn-mode feedback for presentation-only searches.
- Improved empty, loading and fetch-error states. A data-load failure preserves the Playbook shell and allows retry instead of destroying the search UI.
- Added Escape-key closing, backdrop closing, body-scroll locking, modal semantics and mobile sheet overscroll containment.
- Preserved DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD_DEMOTE evidence labels in the rendered coaching UI.
- Did not alter or broaden any Stage 4 coaching content or evidence permissions.

## Verification completed this tranche

- Re-read the pre-integration `index.html`, existing Stage 5 checkpoint, `v02.js`, `playbook.js` and `playbook.css` before mutation.
- Re-read updated repository files after commits to confirm the intended source state persisted.
- Checked initialization ordering against the existing script order: `v02.js` runs before `DOMContentLoaded`, creates the replacement `demoGrid`, then the pre-existing shot-demo DOMContentLoaded handler can initialise against that retained grid. `playbook.js` also handles post-DOMContentLoaded loading explicitly.
- Checked failure-path logic and corrected an initial retry bug so a failed data fetch no longer destroys the Playbook shell.

## Still required before Stage 5 may pass

1. Browser/runtime QA against the integrated hosted page, including console errors and successful JSON fetch.
2. Mobile-width interaction QA: search, diagnosis-intent banner, lesson open, diagnostic-first scroll, sheet close/backdrop/Escape where applicable, scrolling and retained visual demos.
3. Desktop-width interaction QA for the same flows.
4. Confirm the deployed GitHub Pages version corresponds to the committed source after propagation.
5. Fix any runtime or visual regressions found, then replace this partial checkpoint with a verified Stage 5 completion checkpoint.

## Recovery instruction

Resume at **Stage 5 runtime/deployment QA only**. Do not redo Stages 1–4 or the completed Stage 5 integration work unless verification exposes a regression. Stage 6 must not begin until the hosted/runtime checks pass.
