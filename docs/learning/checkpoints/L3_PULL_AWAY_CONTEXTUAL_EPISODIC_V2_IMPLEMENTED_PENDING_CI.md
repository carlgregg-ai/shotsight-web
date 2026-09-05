# ShotSight Virtual Shooter — L3 Pull-Away Contextual/Episodic V2 Implemented, Pending CI

Date: 2026-09-05
Status: IMPLEMENTED; CI PENDING

## Resume point

The verified V1 contextual/episodic result remains negative: contextual memory tied context-free memory at 1/244 on development-heldout and did not establish transferable learning.

The revision-decision gate is now verified green in CI run `33993866449` at HEAD `d3e7ae5d087734b140ffba170c5522c6bd7cec1d`. It preserves the V1 negative finding and requires a revised memory architecture before replication or 100k scale.

## V2 implementation

A new learner-side memory has been added:

- `learning/pull-away-contextual-episodic-memory-v2.mjs`
- `learning/pull-away-contextual-episodic-evaluation-v2.mjs`
- `tests/virtual-shooter-pull-away-contextual-episodic-v2.mjs`

V2 replaces hard categorical context buckets with similarity-weighted episodic recall. Remembered learner-visible features are limited to:

- early perceived direction;
- apparent speed band;
- Human Vision acquisition phase;
- visual confidence;
- acquisition score;
- observation span;
- selected visual relationship;
- binary hit/miss outcome.

The learner memory imports only the anti-cheat boundary module. It does not import target generation, physics, ballistics, oracle/referee evaluation or Human Vision generation.

## Scientific intent

V1 produced only two training context buckets and four held-out unseen-context backoffs. V2 tests the falsifiable hypothesis that continuous/similarity-weighted recall can generalise across related learner-visible experiences without memorising target identity or receiving oracle geometry.

The V2 development gate uses distinct non-sealed train/calibration/development-heldout populations and compares V2 contextual memory with the existing context-free memory and no-memory uniform exploration.

The gate accepts either a positive or negative scientific result. CI success means the experiment executed and the anti-cheat/test invariants held; it does not by itself mean V2 learned.

## Hard boundaries

All scoring remains `ENGINEERING_CENTRELINE_DISC_PROXY_NOT_REAL_BREAK_PROBABILITY` with the 55 mm centreline-disc proxy. Realistic clay and dense shot-cloud validation remain held externally in the inherited physics programme.

Forbidden learner information remains target seed/id, exact range, future path, intercept, pellet TOF, miss vector/distance, required lead, oracle action and referee gradients.

No 100k scaling is authorised.

## Current CI

Workflow run `33994405989` at HEAD `b9e62feed877054afd0995b1aeddf8ca77e6aa6e` is executing the full L0->L3 chain and new V2 gate.

## Next operation

Inspect CI run `33994405989`. If it fails, diagnose without weakening safeguards. If it succeeds, read the V2 gate output and create either a positive held-out-advantage checkpoint or a preserved no-advantage/diagnostic checkpoint, then update `VIRTUAL_SHOOTER_STATE.json` accordingly.
