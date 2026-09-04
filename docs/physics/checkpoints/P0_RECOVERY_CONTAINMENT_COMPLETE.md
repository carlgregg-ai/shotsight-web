# ShotSight Physics Programme — P0 Recovery, Containment & Invalidation

Date: 2026-09-04
Status: **COMPLETE**
Branch: `physics-engine-v1`
Baseline main before programme prompt: `12d43f9bc9e5b2e964b896238b21ac91c47e53f5`
Master-programme commit: `6a29fbc45235e0817570b6c9707a5d419bba5d5c`

## Recovery

The previous staged programme reached Stage 10 and was released, but expert review has now invalidated the instructional-motion certification only. Successful Playbook content, evidence architecture, diagnostics, search, mobile UI and general application structure remain protected unless later physics review shows a specific dependency problem.

## Why the old motion certification is invalid

`playbook-motion.js` is an illustration-first system, not a physical simulator:

- each lesson stores independent hand-authored SVG `target` and `gun` path strings;
- target and gun are animated by separate SVG `animateMotion` elements;
- the target duration is hard-coded to `4.2s`;
- the gun duration is hard-coded to `3.4s`;
- the gun begins `0.65s` later;
- both repeat independently and therefore their relative phase is not constrained by one master physical timeline;
- there is no world-space target state, bore vector, pellet time-of-flight, intercept solver, projection model or physical lead calculation behind those paths.

The previous Stage 6 browser gate verified that motion DOM elements existed, carried attribution/guardrail text and rendered without browser errors. It did not mathematically test line relationship, synchronisation, lead/intercept, gun angular velocity or narrative truth. Passing that test therefore did not establish coaching/physics accuracy.

## Formal invalidation

The former `Stage 6 — Animation / Visual System (COMPLETE)` status is **superseded for instructional-motion accuracy** by this physics programme. It remains historical evidence of UI/browser functionality only.

All existing `.pb-method-motion` gun/target animations are now classified:

`LEGACY_VISUAL — NOT PHYSICS-VALIDATED — DO NOT USE AS MODEL GROUND TRUTH`

Their source-attributed coaching notes may remain useful as evidence inputs, but the path geometry/timing itself must not be inherited by the new engine.

## Containment decision

The new physics engine will be developed on `physics-engine-v1` so the validated UI/content architecture is protected while scientific work proceeds. The programme should evaluate a minimal live-site containment change: suppress or clearly hold the misleading legacy motion panels until replacements pass validation. Such a live/main change must include corresponding browser-test and deployment verification; do not break main merely to hide them quickly.

## Protected assets

Preserve unless specifically invalidated later:

- Playbook content/evidence labels and source register;
- target taxonomy/search vocabulary;
- diagnostic decision architecture;
- mobile/desktop navigation and lesson-sheet UX;
- deployment/hosted parity workflow architecture;
- static lesson text that does not depend on incorrect animation geometry.

Static schematics are not automatically certified by this checkpoint; they must be reviewed if they imply physical geometry.

## P0 red-team finding

The key systemic failure was a QA-category error: technical rendering success was treated as sufficient evidence of instructional-motion correctness. The new programme must keep DOM/product QA separate from physics, numerical, frame-by-frame and narrative QA.

## Exit criteria

- Current repository state inspected: PASS.
- Legacy motion architecture inspected: PASS.
- Previous visual certification explicitly invalidated: PASS.
- Successful unrelated work protected: PASS.
- Safe development branch created: PASS.
- Master controlling prompt persisted: PASS.
- Exact next stage identified: PASS.

**P0 COMPLETE. Next: P1 — Evidence / Parameter Register.**
