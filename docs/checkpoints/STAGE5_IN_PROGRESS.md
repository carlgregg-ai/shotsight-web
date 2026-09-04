# ShotSight Stage 5 — Playbook UX (IN PROGRESS)

Date: 2026-09-04
Status: **IN_PROGRESS — runtime QA found and fixed a real integration regression; verification rerun pending**

## Durable work already completed

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

## Runtime QA infrastructure added

A repeatable GitHub Actions browser smoke test now runs the application in Playwright Chromium at both 390×844 mobile and 1280×800 desktop widths. It verifies:

- static app load without browser console/page errors;
- eight certified representative Playbook lessons load from JSON;
- retained visual shot guides initialise;
- `behind on a crosser` enters Diagnose mode and yields a certified result;
- Diagnose-origin lesson opening places the diagnostic section first;
- Escape closes the lesson sheet;
- `high looper` enters Learn mode and yields a lesson;
- close-button behaviour works.

Files: `.github/workflows/playbook-smoke.yml` and `tests/playbook-smoke.mjs`.

## Regression found by first browser run

The first automated browser run failed on both mobile and desktop because the retained visual-guide grid was empty after Playbook integration.

Root cause: `shot-demos.js` populated the original `#demoGrid` at script evaluation time. Later, `v02.js` replaced the entire Learn DOM with the Playbook markup, creating a new empty `#demoGrid`. The earlier manual source-order review had incorrectly assumed the old demo initialisation would run against the replacement node.

This is exactly the kind of integration fault Stage 5 runtime QA was intended to catch.

## Fix persisted

- `shot-demos.js` now exposes `window.renderShotDemoGrid()` and uses it for initial rendering.
- `v02.js` explicitly calls `window.renderShotDemoGrid()` immediately after replacing the Learn DOM.
- No coaching content or evidence permissions were changed.

Latest fix commit: `0d761dce61e90c449698ded80ea9f32fb44d363b`.

## Deployment evidence

Before the new QA workflow was added, GitHub Pages build/deploy for commit `b5a08d4cc834cfacd004c3bfc1febc29fec26631` completed successfully. GitHub Pages builds are also being triggered for the newer QA/fix commits. A successful Pages deploy must be confirmed for the final Stage 5 fix commit before completion.

## Still required before Stage 5 may pass

1. Confirm the Playbook browser smoke QA rerun for commit `0d761dce61e90c449698ded80ea9f32fb44d363b` completes successfully at both viewport sizes.
2. If it fails, inspect the exact browser failure, repair it, persist the fix and rerun; do not waive the gate.
3. Confirm GitHub Pages deployment succeeds for the same final source commit (or a later checkpoint-only commit whose production tree is unchanged).
4. Only after both gates pass, replace this file with `STAGE5_COMPLETION_REPORT.md` and permit Stage 6.

## Recovery instruction

Resume at **Stage 5 CI/runtime verification only**. Do not redo Stages 1–4 or completed Stage 5 implementation. Inspect the latest Playbook browser smoke workflow and Pages deployment first. Stage 6 must not begin unless the browser QA and matching deployment gate both pass.
