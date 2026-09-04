# P7 — Canonical Flat-Crosser Integrated Simulator — IN PROGRESS checkpoint 3

Date: 2026-09-04
Branch: `physics-engine-v1`
Latest verified code commit: `569b5155a10c2aa0c128fab4573937bebc366ee5`
GitHub Actions run: `33881757243` — **SUCCESS**

## Verified this tranche

The P7 engineering debug/scrub control surface is now verified. Frame stepping, timeline scrub and slow-motion playback map directly to the single master simulation clock. Returning to the same scrub time reconstructs the same full state. A high-frame-rate indexing stress case verifies direct `frameIndex -> time` mapping without accumulated subsystem phase drift. Parameter sweeps cover near/slower, baseline, far/faster and mirrored crossing engineering cases while retaining TEST_ONLY and non-instructional certification locks.

Mandatory telemetry is exposed for target state, bore state, lead/separation, shot/arrival timing, method provenance, narrative status, provider status and certification flags.

## Adversarial review finding and correction

The second review found that the field named `apparentLeadAngle_rad` was still inherited from the ballistic intercept solver's **shot-origin** angular geometry, while the displayed target state is projected from the separate **camera/eye origin**. With finite camera-to-bore offset those angular relationships are not generally identical.

That semantic/geometry mismatch was treated as a P7 gate failure, not ignored. Commit `569b5155...` now computes `relationship.apparentLeadAngle_rad` from the projected camera-origin target vector versus projected bore vector. The ballistic solver's shot-origin quantity is retained separately as `ballisticShotOriginLeadAngle_rad`, with an explicit `apparentLeadReference` field. CI verifies that the finite origin offset is not silently collapsed.

## Remaining P7 gate

P7 is **not complete**. The current code provides the deterministic debug/control surface and telemetry contract, but the master programme requires an actual developer/debug presentation with usable play/pause/frame-step/slow-motion/timeline scrub plus frame-by-frame visual/narrative QA artefacts. That browser-facing debug surface has not yet been verified.

Acquisition, connection and speed-match events remain HOLD because no authorised predicate/tolerance currently exists. They must not be fabricated merely to fill the visual timeline.

## Exact next action

Locate the existing simulator/UI integration point, build the browser-facing P7 engineering debug panel around the verified control surface, expose the mandated telemetry without altering model state, and generate frame-by-frame QA artefacts for the states that are actually authorised (including shot and pellet arrival). Then perform another adversarial visual/narrative review before any P7 completion decision.
