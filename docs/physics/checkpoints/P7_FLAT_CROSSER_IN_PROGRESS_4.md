# P7 — Canonical Flat-Crosser Integrated Simulator — IN PROGRESS checkpoint 4

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified browser/workflow commit: `5c4bdf580e443de80afb36838ff7993d2ee0ba68`
GitHub Actions run: `33887104420` — **SUCCESS**

## Verified this tranche

A browser-facing engineering/debug surface now exists at `p7-debug.html`. It imports the verified P7 canonical flat-crosser and deterministic debug modules directly rather than owning a second motion model.

The surface provides usable Play/Pause, ±1-frame stepping, playback-rate selection and timeline scrub. Rendering is driven by `debugFrame(...)` / `scrubNormalized(...)`; the UI does not create an independent target/gun animation clock.

The engineering projection exposes target mark, bore mark and their camera-origin apparent relationship, plus mandatory telemetry including target position/range/speed, target and gun angular state, signed apparent separation, physical lead, camera-origin apparent lead, shot time, pellet TOF/arrival, intercept validity, method identity/evidence status, provider status and certification flags.

The surface visibly retains the certification lock:

`ENGINEERING PROOF · NOT REALISTIC CLAY CERTIFICATION · NOT INSTRUCTIONAL`

It also explicitly renders `ACQUISITION`, `CONNECTION` and `SPEED_MATCH` as HOLD unless an authorised predicate exists. No fabricated threshold events were added merely to fill the timeline.

A frame-QA table samples start, shot, pellet-arrival neighbourhood and end states from the same model state. A new CI test (`tests/physics-p7-browser-debug-v1.mjs`) checks required controls, certification lock, HOLD rendering, shared-clock state, TEST_ONLY provider status and direct scrub semantics.

The complete P3–P7 workflow, including the new browser contract step, passed in GitHub Actions run `33887104420` at commit `5c4bdf580e443de80afb36838ff7993d2ee0ba68`.

## Gate status

P7 remains **IN PROGRESS**. Static/browser-contract verification is not equivalent to the master programme's required adversarial rendered visual/narrative second review.

No realistic-clay, realistic-ballistics or instructional-motion certification is implied by this checkpoint.

## Exact next action

Perform the adversarial rendered visual/narrative review of `p7-debug.html`, inspecting at minimum start/release-equivalent proof state, pre-shot, shot, pellet-arrival neighbourhood and follow-through/end. Check target/bore geometry, lead-line semantics, event ordering, scrub/frame-step behaviour, mobile layout and that HOLD states are visually unmistakable. If a material visual/narrative defect is found, fail the P7 gate and correct it before completion. If the rendered review passes, document the review artefacts and make the explicit P7 completion/no-go decision before starting P8.
