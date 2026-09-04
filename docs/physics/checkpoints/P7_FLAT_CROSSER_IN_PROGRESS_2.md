# P7 — Canonical Flat-Crosser Integrated Simulator — IN PROGRESS checkpoint 2

Date: 2026-09-04
Branch: `physics-engine-v1`
Parent verified checkpoint: `P7_FLAT_CROSSER_IN_PROGRESS_1.md`

## This tranche

Added a deterministic engineering debug/scrub control surface around `simulateCanonicalFlatCrosser()` without changing the underlying physical state generation.

The control policy is deliberately master-clock based:

- frame stepping maps `frameIndex -> t = frameIndex / frameRate` directly;
- timeline scrubbing reconstructs state from the requested master time rather than incrementally advancing independent subsystems;
- playback/slow-motion changes only screen-time to simulation-time mapping;
- returning to an earlier/later scrub time must reconstruct the same complete simulation state;
- long conceptual playback uses direct frame-index time mapping to avoid accumulated phase drift.

The engineering telemetry surface exposes target position/range/speed/apparent angles/LOS angular velocity, bore direction/apparent angles/angular speed, signed apparent separation, physical/apparent lead, shot time, pellet TOF/arrival, intercept validity, method/evidence status, narrative events, provider status and certification flags.

Added parameter-sweep QA for near/slower, baseline, far/faster and mirrored crossing engineering cases. These remain TEST_ONLY/non-instructional and are not realistic-clay certification.

## Scientific boundary

No target aerodynamic coefficient, target spin, dense-shot-cloud correction, sporting-load behaviour or method-transition tolerance was introduced. `realisticClay=false` and `instructionalMotion=false` remain mandatory. Playback controls cannot alter geometry to improve appearance.

## Verification status

Repository commit and GitHub Actions verification are required before this checkpoint can be treated as a verified sub-gate. If CI is green, the remaining P7 gate is frame-by-frame QA artefact generation plus adversarial second review and completion decision.

## Exact next action

After verifying CI, generate frame-by-frame QA artefacts at the authorised timeline states (release/current target state, shot, pellet arrival, follow-through sample) while explicitly marking acquisition/connection/speed-match states HOLD where no authorised predicate exists. Then perform an adversarial P7 review against the master programme and either close P7 or persist the exact failed gate.
