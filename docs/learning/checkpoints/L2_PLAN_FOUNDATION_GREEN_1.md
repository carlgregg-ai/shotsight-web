# L2 Pickup / Hold / Connection / Break Planning — Green Foundation 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: GREEN FOUNDATION — PLANNING REPRESENTATION AND ANTI-LEAKAGE/TOPOLOGY GATE PASSED

## Verified result

GitHub Actions run `33945843989` completed SUCCESS with all prior L0/L1 gates plus the new `virtual-shooter-shot-plan-v1` gate green.

The learner-side planner now forms uncertain angular regions for visual pickup, gun hold, target/barrel connection and intended break from `MULTIFAMILY_BELIEF_V1` only. It has no physics/oracle imports and exposes no target XYZ, exact range, metric lead, pellet TOF or mathematical intercept.

Three method-labelled plans are represented as distinct source-informed starting priors, while a method-agnostic blank-slate initialisation is retained as a control. Their numerical normalised progress coordinates remain SHOTSIGHT_HYPOTHESIS / SYNTHESIS values; they are not certified human timing or lead rules.

## Source evidence retained

- CPSA DIRECT: visual pickup, gun hold and break area are distinct; Sporting hold should sit between pickup and break while preserving target visibility/reaction time.
- Ben Husthwaite DIRECT: hold point, kill point, method and gun speed interact; deliberate hold-point/method variation and learning from misses are legitimate training variables.
- Don Currie / NSCA DIRECT: pickup/hold/break are explicit pre-shot elements; the long-crosser half-to-two-thirds runway guidance remains presentation-specific coaching evidence, not universal truth.

## Important limit

This is not evidence that the plans break targets. The current structure score evaluates only internal planning topology/runway/visibility proxies in perception space. It does not reward closeness to oracle lead and cannot certify a shooting method.

## Next experiment now implemented

`learning/planning-evaluation-v1.mjs` and `tests/virtual-shooter-planning-evaluation-v1.mjs` extend L2 onto a held-out crosser bank using real `MULTIFAMILY_BELIEF_V1` outputs. The new gate tests whether source-informed plans adapt to degraded perception and remain method-distinct, while the blank-slate control remains perception-insensitive at initialisation. CI verification of that adaptation benchmark is the next gate.

## Physics inheritance

The inherited physics programme remains blocked at P11 external expert review and does not certify realistic clay aerodynamics, dense shot-cloud realism or expert method transition tolerances. L2 remains a learning-architecture experiment in a provisional world.
