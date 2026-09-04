# ShotSight P6 — Method Evidence Recovery / State-Machine Entry Checkpoint

Date: 2026-09-04
Status: **IN_PROGRESS**
Branch: `physics-engine-v1`

## Purpose

P6 has started by re-reading the existing certified Playbook evidence-bearing content before writing any method state machine. The goal is to prevent conceptual state diagrams from being promoted into numerical coaching behaviour without source permission.

## Existing architecture recovered

The Stage 3 content model explicitly defines `method_option` as an **attributed coaching method with claim/evidence references** and forbids technical method inheritance merely because two targets share a family. Unknown/ambiguous geometry is a valid state and must not be guessed.

The representative Playbook dataset preserves evidence labels `DIRECT`, `SYNTHESIS`, `SHOTSIGHT_HYPOTHESIS`, `HOLD_DEMOTE` and includes source keys on method claims.

## Source-attributed method statements currently usable as P6 evidence inputs

The following are recovered from the certified representative dataset. They are evidence **inputs**, not yet numerical kinematic implementations:

### Flat / long crosser

- `CPSA_S3` — pull-away, swing-through and maintained lead are recognised CPSA methods; ShotSight must present them as options rather than a universal answer. `DIRECT`.
- `NSCA_LONG_CROSSER` — Don Currie/NSCA long-crosser pull-away protocol includes a useful runway, leading-edge focus, speed match and smooth separation. `DIRECT`.
- Existing hold: do not claim maintained lead is always best when target is visible early.

### Quartering away

- `OSP_QUARTER` — OSP early-move quartering approach exists and must remain attributed, not universal. `DIRECT`.
- `NSCA_ALWAYS_BEHIND` — Don Currie describes a quartering/come-to-gun solution for a specific fast-quarterer/behind context with defined hold and pickup. `DIRECT`.

### Low fast incomer / cutoff

- `NSCA_CUTOFF`, `NSCA_OCCLUSION` — source-attributed cutoff approach for the relevant changing incoming/quartering presentation; offset/closer hold and slightly upward approach preserving target visibility. `DIRECT`.
- `SHOTKAM_IN` — Josh Brown/TGS/ShotKam supports explicit pickup, hold and kill-point planning and keeping the gun below a descending target. `DIRECT`.
- Existing hold: do not apply the late intercept-from-below prescription to every incomer.

### Chandelle / looper

- `NSCA_CH` — commit to a break point, leading-edge focus, match gun and target speed, avoid tracing the whole arc. `DIRECT`.
- `NSCA_CH` + `NSCA_OCCLUSION` — descending-break upward/offset approach may preserve visibility. `DIRECT`.
- Rise/apex/descent as separate phases is `SYNTHESIS`, not a single sourced universal technique.

### Rising teal under power

- `NSCA_TEAL` — source distinguishes near-peak teal from outgoing teal shot under power. `DIRECT`.
- `NSCA_TEAL` — outgoing-under-power case uses a pass-through move with source-specific hold-point guidance. `DIRECT`.
- `ORVIS_TEAL`, `DU_MATARESE`, `NSCA_TEAL` — other expert approaches differ by teal context; disagreement must remain visible. `SYNTHESIS`.

### Driven incoming

- `NSCA_DRIVEN` — Don Currie/NSCA teaches pass-through/swing-through with visual connection before the pass-through move. `DIRECT`.
- `DU_MATARESE` + `NSCA_DRIVEN` — timed mount/connection followed by controlled separation is a defensible synthesis, but exact method depends on incoming vs passing geometry. `SYNTHESIS`.

### Rabbit

- `NSCA_RABBIT` — broad crossing rabbit has a source-specific let-it-beat-the-muzzle then move-to-nose/front-foot method; slow/quartering rabbit variants may use different approaches. `DIRECT`.
- Rabbit physics itself remains on HOLD pending ground-contact validation, so no physical rabbit simulator method may be certified merely from this coaching evidence.

## Numerical events that remain HOLD

P6 must not invent thresholds for:

- `SPEED_MATCH` tolerance;
- `CONNECTION` distance/angle/timing tolerance;
- exact moment at which a named pull-away becomes `SEPARATION`;
- expert gun angular-speed/acceleration bounds;
- universal lead-gap thresholds;
- universal mount timing;
- any source-specific hold-point converted from coaching wording into metres/degrees without source/calibration support.

These events may only be emitted in an instructional mode when their predicate has a provenance-backed definition/tolerance. Until then they must be `HOLD`, or in isolated engineering tests `TEST_ONLY` / `SHOTSIGHT_HYPOTHESIS`.

## Invariant events that can be implemented without inventing coaching thresholds

P6 may safely implement mathematical facts that follow directly from state:

- relative angular separation sign in a declared tangent/screen basis;
- whether magnitude of separation is increasing/decreasing over an interval;
- sign crossing (`PASS_THROUGH_CANDIDATE`) when a declared signed relative angle crosses zero;
- shot event at the supplied scenario shot time;
- pellet-arrival event after the ballistic provider's computed TOF;
- narrative prohibition: `BREAK` cannot precede pellet arrival;
- deterministic state ordering on the master clock.

These are not by themselves proof that a coach would label the movement pull-away, swing-through, connection or match.

## P6 implementation strategy

1. Create a method-evidence contract whose method ID carries source keys, evidence classification, applicability selector and unresolved predicate holds.
2. Create a neutral relative-motion event engine for invariant mathematical events.
3. Create method state machines that consume explicit externally supplied/sourced predicates rather than hiding numeric thresholds in code.
4. Fail closed if an instructional method requests `MATCH` or `CONNECTION` without an authorised predicate definition.
5. Test method/physics separation: method code cannot alter target state, pellet TOF or intercept result.
6. Preserve disagreement by allowing multiple source-attributed method providers for the same physical presentation.

## Next exact action

Implement the P6 evidence-contract and invariant relative-motion/narrative event core with `TEST_ONLY` fixtures. Do not encode any numerical `MATCH`, `CONNECTION`, human gun-speed or source-specific hold-point threshold yet.
