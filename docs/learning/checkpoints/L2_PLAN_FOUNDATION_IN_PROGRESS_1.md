# L2 Pickup / Hold / Connection / Break Planning — In Progress 1

Date: 2026-09-05
Branch: `virtual-shooter-v1`
Status: IN PROGRESS — FOUNDATIONAL LEARNER-SIDE PLAN REPRESENTATION IMPLEMENTED, CI VERIFICATION PENDING

## Governing question

Can the perception-limited shooter form a useful pre-shot plan in apparent angular space from its uncertain target belief, without receiving target XYZ, true range, exact future trajectory, pellet time-of-flight, metric lead or mathematical intercept?

## Implemented this checkpoint

- Added `learning/shot-plan-v1.mjs` as a learner-side planning module with no physics/oracle imports.
- Added explicit uncertain angular regions for visual pickup, gun hold, target/barrel connection and intended break.
- Added expected apparent move-tempo band and method as a planning variable.
- Added evidence-labelled source priors plus a deliberately neutral blank-slate control.
- Added a structure-only plan score for topology/runway/execution-window/visibility/remaining-window inspection. It is explicitly NOT an oracle hit/lead score.
- Added `tests/virtual-shooter-shot-plan-v1.mjs` and wired it into the virtual-shooter CI gate.

## Evidence basis retained

- CPSA: visual pickup, gun hold and break area are distinct; Sporting hold is between pickup and break and should preserve target visibility/reaction time. DIRECT.
- Ben Husthwaite: feet/hold/kill/method/speed/lead form an interacting plan; deliberate hold-point/method experimentation and learning from misses are part of training. DIRECT.
- Don Currie / NSCA: pickup/hold/break are explicit pre-shot elements; half-to-two-thirds runway for long crossers is retained only as presentation-specific coach evidence, not a universal law. DIRECT.
- The numerical normalised progress coordinates in `L2_SOURCE_PRIORS_V1` are SHOTSIGHT_HYPOTHESIS / SYNTHESIS initialisation values. They are not human timing, exact lead, or certified method kinematics.

## Important scientific boundary

This L2 foundation does not claim that a structurally neat plan will break a target. It only makes the planning variables explicit and auditable so later experiments can compare source-informed priors with blank-slate learning under the same perception-limited observations. The plan remains a fuzzy belief-space object.

## Physics inheritance / holds

The inherited physics programme remains `BLOCKED_EXTERNAL` at P11 and explicitly does not certify realistic clay aerodynamics, dense shot-cloud realism, or expert method transition tolerances. L2 therefore remains a learning-architecture experiment in a provisional world model.

## Next gate

1. Obtain green CI for the new planner boundary/topology tests.
2. Then build an L2 held-out crosser planning benchmark from real `MULTIFAMILY_BELIEF_V1` outputs rather than a synthetic belief fixture.
3. Compare source-prior and blank-slate plans on perception-only acquisition/runway/control metrics without oracle intercept/lead scoring.
4. Vary observation quality and apparent speed to test whether plan regions adapt rather than remaining decorative constants.
5. Do not close L2 until planning influences a later motor/trigger experiment and demonstrates useful held-out behaviour.
