# P6 — Shooting-Method State Machines & Narrative Engine v1 — COMPLETE

Date: 2026-09-04
Branch: `physics-engine-v1`
Verified implementation commit: `e6c58d536e7094691387c5a96273569ce50ab28c`
GitHub Actions: `33876221594` — **SUCCESS**

## Exit decision

**P6 COMPLETE.** ShotSight now has a source-attributed, fail-closed method/narrative infrastructure suitable for entering the P7 canonical integration gate. Completion does **not** mean that unresolved coaching-language concepts have been converted into invented numerical thresholds.

## Verified outputs

- `physics/method-narrative-v1.mjs` separates mathematical relative-motion facts from coaching assertions.
- `physics/method-registry-v1.mjs` records recognised/source-specific methods and applicability without silently creating executable method thresholds.
- CPSA pull-away, swing-through and maintained-lead recognition is preserved as method recognition, not universal prescription.
- Source-specific long-crosser pull-away, powered-teal pass-through and driven pass-through contexts are retained with source IDs already used by the certified Playbook evidence set.
- Sign crossing is exposed only as `passThroughCandidate`; it does not automatically become a coaching `PASS_THROUGH` event.
- `SPEED_MATCH`, `CONNECTION`, `PASS_THROUGH` and other threshold-dependent labels fail closed unless an authorised predicate is supplied.
- Shot → pellet-arrival ordering is derived from one event timeline; break remains held unless an authorised hit predicate exists.
- Unknown/unsupported method IDs are rejected.

## QA

Scratch execution of the new method-registry validation passed before branch update. The complete GitHub physics workflow then passed at run `33876221594`, including P3 target physics, P4 ballistics/intercept, P5 projection/gun kinematics, P6 narrative fail-closed tests and the new source-attributed registry test.

## Deliberate HOLDs carried forward

- numerical speed-match tolerance;
- numerical connection definition;
- method transition thresholds;
- empirical human gun angular-speed/acceleration bounds;
- source-specific hold-point conversion to world/angular geometry where calibration is absent;
- any assertion that a recognised method is universally preferred.

These are not required to prove the P6 infrastructure; they remain required before those specific labels can be asserted numerically in instructional simulation.

## P7 entry condition

P7 may now integrate a **canonical engineering flat-crosser proof case** using only already-verified components and explicitly TEST_ONLY/analytic scenario providers where realistic clay aerodynamics or dense shot-cloud physics remain held. Such a proof case may verify shared-clock geometry, projection, interception and narrative plumbing, but it must not be described as realistic clay-flight certification or production instructional motion.

## Exact next action

Build the P7 flat-crosser integrated simulator/harness with one master `t`, deterministic target state, provider-based ballistic TOF/intercept, shooter-view projection, bore/gun state, source-attributed method contract and narrative events. Expose numerical debug state and test deterministic replay, shared-clock/no-drift, analytic intercept consistency, projection consistency, event ordering and fail-closed method labels.
