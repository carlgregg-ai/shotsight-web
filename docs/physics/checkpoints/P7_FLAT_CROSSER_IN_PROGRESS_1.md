# P7 — Canonical Flat-Crosser Integrated Simulator — IN PROGRESS checkpoint 1

Date: 2026-09-04
Branch: `physics-engine-v1`
Implementation commit: `fec114e2f0ec2b0510e3a41399333ca92b3789e4`
GitHub Actions: `33876527619` — **SUCCESS**

## Completed in this tranche

Created `physics/canonical-flat-crosser-v1.mjs` as an integration proof that reads target, ballistics/intercept, camera projection, bore state, method provenance and narrative from a single simulation time `t_s`.

The proof is intentionally hard-labelled `ENGINEERING_PROOF_NOT_REALISTIC_CLAY_CERTIFICATION`. Its ballistic provider is intentionally hard-labelled `TEST_ONLY_NOT_INSTRUCTIONAL`. P7 v1 refuses a provider with any other status, preventing this harness from being promoted accidentally into instructional motion.

Verified behaviour includes:

- deterministic replay at the same master time;
- constant-velocity target state derived from that time;
- intercept-derived physical and apparent lead rather than canned pixel separation;
- shooter/camera projection using the corrected P5 right-handed camera convention;
- bore angular-rate calculation from neighbouring master-clock states;
- source-attributed method provenance without executable coaching thresholds;
- shot-time intercept and pellet-arrival narrative ordering;
- no decorative BREAK event;
- explicit certification flags that realistic clay and instructional motion are false.

`tests/physics-canonical-flat-crosser-v1.mjs` passed as part of full physics CI run `33876527619`; all P3–P6 regression suites remained green.

## Scientific boundary

This is **not** a P7 completion claim. The current crosser uses a constant-velocity target and test-only constant-speed pellet provider. It proves architecture and shared-clock integration only. It does not validate real target deceleration/aerodynamics, dense shot-cloud physics, realistic gun method timing or expert-grade visual motion.

## Remaining P7 gate work

- create the required developer/debug presentation with play, pause, frame-step, slow motion and timeline scrub;
- expose all mandated telemetry in a usable engineering view;
- add documented scenario sweeps across several ranges/crossing angles/speeds while preserving TEST_ONLY status;
- add no-phase-drift/property checks across long playback/scrubbing;
- create frame-by-frame QA artefacts for acquisition/gun-start/relationship/shot/arrival/follow-through states where those events are actually authorised;
- keep MATCH/CONNECTION and source-method transition labels held unless provenance-backed predicates exist;
- perform adversarial second review before any P7 completion decision.

## Exact next action

Build the P7 engineering debug/scrub surface around `simulateCanonicalFlatCrosser()` without modifying the underlying physics state to make the display look better. Add parameter-sweep and scrub determinism tests before considering P7 complete.
