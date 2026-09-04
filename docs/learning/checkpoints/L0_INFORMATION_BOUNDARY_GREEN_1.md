# L0 Information Boundary — Green Checkpoint 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: VERIFIED GREEN

## Governing rule

**ORACLE KNOWS. SHOOTER PERCEIVES, BELIEVES, ACTS, REMEMBERS AND LEARNS.**

## Completed in this checkpoint

- Added `learning/virtual-shooter-boundary-v1.mjs` as the first hard oracle/shooter boundary.
- Defined an explicit allow-list for `SHOOTER_OBSERVATION_V1`.
- Defined a fail-closed privileged-field deny list covering exact target position/velocity/range, exact intercept/lead, pellet TOF/arrival, oracle action/class and hidden miss vector.
- Added recursive nested-object leakage detection so privileged data cannot be hidden inside memory/belief subobjects.
- Added delayed/noisy angular observations with deterministic seeded sensory noise for reproducible experiments.
- Added deliberately broad target-family belief output rather than copying oracle scenario identity.
- Added a minimal naive perception baseline using only ShooterObservation data.
- Added anti-cheat audit output with privileged-field access count.
- Added adversarial tests in `tests/virtual-shooter-boundary-v1.mjs`.
- Added dedicated `virtual-shooter-v1` CI workflow.

## Verification

GitHub Actions workflow: `ShotSight virtual shooter`
Run: `33931377004`
Head: `730453fe3b9a20a2a6d8020833d836dc113811cd`
Conclusion: **SUCCESS**

Verified behaviours:
- oracle/shooter structural separation;
- observation latency is enforced;
- perception noise is reproducible by seed;
- naive belief consumes shooter-safe data only;
- nested privileged-state probes fail closed;
- extra unapproved observation fields fail closed.

## Important scientific constraint discovered

The inherited `canonical-flat-crosser-v1.mjs` is explicitly an engineering oracle. It contains exact target XYZ/velocity, physical lead, intercept state and pellet timing and uses `ENGINEERING_INTERCEPT_REFERENCE`. It is therefore suitable as hidden world/reference truth only and must never be imported directly into learner policy code.

The inherited target engine also explicitly holds realistic clay aerodynamics pending verified/calibrated coefficients. The first virtual-shooter crosser experiments must therefore be labelled as experiments inside the current validated/provisional world model, not real-world clay-flight proof.

## Coaching evidence checked this run

- CPSA English Sporting guidance confirms that no single Sporting hold-point rule fits all presentations; visual pickup is where the target is first clearly seen, while gun hold should avoid both being so close that the target beats the barrels and so far out that useful movement is exhausted.
- CPSA Clay Target Shooter's Handbook separates visual pickup point, gun hold point and target pickup point, explicitly notes reaction time, target visibility above the barrels, and that target pickup can be on/ahead/behind depending on method.
- Don Currie / NSCA Long Crossers gives a coach-specific flat-crosser starting heuristic of roughly half to two-thirds back from break point toward the trap, followed by speed match, brief insertion and separation. This remains a source prior, not a universal answer.
- Brett Winstanley-specific hold/pickup/break doctrine was not recovered to source quality in this run; no new claim is attributed to him.

## Negative findings / safeguards

- Do not use current canonical crosser's exact physical lead as a learning target or reward term.
- Do not allow scenario ID or oracle target class to pass through the observation adapter.
- Do not call current target world realistic clay certification.
- Do not hard-code the CPSA or NSCA hold-point examples as the correct answer.

## Next verified action

Continue L0 by creating a strict oracle evaluation facade and two baselines on the same hidden scenarios:
1. privileged oracle ceiling (evaluation only);
2. naive perception-limited shooter baseline with no learning.

Then prove in CI that learner-facing modules cannot import/access privileged oracle/reference fields and establish baseline metrics before L1 learning begins.
