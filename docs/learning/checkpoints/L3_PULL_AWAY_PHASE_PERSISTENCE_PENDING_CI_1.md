# L3 Pull-Away Phase Persistence — Pending CI 1

## Status

`PENDING_AUTHORITATIVE_CI` — do not treat this as a verified green checkpoint yet.

## Finding

While preparing the first human-vision-constrained pull-away episode runner, a learner-side method-state flaw was identified in the otherwise green Human Vision policy boundary.

The initial policy inferred method phase only from instantaneous geometry. Once the gun had legitimately connected, matched speed and begun to develop separation, moving beyond the original connection tolerance could make the stateless policy fall back to `CONNECT`. That could command the gun back toward the target and undo the pull-away it had just started.

This is a controller/state-machine defect, not evidence that connection tolerances should be widened. No tolerance was relaxed and no hit/reward information was used to discover or fix it.

## Fix

`learning/pull-away-human-vision-policy-v1.mjs` now accepts the learner's own `previousPhase` and preserves `DEVELOP_SEPARATION` once connection + speed match have legitimately committed the pull-away phase.

Rules:

- phase persistence uses only Ellis's own prior method state;
- it contains no oracle target state, lead, miss vector, range or ballistic information;
- current visual loss always overrides persistence and resets to `WAIT_FOR_ACQUISITION`;
- reacquisition cannot continue a hidden extrapolated separation command;
- trigger still requires current `TRACKING` evidence plus the learner-visible developed forward relationship.

`tests/virtual-shooter-pull-away-human-vision-policy-v1.mjs` now explicitly checks:

1. separation persists after leaving the original connection tolerance;
2. the command remains forward rather than returning to the clay;
3. trigger readiness follows a persisted separation phase;
4. visual loss resets the phase and prevents trigger.

## Current unverified HEAD

- code commit: `445793c150617bf726ce83cb8736eef15bcebe27`
- expanded-test commit: `5cf6c2538c5a17358ba59382ce67979429eb8057`
- workflow run for test HEAD: `33976912209`
- status when this note was written: in progress

## Resume rule

At the next execution, inspect workflow run `33976912209` / current branch HEAD first.

- If green: supersede the earlier policy checkpoint with a verified phase-persistent policy checkpoint, update durable state, then build the human-vision pull-away reward-support episode runner.
- If red: diagnose the exact failing step and repair it without loosening anti-cheat, acquisition or method-topology safeguards.

Do not begin large-scale learning or tune policy thresholds against oracle outcomes until this phase-state fix is verified.
